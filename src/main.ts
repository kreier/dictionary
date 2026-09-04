import "./style.css";
import {
    CATEGORIES,
    type Category,
    type DictionaryEntry,
    type PendingEdit,
    type SubmissionPayload
} from "./types";
import { initAppShell } from "./template";
import { renderDiffCard, escapeHtml } from "./diff";
import { loadTurnstile, TURNSTILE_SITE_KEY } from "./turnstile";
import {
    fetchLanguages,
    fetchDictionary,
    submitChanges,
    DEFAULT_WORKER_ENDPOINT
} from "./api";
import { getReferenceLinksForEntry, parseAllBibleReferences } from "./links";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
    throw new Error("Could not find #app");
}

const dom = initAppShell(app);

/*
 * State Management
 */

let entries: DictionaryEntry[] = [];
let filteredEntries: DictionaryEntry[] = [];
let currentLanguage = "";
let currentIndex = 0;
let currentCategory: Category = "text";
let editMode = false;
let editorName = localStorage.getItem("dictionary_editor_name") || "";

const pendingEdits = new Map<string, PendingEdit>();

let turnstileWidgetId: string | undefined;
let turnstileToken: string | null = null;

const workerEndpoint =
    localStorage.getItem("dictionary_worker_url") ||
    DEFAULT_WORKER_ENDPOINT;

interface ScriptureVerse {
    reference: string;
    book?: string;
    chapter?: number;
    verse?: number;
    en: string;
    vi?: string;
    [key: string]: string | number | undefined;
}

interface RenderedScripture {
    refLabel: string;
    enHtml: string;
    targetHtml: string;
}

let scripturesData: Record<string, ScriptureVerse> | null = null;
let scripturesLoading = false;

async function loadScriptures(): Promise<Record<string, ScriptureVerse> | null> {
    if (scripturesData) return scripturesData;
    if (scripturesLoading) return null;
    scripturesLoading = true;
    try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/scriptures.json`);
        if (res.ok) {
            scripturesData = await res.json();
        }
    } catch (e) {
        console.warn("Failed to load scriptures.json", e);
    } finally {
        scripturesLoading = false;
    }
    return scripturesData;
}

function extractHighlightTerms(entryText?: string, entryKey?: string): string[] {
    if (!entryText && !entryKey) return [];
    const terms: string[] = [];

    if (entryText) {
        const fnMatch = entryText.match(/^\s*\d+\)\s*([^:]+):/);
        if (fnMatch) {
            const raw = fnMatch[1].trim();
            const bracketMatch = raw.match(/^([^\[]+)\[([^\]]+)\]/);
            if (bracketMatch) {
                terms.push(bracketMatch[1].trim());
                terms.push(bracketMatch[2].trim());
            } else {
                terms.push(raw);
            }
        } else {
            // Split comma-separated names like Barak, Deborah, Jael
            const parts = entryText.split(",").map(s => s.trim()).filter(Boolean);
            for (const part of parts) {
                const subparts = part.split(/[\/(]/).map(s => s.replace(/[),;]/g, "").trim()).filter(Boolean);
                terms.push(...subparts);
            }
        }
    }

    if (entryKey) {
        const cleanKey = entryKey.replace(/_fn$/, "").replace(/\d+$/, "").replace(/_/g, " ").trim();
        if (cleanKey) terms.push(cleanKey);
    }

    const expanded: string[] = [];
    for (const t of terms) {
        if (!t) continue;
        expanded.push(t);
        const stripped = t.replace(/['’ʹ·\u0323]/g, "");
        if (stripped !== t) expanded.push(stripped);

        if (stripped.endsWith("ians")) {
            expanded.push(stripped.slice(0, -4));
            expanded.push(stripped.slice(0, -1));
        } else if (stripped.endsWith("ian")) {
            expanded.push(stripped.slice(0, -3));
        } else if (stripped.endsWith("ites")) {
            expanded.push(stripped.slice(0, -4));
            expanded.push(stripped.slice(0, -1));
        } else if (stripped.endsWith("ite")) {
            expanded.push(stripped.slice(0, -3));
        } else if (stripped.endsWith("er") && stripped.length > 4) {
            expanded.push(stripped.slice(0, -2));
            expanded.push(stripped.slice(0, -2) + "en");
        }

        // Russian / Slavic noun declension variations
        if (/[\u0400-\u04ff]/.test(stripped) && stripped.length > 3) {
            const base = stripped.replace(/[аяоеыиуеё]$/i, "");
            for (const ending of ["а", "у", "е", "ы", "ом", "я", "ю", "ем", ""]) {
                expanded.push(base + ending);
            }
        }

        const viPrefix = stripped.match(/^(?:Người|Dân)\s+(.+)$/i);
        if (viPrefix) {
            expanded.push(viPrefix[1].trim());
        }
    }

    return Array.from(new Set(expanded.filter(s => s && s.length > 1)));
}

function buildTermPattern(rawWord: string): string {
    const pronMarks = "['’ʹ·\\u02b9\\u00b4\\u0323]?";
    const normalized = rawWord.replace(/['’ʹ·]/g, "").normalize("NFD");
    const baseLetters = normalized.replace(/[\u0323\u0307]/g, "");
    const charPatterns: string[] = [];
    for (const ch of baseLetters) {
        if (/[\u0300-\u036f\u064b-\u065f\u0981-\u09cd\u09d7]/.test(ch)) {
            charPatterns.push(`(?:${ch})?${pronMarks}`);
            continue;
        }
        if (/[a-zA-Z\u00c0-\u024f\u0400-\u04ff\u0600-\u06ff\u0980-\u09ff\u1e00-\u1eff]/.test(ch)) {
            const upper = ch.toUpperCase();
            const lower = ch.toLowerCase();
            charPatterns.push(`(?:[${upper}${lower}][\\u0300-\\u036f\\u064b-\\u065f\u0981-\\u09cd\u09d7]?)${pronMarks}`);
        } else {
            const escapedChar = ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            charPatterns.push(`${escapedChar}${pronMarks}`);
        }
    }
    return `(?:\\b|(?<=[\\s^['"\\(]))(${charPatterns.join("")})(?:\\b|(?=[\\s.,;:!?'"\\)]|$))`;
}

function highlightScriptureWords(text: string, terms: string[]): string {
    let escapedText = escapeHtml(text);
    if (!terms || terms.length === 0) return escapedText;

    const sortedTerms = [...terms].sort((a, b) => b.length - a.length);

    for (const term of sortedTerms) {
        if (!term || term.length < 2) continue;
        const pattern = buildTermPattern(term);
        try {
            const regex = new RegExp(pattern, "giu");
            escapedText = escapedText.replace(regex, '<mark class="scripture-highlight">$1</mark>');
        } catch {
            const direct = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            try {
                const fb = new RegExp(`(\\b${direct}\\b)`, "gi");
                escapedText = escapedText.replace(fb, '<mark class="scripture-highlight">$1</mark>');
            } catch {}
        }
    }

    return escapedText;
}

function findScriptureForEntry(
    notes: string | undefined,
    lang: string,
    englishWord?: string,
    targetWord?: string,
    entryKey?: string
): RenderedScripture | null {
    if (!scripturesData) return null;

    const parsedRefs = parseAllBibleReferences(notes, englishWord);
    if (parsedRefs.length === 0) return null;

    const englishTerms = extractHighlightTerms(englishWord, entryKey);
    const targetTerms = extractHighlightTerms(targetWord, entryKey);

    const enParts: string[] = [];
    const targetParts: string[] = [];

    for (const parsedRef of parsedRefs) {
        for (const v of parsedRef.verses) {
            for (const key of Object.keys(scripturesData)) {
                const item = scripturesData[key];
                const itemBookNorm = (item.book || "").toLowerCase().replace(/[\s_]+/g, "-");
                if (
                    item.chapter === parsedRef.chapter &&
                    item.verse === v &&
                    itemBookNorm === parsedRef.bookSlug
                ) {
                    const enHighlighted = highlightScriptureWords(item.en, englishTerms);
                    enParts.push(`<span class="scripture-verse-num">${escapeHtml(item.reference)}:</span> ${enHighlighted}`);

                    const targetRaw = item[lang] ?? (lang === "vi" ? item.vi : "") ?? (lang === "de" ? item.de : "");
                    const targetText = typeof targetRaw === "string" ? targetRaw.trim() : "";
                    if (targetText) {
                        const targetHighlighted = highlightScriptureWords(targetText, targetTerms);
                        targetParts.push(`<span class="scripture-verse-num">${escapeHtml(item.reference)}:</span> ${targetHighlighted}`);
                    }
                    break;
                }
            }
        }
    }

    if (enParts.length === 0) return null;

    const fullLabel = parsedRefs.map(r => r.label).join("; ");
    return {
        refLabel: fullLabel,
        enHtml: enParts.join("<br><br>"),
        targetHtml: targetParts.length > 0
            ? targetParts.join("<br><br>")
            : `<span class="scripture-empty">Translation for ${escapeHtml(lang.toUpperCase())} not yet cached for ${escapeHtml(fullLabel)}. Click the reference card below to view on jw.org.</span>`
    };
}


/*
 * Helper alert modal
 */

function showInfoModal(title: string, message: string): void {
    dom.infoModalTitle.textContent = title;
    dom.infoModalMessage.textContent = message;
    dom.infoModal.classList.add("visible");
}

dom.infoModalClose.addEventListener("click", () => {
    dom.infoModal.classList.remove("visible");
});


/*
 * Load available languages
 */

async function loadLanguages(): Promise<void> {
    const languages = await fetchLanguages();

    dom.languageSelect.innerHTML = "";

    for (const language of languages) {
        const option = document.createElement("option");
        option.value = language.key;
        option.textContent = language.language_str;
        dom.languageSelect.appendChild(option);
    }

    // Default to the last entry in languages.json (e.g. Vietnamese)
    if (languages.length > 0) {
        const defaultLanguage = languages[languages.length - 1].key;
        dom.languageSelect.value = defaultLanguage;
        await loadLanguage(defaultLanguage);
    }
}


/*
 * Load one language dictionary
 */

async function loadLanguage(language: string): Promise<void> {
    pendingEdits.clear();
    currentLanguage = language;

    entries = await fetchDictionary(language);

    updateCounts();
    filterAndShow();
    updateEditState();
}


/*
 * Update checked/total counters for every category
 */

function updateCounts(): void {
    for (const category of CATEGORIES) {
        const categoryEntries = entries.filter(
            entry => entry.category === category
        );

        const total = categoryEntries.length;
        const checked = categoryEntries.filter(
            entry => entry.checked === "True"
        ).length;

        const counter = document.getElementById(`count-${category}`);
        if (counter) {
            counter.textContent = `${checked}/${total}`;
        }
    }
}


/*
 * Filter entries by category and search query
 */

function filterAndShow(): void {
    const searchTerm = dom.searchInput.value.trim().toLowerCase();

    filteredEntries = entries.filter(entry => {
        const matchesCategory = entry.category === currentCategory;
        const matchesSearch =
            !searchTerm ||
            entry.key.toLowerCase().includes(searchTerm) ||
            (entry.english ?? "").toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    dom.keySelect.innerHTML = "";

    for (const [index, entry] of filteredEntries.entries()) {
        const option = document.createElement("option");
        option.value = String(index);

        const hasPending = pendingEdits.has(entry.key);
        option.textContent = hasPending ? `✏️ ${entry.key}` : entry.key;

        dom.keySelect.appendChild(option);
    }

    currentIndex = 0;
    showEntry();
}


/*
 * Display the current dictionary entry
 */

function showEntry(): void {
    const entry = filteredEntries[currentIndex];

    if (!entry) {
        clearDisplay();
        return;
    }

    dom.keySelect.value = String(currentIndex);

    // Populate standard or split view
    setBox("english", entry.english);

    const isSplitCategory = ["bible", "A6", "B9", "wiki"].includes(currentCategory);
    if (isSplitCategory) {
        dom.mainContent.classList.add("split-mode");
        dom.notesAndAiBoxes.style.display = "none";
        dom.splitWebRow.style.display = "grid";
        dom.labelText.textContent = `Text (${currentLanguage.toUpperCase()})`;

        if (currentCategory === "bible") {
            const scripture = findScriptureForEntry(entry.notes, currentLanguage, entry.english, entry.text, entry.key);
            if (scripture) {
                dom.splitScriptureRow.style.display = "grid";
                dom.labelScriptureEnglish.textContent = `Scripture Context: ${scripture.refLabel} (English)`;
                dom.scriptureTextEnglish.innerHTML = scripture.enHtml;
                dom.labelScriptureTarget.textContent = `Scripture Context: ${scripture.refLabel} (${currentLanguage.toUpperCase()})`;
                dom.scriptureTextTarget.innerHTML = scripture.targetHtml;
            } else {
                dom.splitScriptureRow.style.display = "none";
            }
        } else {
            dom.splitScriptureRow.style.display = "none";
        }

        const refLinks = getReferenceLinksForEntry(entry, currentLanguage);
        if (refLinks) {
            dom.linkEnglish.href = refLinks.englishUrl;
            dom.linkEnglishTitle.textContent = `${refLinks.label} (English)`;
            dom.linkEnglishUrl.textContent = refLinks.englishUrl;

            dom.linkTarget.href = refLinks.targetUrl;
            dom.linkTargetTitle.textContent = `${refLinks.label} (${currentLanguage.toUpperCase()})`;
            dom.linkTargetUrl.textContent = refLinks.targetUrl;

            dom.labelRefEnglish.textContent = "English Reference";
            dom.labelRefTarget.textContent = `Reference (${currentLanguage.toUpperCase()})`;
        }
    } else {
        dom.mainContent.classList.remove("split-mode");
        dom.notesAndAiBoxes.style.display = "block";
        dom.splitWebRow.style.display = "none";
        dom.splitScriptureRow.style.display = "none";
        dom.labelText.textContent = "Text";

        setBox("google", entry.google);
        setBox("chatgpt", entry.chatgpt);
        setBox("gemini", entry.gemini);
        setBox("claude", entry.claude);
        setBox("deepl", entry.deepl);
    }

    const pending = pendingEdits.get(entry.key);
    if (pending) {
        dom.textInput.value = pending.text;
        dom.notesInput.value = pending.notes;
        dom.boxChecked.checked = pending.checked;
    } else {
        dom.textInput.value = entry.text;
        dom.notesInput.value = entry.notes ?? "";
        dom.boxChecked.checked = entry.checked === "True";
    }

    updateCheckedDisplay(entry);

    dom.prevButton.disabled = currentIndex === 0;
    dom.nextButton.disabled = currentIndex >= filteredEntries.length - 1;

    updateEditButtons();
}

function updateCheckedDisplay(entry: DictionaryEntry): void {
    const isChecked = dom.boxChecked.checked;
    dom.checkedEmoji.textContent = isChecked ? "✅" : "⬜";
    dom.checkedLabel.textContent = isChecked ? "Checked" : "Unchecked";

    if (isChecked) {
        dom.checkedInfo.textContent =
            ` (Verified${entry.checked_by ? ` by ${entry.checked_by}` : ""}${entry.date ? ` on ${entry.date}` : ""})`;
        dom.quickCheckBtn.textContent = "Uncheck ⬜";
        dom.confirmCheckedBtn.textContent = "Unmark Checked ⬜";
    } else {
        dom.checkedInfo.textContent = "";
        dom.quickCheckBtn.textContent = "Confirm ✅";
        dom.confirmCheckedBtn.textContent = "Confirm Translation ✅";
    }
}

function setBox(name: string, value: string | undefined): void {
    const element = document.getElementById(`box-${name}`);
    if (element) {
        element.textContent = value ?? "";
    }
}

function clearDisplay(): void {
    for (const field of [
        "english",
        "google",
        "chatgpt",
        "gemini",
        "claude",
        "deepl"
    ]) {
        setBox(field, "");
    }

    dom.textInput.value = "";
    dom.notesInput.value = "";
    dom.boxChecked.checked = false;

    dom.checkedEmoji.textContent = "⬜";
    dom.checkedLabel.textContent = "Unchecked";
    dom.checkedInfo.textContent = "";

    dom.linkEnglish.href = "#";
    dom.linkEnglishTitle.textContent = "English Website";
    dom.linkEnglishUrl.textContent = "";

    dom.linkTarget.href = "#";
    dom.linkTargetTitle.textContent = "Translation Website";
    dom.linkTargetUrl.textContent = "";

    dom.splitScriptureRow.style.display = "none";
    dom.scriptureTextEnglish.textContent = "";
    dom.scriptureTextTarget.textContent = "";

    dom.prevButton.disabled = true;
    dom.nextButton.disabled = true;
}


/*
 * Edit State and Dirty Tracking
 */

function saveCurrentEntryState(): void {
    if (!editMode) return;

    const entry = filteredEntries[currentIndex];
    if (!entry) return;

    const origText = entry.text;
    const origNotes = entry.notes ?? "";
    const origChecked = entry.checked === "True";

    const currentText = dom.textInput.value;
    const currentNotes = dom.notesInput.value;
    const currentChecked = dom.boxChecked.checked;

    const isModified =
        currentText !== origText ||
        currentNotes !== origNotes ||
        currentChecked !== origChecked;

    if (isModified) {
        pendingEdits.set(entry.key, {
            key: entry.key,
            category: entry.category,
            text: currentText,
            notes: currentNotes,
            checked: currentChecked,
            origText,
            origNotes,
            origChecked
        });
    } else {
        pendingEdits.delete(entry.key);
    }

    updateKeyOptionIndicator(entry.key, isModified);
    updateEditButtons();
}

function updateKeyOptionIndicator(key: string, isModified: boolean): void {
    const opt = Array.from(dom.keySelect.options).find(o => o.text.includes(key));
    if (opt) {
        opt.textContent = isModified ? `✏️ ${key}` : key;
    }
}

function handleInputModification(isTextOrNotes: boolean): void {
    if (!editMode) return;

    const entry = filteredEntries[currentIndex];
    if (!entry) return;

    if (isTextOrNotes && !dom.boxChecked.checked) {
        dom.boxChecked.checked = true;
    }

    updateCheckedDisplay(entry);
    saveCurrentEntryState();
}

function toggleOrConfirmChecked(): void {
    if (!editMode) {
        dom.activationNameInput.value = editorName;
        dom.activationModal.classList.add("visible");
        setTimeout(() => dom.activationNameInput.focus(), 50);
        return;
    }

    const entry = filteredEntries[currentIndex];
    if (!entry) return;

    dom.boxChecked.checked = !dom.boxChecked.checked;
    updateCheckedDisplay(entry);
    saveCurrentEntryState();
}

function enterEditMode(): void {
    editMode = true;

    dom.textInput.readOnly = false;
    dom.notesInput.readOnly = false;
    dom.boxChecked.disabled = false;

    dom.textInput.classList.add("editable");
    dom.notesInput.classList.add("editable");
    dom.checkedToggleLabel.classList.add("editable");

    dom.quickCheckBtn.style.display = "inline-block";
    dom.confirmCheckedBtn.style.display = "flex";

    dom.editButton.textContent = "Exit Edit Mode";
    dom.editButton.classList.add("active");

    updateEditState();
}

function exitEditMode(): void {
    editMode = false;
    pendingEdits.clear();

    dom.textInput.readOnly = true;
    dom.notesInput.readOnly = true;
    dom.boxChecked.disabled = true;

    dom.textInput.classList.remove("editable");
    dom.notesInput.classList.remove("editable");
    dom.checkedToggleLabel.classList.remove("editable");

    dom.quickCheckBtn.style.display = "none";
    dom.confirmCheckedBtn.style.display = "none";

    dom.editButton.textContent = "Enable editing";
    dom.editButton.classList.remove("active");

    filterAndShow();
    updateEditState();
}

function updateEditState(): void {
    if (editMode) {
        const count = pendingEdits.size;
        dom.editStatus.textContent =
            count > 0
                ? `Edit mode active (${editorName}) — ${count} entry/entries modified in ${currentLanguage.toUpperCase()}.`
                : `Edit mode active (${editorName}) — You can edit Text, Notes, and Checked status.`;
        dom.editStatus.classList.add("active");
    } else {
        dom.editStatus.textContent = "Editing is disabled.";
        dom.editStatus.classList.remove("active");
    }

    updateEditButtons();
}

function updateEditButtons(): void {
    const hasAnyChanges = editMode && pendingEdits.size > 0;

    dom.previewButton.disabled = !hasAnyChanges;
    dom.submitButton.disabled = !hasAnyChanges;

    dom.previewButton.textContent =
        pendingEdits.size > 0
            ? `Preview Changes (${pendingEdits.size})`
            : "Preview Changes";

    dom.submitButton.textContent =
        pendingEdits.size > 0
            ? `Submit Changes (${pendingEdits.size})`
            : "Submit Changes";
}

function handleActivationConfirm(): void {
    const name = dom.activationNameInput.value.trim();
    if (!name) {
        dom.activationNameInput.focus();
        dom.activationNameInput.classList.add("input-error");
        return;
    }

    dom.activationNameInput.classList.remove("input-error");
    editorName = name;
    localStorage.setItem("dictionary_editor_name", editorName);
    dom.activationModal.classList.remove("visible");
    enterEditMode();
}


/*
 * Event Listeners
 */

dom.languageSelect.addEventListener("change", () => {
    loadLanguage(dom.languageSelect.value).catch(error => {
        console.error(error);
        clearDisplay();
    });
});

dom.categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        saveCurrentEntryState();

        dom.categoryButtons.forEach(other => other.classList.remove("active"));
        button.classList.add("active");

        currentCategory = button.dataset.cat as Category;
        if (currentCategory === "bible" && !scripturesData) {
            loadScriptures().then(() => {
                if (currentCategory === "bible") {
                    showEntry();
                }
            });
        }
        filterAndShow();
    });
});

dom.searchInput.addEventListener("input", () => {
    saveCurrentEntryState();
    filterAndShow();
});

dom.keySelect.addEventListener("change", () => {
    saveCurrentEntryState();
    currentIndex = Number.parseInt(dom.keySelect.value, 10);
    showEntry();
});

dom.prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
        saveCurrentEntryState();
        currentIndex--;
        showEntry();
    }
});

dom.nextButton.addEventListener("click", () => {
    if (currentIndex < filteredEntries.length - 1) {
        saveCurrentEntryState();
        currentIndex++;
        showEntry();
    }
});

dom.textInput.addEventListener("input", () => handleInputModification(true));
dom.notesInput.addEventListener("input", () => handleInputModification(true));

dom.boxChecked.addEventListener("change", () => {
    const entry = filteredEntries[currentIndex];
    if (entry) {
        updateCheckedDisplay(entry);
        saveCurrentEntryState();
    }
});

dom.quickCheckBtn.addEventListener("click", toggleOrConfirmChecked);
dom.confirmCheckedBtn.addEventListener("click", toggleOrConfirmChecked);

dom.editButton.addEventListener("click", () => {
    if (editMode) {
        exitEditMode();
    } else {
        dom.activationNameInput.value = editorName;
        dom.activationModal.classList.add("visible");
        setTimeout(() => dom.activationNameInput.focus(), 50);
    }
});

dom.activationCancelBtn.addEventListener("click", () => {
    dom.activationModal.classList.remove("visible");
});

dom.activationConfirmBtn.addEventListener("click", handleActivationConfirm);

dom.activationNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleActivationConfirm();
    }
});

dom.previewButton.addEventListener("click", () => {
    saveCurrentEntryState();

    if (pendingEdits.size === 0) {
        showInfoModal("Preview Changes", "No modifications have been made yet.");
        return;
    }

    dom.previewSummaryInfo.textContent = `Language: ${currentLanguage.toUpperCase()} | Modified Entries: ${pendingEdits.size}`;
    dom.previewEditorInfo.textContent = `Editor: ${editorName}`;
    dom.previewChangesList.innerHTML = "";

    pendingEdits.forEach((edit) => {
        dom.previewChangesList.appendChild(renderDiffCard(edit));
    });

    dom.previewModal.classList.add("visible");
});

dom.previewCloseBtn.addEventListener("click", () => {
    dom.previewModal.classList.remove("visible");
});

dom.previewTimelineButton.addEventListener("click", () => {
    showInfoModal(
        "Preview Timeline",
        "Timeline preview is in progress! The logic to render an interactive timeline for this dictionary entry will follow in an upcoming update."
    );
});

dom.submitButton.addEventListener("click", () => {
    saveCurrentEntryState();

    if (pendingEdits.size === 0) {
        showInfoModal("Submit Changes", "No modifications to submit.");
        return;
    }

    dom.submitSummaryList.innerHTML = `
        <p><strong>Language:</strong> ${currentLanguage.toUpperCase()}</p>
        <p><strong>Editor:</strong> ${editorName}</p>
        <p><strong>Keys to submit:</strong> ${Array.from(pendingEdits.keys()).join(", ")}</p>
    `;

    dom.submitStatusMessage.textContent = "";
    dom.submitStatusMessage.className = "submit-status-message";

    turnstileToken = null;
    dom.submitConfirmBtn.disabled = true;

    dom.submitModal.classList.add("visible");
    dom.turnstileContainer.innerHTML = "";

    loadTurnstile()
        .then(() => {
            if (!window.turnstile) {
                throw new Error("Turnstile is not available.");
            }

            turnstileWidgetId = window.turnstile.render(
                dom.turnstileContainer,
                {
                    sitekey: TURNSTILE_SITE_KEY,
                    callback: (token: string) => {
                        turnstileToken = token;
                        dom.submitConfirmBtn.disabled = false;
                        dom.submitStatusMessage.textContent =
                            "✅ Bot verification successful. Ready to submit.";
                        dom.submitStatusMessage.className =
                            "submit-status-message success";
                    },
                    "expired-callback": () => {
                        turnstileToken = null;
                        dom.submitConfirmBtn.disabled = true;
                        dom.submitStatusMessage.textContent =
                            "Turnstile verification expired. Please verify again.";
                        dom.submitStatusMessage.className =
                            "submit-status-message warning";
                    },
                    "error-callback": (error: string) => {
                        turnstileToken = null;
                        dom.submitConfirmBtn.disabled = true;
                        dom.submitStatusMessage.textContent =
                            `Turnstile verification failed: ${error}`;
                        dom.submitStatusMessage.className =
                            "submit-status-message warning";
                    }
                }
            );
        })
        .catch(error => {
            console.error(error);
            dom.submitStatusMessage.textContent =
                "Could not load Cloudflare Turnstile.";
            dom.submitStatusMessage.className =
                "submit-status-message warning";
        });
});

dom.submitCancelBtn.addEventListener("click", () => {
    turnstileToken = null;
    if (turnstileWidgetId && window.turnstile) {
        window.turnstile.reset(turnstileWidgetId);
    }
    dom.submitModal.classList.remove("visible");
});

dom.submitConfirmBtn.addEventListener("click", async () => {
    if (!turnstileToken) {
        dom.submitStatusMessage.textContent =
            "Please complete the Cloudflare verification first.";
        dom.submitStatusMessage.className =
            "submit-status-message warning";
        return;
    }

    dom.submitConfirmBtn.disabled = true;
    dom.submitStatusMessage.textContent = "Submitting changes to Cloudflare Worker...";
    dom.submitStatusMessage.className = "submit-status-message pending";

    const endpoint = dom.submitWorkerUrlInput.value.trim() || workerEndpoint;
    localStorage.setItem("dictionary_worker_url", endpoint);

    const payload: SubmissionPayload = {
        action: "update_dictionary_entries",
        lang: currentLanguage,
        editor: editorName,
        date: new Date().toISOString().split("T")[0],
        turnstileToken: turnstileToken,
        changes: Array.from(pendingEdits.values()).map(e => ({
            key: e.key,
            category: e.category,
            text: e.text,
            notes: e.notes,
            checked: e.checked ? "True" : "False",
            origText: e.origText,
            origNotes: e.origNotes,
            origChecked: e.origChecked ? "True" : "False"
        }))
    };

    try {
        const data = await submitChanges(endpoint, payload);

        dom.submitStatusMessage.textContent = `✅ Successfully submitted! Issue created: ${data.issue_url || "Issue #logged"}`;
        dom.submitStatusMessage.className = "submit-status-message success";

        setTimeout(() => {
            dom.submitModal.classList.remove("visible");
            exitEditMode();
            showInfoModal(
                "Submission Received",
                "Your translation updates have been submitted to kreier/timeline! Thank you for contributing."
            );
        }, 1500);

    } catch (err: unknown) {
        console.warn("Worker submission notice:", err);
        dom.submitStatusMessage.innerHTML = `
            ⚠️ Submission sent to endpoint. If you haven't deployed the Cloudflare Worker yet, 
            see the setup instructions in the console or documentation.<br>
            <small>Payload ready: ${pendingEdits.size} keys</small>
        `;
        dom.submitStatusMessage.className = "submit-status-message warning";
        dom.submitConfirmBtn.disabled = false;
    }
});


/*
 * Adaptive Header Padding
 */

function adjustPadding(): void {
    const header = document.querySelector<HTMLElement>("header");
    if (!header) return;
    document.body.style.paddingTop = `${header.offsetHeight + 10}px`;
}

window.addEventListener("resize", adjustPadding);

const header = document.querySelector<HTMLElement>("header");
if (header) {
    const observer = new ResizeObserver(adjustPadding);
    observer.observe(header);
}


/*
 * Initial Application Setup
 */

const initialCategoryButton =
    document.querySelector<HTMLButtonElement>('.cat-btn[data-cat="text"]');
initialCategoryButton?.classList.add("active");

loadScriptures().catch(console.warn);

loadLanguages().catch(error => {
    console.error(error);
    const content = document.querySelector<HTMLElement>(".content");
    if (content) {
        content.textContent = "Could not load dictionary data.";
    }
});

adjustPadding();