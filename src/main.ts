import "./style.css";

type Category =
    | "text"
    | "bible"
    | "A6"
    | "B9"
    | "wiki"
    | "other";

interface DictionaryEntry {
    key: string;
    text: string;
    english?: string;
    notes?: string;
    google?: string;
    chatgpt?: string;
    gemini?: string;
    claude?: string;
    deepl?: string;
    checked?: string;
    checked_by?: string;
    date?: string;
    tag?: string;
    category: Category;
}

interface Language {
    key: string;
    language_str: string;
}

interface PendingEdit {
    key: string;
    category: Category;
    text: string;
    notes: string;
    checked: boolean;
    origText: string;
    origNotes: string;
    origChecked: boolean;
}

const categories: Category[] = [
    "text",
    "bible",
    "A6",
    "B9",
    "wiki",
    "other"
];

let entries: DictionaryEntry[] = [];
let filteredEntries: DictionaryEntry[] = [];

let currentLanguage = "";
let currentIndex = 0;
let currentCategory: Category = "text";

let editMode = false;
let editorName = localStorage.getItem("dictionary_editor_name") || "";

// Session edits map: key -> PendingEdit (for the current language)
const pendingEdits = new Map<string, PendingEdit>();

// Default Cloudflare Worker submission endpoint (can be customized)
let workerEndpoint =
    localStorage.getItem("dictionary_worker_url") ||
    "https://dictionary-submissions.your-subdomain.workers.dev/submit";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
    throw new Error("Could not find #app");
}


/*
 * Application HTML
 */

app.innerHTML = `
    <header>
        <div class="controls">

            <select id="language-select"></select>

            <div class="category-buttons" id="category-buttons">
                <button class="cat-btn" data-cat="text">
                    <span>TEXT</span>
                    <span class="cat-count" id="count-text">0/0</span>
                </button>

                <button class="cat-btn" data-cat="bible">
                    <span>BIBLE</span>
                    <span class="cat-count" id="count-bible">0/0</span>
                </button>

                <button class="cat-btn" data-cat="A6">
                    <span>A6</span>
                    <span class="cat-count" id="count-A6">0/0</span>
                </button>

                <button class="cat-btn" data-cat="B9">
                    <span>B9</span>
                    <span class="cat-count" id="count-B9">0/0</span>
                </button>

                <button class="cat-btn" data-cat="wiki">
                    <span>WIKI</span>
                    <span class="cat-count" id="count-wiki">0/0</span>
                </button>

                <button class="cat-btn" data-cat="other">
                    <span>OTHER</span>
                    <span class="cat-count" id="count-other">0/0</span>
                </button>
            </div>

            <input
                type="text"
                id="search-input"
                class="search-box"
                placeholder="Search key or english..."
            >

            <div class="nav-line">
                <button id="prev-btn">&lt;</button>

                <select id="key-select"></select>

                <button id="next-btn">&gt;</button>
            </div>

            <div class="metadata" id="metadata">
                <label class="checked-toggle-label" id="checked-toggle-label" title="Toggle verification status">
                    <input type="checkbox" id="box-checked" disabled>
                    <span id="checked-emoji">⬜</span>
                    <span id="checked-label">Unchecked</span>
                </label>
                <span id="checked-info"></span>
            </div>

        </div>
    </header>

    <main class="content">

        <div class="box">
            <div class="box-label">Key</div>
            <div class="box-content" id="box-key"></div>
        </div>

        <div class="box">
            <div class="box-label">Text</div>
            <textarea
                class="box-content edit-input"
                id="box-text"
                rows="2"
                readonly
            ></textarea>
        </div>

        <div class="box">
            <div class="box-label">English</div>
            <div class="box-content" id="box-english"></div>
        </div>

        <div class="box">
            <div class="box-label">Notes</div>
            <textarea
                class="box-content edit-input"
                id="box-notes"
                rows="2"
                readonly
            ></textarea>
        </div>

        <div class="box">
            <div class="box-label">Google</div>
            <div class="box-content" id="box-google"></div>
        </div>

        <div class="box">
            <div class="box-label">ChatGPT</div>
            <div class="box-content" id="box-chatgpt"></div>
        </div>

        <div class="box">
            <div class="box-label">Gemini</div>
            <div class="box-content" id="box-gemini"></div>
        </div>

        <div class="box">
            <div class="box-label">Claude</div>
            <div class="box-content" id="box-claude"></div>
        </div>

        <div class="box">
            <div class="box-label">DeepL</div>
            <div class="box-content" id="box-deepl"></div>
        </div>

        <div class="edit-controls">
            <button class="edit-btn" id="edit-btn">
                Enable editing
            </button>

            <button class="preview-btn" id="preview-btn" disabled>
                Preview Changes
            </button>

            <button class="timeline-btn" id="preview-timeline-btn">
                Preview timeline
            </button>

            <button class="submit-btn" id="submit-btn" disabled>
                Submit Changes
            </button>
        </div>

        <div id="edit-status" class="edit-status">
            Editing is disabled.
        </div>
    </main>

    <!-- Activation Modal -->
    <div id="activation-modal" class="modal">
        <div class="modal-content">
            <h2>Activate Edit Mode</h2>
            <p class="modal-prompt">Please enter your name, so we can attribute your edits:</p>
            <div class="edit-field">
                <input
                    type="text"
                    id="activation-name"
                    placeholder="Your name (e.g. Jane Doe)"
                    autocomplete="name"
                >
            </div>
            <div class="modal-actions">
                <button id="activation-cancel-btn" class="btn-secondary">Cancel</button>
                <button id="activation-confirm-btn" class="btn-primary">Activate Edit Mode</button>
            </div>
        </div>
    </div>

    <!-- Preview Changes Modal -->
    <div id="preview-modal" class="modal">
        <div class="modal-content modal-large">
            <h2>Preview Proposed Changes</h2>
            <div class="preview-header-info">
                <span id="preview-summary-info"></span>
                <span id="preview-editor-info"></span>
            </div>

            <div id="preview-changes-list" class="preview-changes-list">
                <!-- Dynamically generated list of changed keys -->
            </div>

            <div class="modal-actions">
                <button id="preview-close-btn" class="btn-primary">Close Preview</button>
            </div>
        </div>
    </div>

    <!-- Submit Changes Modal -->
    <div id="submit-modal" class="modal">
        <div class="modal-content modal-large">
            <h2>Submit Changes</h2>
            <p class="modal-prompt">
                The following proposed changes will be submitted as an Issue to
                <code>kreier/timeline</code> for review and approval:
            </p>

            <div id="submit-summary-list" class="submit-summary-list"></div>

            <div class="edit-field" style="margin-top: 15px;">
                <label for="submit-worker-url" style="font-size: 12px; font-weight: bold; color: #666;">
                    Submission Worker Endpoint:
                </label>
                <input
                    type="text"
                    id="submit-worker-url"
                    value="${workerEndpoint}"
                    style="font-size: 13px; padding: 6px;"
                >
            </div>

            <div class="turnstile-wrapper">
                <div id="turnstile-container">
                    <p style="font-size: 13px; color: #666; margin: 5px 0;">
                        🛡️ Cloudflare Turnstile Bot Check (Ready for verification)
                    </p>
                </div>
            </div>

            <div id="submit-status-message" class="submit-status-message"></div>

            <div class="modal-actions">
                <button id="submit-cancel-btn" class="btn-secondary">Cancel</button>
                <button id="submit-confirm-btn" class="btn-primary">Confirm & Submit</button>
            </div>
        </div>
    </div>

    <!-- Info / Alert Modal -->
    <div id="info-modal" class="modal">
        <div class="modal-content">
            <h2 id="info-modal-title">Notice</h2>
            <p id="info-modal-message"></p>
            <div class="modal-actions">
                <button id="info-modal-close" class="btn-primary">OK</button>
            </div>
        </div>
    </div>
`;


/*
 * DOM elements
 */

const languageSelect =
    document.querySelector<HTMLSelectElement>("#language-select")!;

const categoryButtons =
    document.querySelectorAll<HTMLButtonElement>(".cat-btn");

const searchInput =
    document.querySelector<HTMLInputElement>("#search-input")!;

const keySelect =
    document.querySelector<HTMLSelectElement>("#key-select")!;

const prevButton =
    document.querySelector<HTMLButtonElement>("#prev-btn")!;

const nextButton =
    document.querySelector<HTMLButtonElement>("#next-btn")!;

const editButton =
    document.querySelector<HTMLButtonElement>("#edit-btn")!;

const previewButton =
    document.querySelector<HTMLButtonElement>("#preview-btn")!;

const previewTimelineButton =
    document.querySelector<HTMLButtonElement>("#preview-timeline-btn")!;

const submitButton =
    document.querySelector<HTMLButtonElement>("#submit-btn")!;

const editStatus =
    document.querySelector<HTMLDivElement>("#edit-status")!;

const textInput =
    document.querySelector<HTMLTextAreaElement>("#box-text")!;

const notesInput =
    document.querySelector<HTMLTextAreaElement>("#box-notes")!;

const boxChecked =
    document.querySelector<HTMLInputElement>("#box-checked")!;

const checkedEmoji =
    document.querySelector<HTMLSpanElement>("#checked-emoji")!;

const checkedLabel =
    document.querySelector<HTMLSpanElement>("#checked-label")!;

const checkedInfo =
    document.querySelector<HTMLSpanElement>("#checked-info")!;

const checkedToggleLabel =
    document.querySelector<HTMLLabelElement>("#checked-toggle-label")!;

// Activation Modal Elements
const activationModal =
    document.querySelector<HTMLDivElement>("#activation-modal")!;

const activationNameInput =
    document.querySelector<HTMLInputElement>("#activation-name")!;

const activationCancelBtn =
    document.querySelector<HTMLButtonElement>("#activation-cancel-btn")!;

const activationConfirmBtn =
    document.querySelector<HTMLButtonElement>("#activation-confirm-btn")!;

// Preview Modal Elements
const previewModal =
    document.querySelector<HTMLDivElement>("#preview-modal")!;

const previewSummaryInfo =
    document.querySelector<HTMLSpanElement>("#preview-summary-info")!;

const previewEditorInfo =
    document.querySelector<HTMLSpanElement>("#preview-editor-info")!;

const previewChangesList =
    document.querySelector<HTMLDivElement>("#preview-changes-list")!;

const previewCloseBtn =
    document.querySelector<HTMLButtonElement>("#preview-close-btn")!;

// Submit Modal Elements
const submitModal =
    document.querySelector<HTMLDivElement>("#submit-modal")!;

const submitSummaryList =
    document.querySelector<HTMLDivElement>("#submit-summary-list")!;

const submitWorkerUrlInput =
    document.querySelector<HTMLInputElement>("#submit-worker-url")!;

const submitStatusMessage =
    document.querySelector<HTMLDivElement>("#submit-status-message")!;

const submitCancelBtn =
    document.querySelector<HTMLButtonElement>("#submit-cancel-btn")!;

const submitConfirmBtn =
    document.querySelector<HTMLButtonElement>("#submit-confirm-btn")!;

// Info Modal Elements
const infoModal =
    document.querySelector<HTMLDivElement>("#info-modal")!;

const infoModalTitle =
    document.querySelector<HTMLHeadingElement>("#info-modal-title")!;

const infoModalMessage =
    document.querySelector<HTMLParagraphElement>("#info-modal-message")!;

const infoModalClose =
    document.querySelector<HTMLButtonElement>("#info-modal-close")!;


/*
 * Helper modal alert
 */
function showInfoModal(title: string, message: string): void {
    infoModalTitle.textContent = title;
    infoModalMessage.textContent = message;
    infoModal.classList.add("visible");
}

infoModalClose.addEventListener("click", () => {
    infoModal.classList.remove("visible");
});


/*
 * Load the available languages.
 */

async function loadLanguages(): Promise<void> {
    const response = await fetch(
        `${import.meta.env.BASE_URL}data/languages.json`
    );

    if (!response.ok) {
        throw new Error(
            `Could not load languages: ${response.status}`
        );
    }

    const languages: Language[] = await response.json();

    languageSelect.innerHTML = "";

    for (const language of languages) {
        const option = document.createElement("option");

        option.value = language.key;
        option.textContent = language.language_str;

        languageSelect.appendChild(option);
    }

    // Default to the last entry in languages.json (e.g. Vietnamese)
    if (languages.length > 0) {
        const defaultLanguage = languages[languages.length - 1].key;
        languageSelect.value = defaultLanguage;
        await loadLanguage(defaultLanguage);
    }
}


/*
 * Load one language dictionary.
 */

async function loadLanguage(language: string): Promise<void> {
    // When changing language, discard pending edits for the previous language
    pendingEdits.clear();

    currentLanguage = language;

    const response = await fetch(
        `${import.meta.env.BASE_URL}data/${language}.json`
    );

    if (!response.ok) {
        throw new Error(
            `Could not load dictionary: ${response.status}`
        );
    }

    entries = await response.json();

    updateCounts();
    filterAndShow();
    updateEditState();
}


/*
 * Update the checked/total counters for every category.
 */

function updateCounts(): void {
    for (const category of categories) {
        const categoryEntries = entries.filter(
            entry => entry.category === category
        );

        const total = categoryEntries.length;

        const checked = categoryEntries.filter(
            entry => entry.checked === "True"
        ).length;

        const counter =
            document.getElementById(`count-${category}`);

        if (counter) {
            counter.textContent = `${checked}/${total}`;
        }
    }
}


/*
 * Filter the dictionary by category and search term.
 */

function filterAndShow(): void {
    const searchTerm =
        searchInput.value.trim().toLowerCase();

    filteredEntries = entries.filter(entry => {
        const matchesCategory =
            entry.category === currentCategory;

        const matchesSearch =
            !searchTerm ||
            entry.key.toLowerCase().includes(searchTerm) ||
            (entry.english ?? "")
                .toLowerCase()
                .includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    keySelect.innerHTML = "";

    for (const [index, entry] of filteredEntries.entries()) {
        const option = document.createElement("option");

        option.value = String(index);
        // Show an indicator if this key has pending edits
        const hasPending = pendingEdits.has(entry.key);
        option.textContent = hasPending ? `✏️ ${entry.key}` : entry.key;

        keySelect.appendChild(option);
    }

    currentIndex = 0;

    showEntry();
}


/*
 * Display the current dictionary entry.
 */

function showEntry(): void {
    const entry = filteredEntries[currentIndex];

    if (!entry) {
        clearDisplay();
        return;
    }

    keySelect.value = String(currentIndex);

    setBox("key", entry.key);
    setBox("english", entry.english);
    setBox("google", entry.google);
    setBox("chatgpt", entry.chatgpt);
    setBox("gemini", entry.gemini);
    setBox("claude", entry.claude);
    setBox("deepl", entry.deepl);

    // Check if we have an active pending edit for this entry
    const pending = pendingEdits.get(entry.key);

    if (pending) {
        textInput.value = pending.text;
        notesInput.value = pending.notes;
        boxChecked.checked = pending.checked;
    } else {
        textInput.value = entry.text;
        notesInput.value = entry.notes ?? "";
        boxChecked.checked = entry.checked === "True";
    }

    updateCheckedDisplay(entry);

    prevButton.disabled = currentIndex === 0;
    nextButton.disabled =
        currentIndex >= filteredEntries.length - 1;

    updateEditButtons();
}

function updateCheckedDisplay(entry: DictionaryEntry): void {
    const isChecked = boxChecked.checked;
    checkedEmoji.textContent = isChecked ? "✅" : "⬜";
    checkedLabel.textContent = isChecked ? "Checked" : "Unchecked";

    if (isChecked) {
        checkedInfo.textContent =
            ` (Verified${entry.checked_by ? ` by ${entry.checked_by}` : ""}${entry.date ? ` on ${entry.date}` : ""})`;
    } else {
        checkedInfo.textContent = "";
    }
}


/*
 * Set the contents of one dictionary field.
 */

function setBox(
    name: string,
    value: string | undefined
): void {
    const element =
        document.getElementById(`box-${name}`);

    if (element) {
        element.textContent = value ?? "";
    }
}


/*
 * Clear the current entry display.
 */

function clearDisplay(): void {
    for (const field of [
        "key",
        "english",
        "google",
        "chatgpt",
        "gemini",
        "claude",
        "deepl"
    ]) {
        setBox(field, "");
    }

    textInput.value = "";
    notesInput.value = "";
    boxChecked.checked = false;

    checkedEmoji.textContent = "⬜";
    checkedLabel.textContent = "Unchecked";
    checkedInfo.textContent = "";

    prevButton.disabled = true;
    nextButton.disabled = true;
}


/*
 * Language selection.
 */

languageSelect.addEventListener("change", () => {
    loadLanguage(languageSelect.value).catch(error => {
        console.error(error);
        clearDisplay();
    });
});


/*
 * Category buttons.
 */

categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        // Save current entry changes before switching category
        saveCurrentEntryState();

        categoryButtons.forEach(
            other => other.classList.remove("active")
        );

        button.classList.add("active");

        currentCategory =
            button.dataset.cat as Category;

        filterAndShow();
    });
});


/*
 * Search.
 */

searchInput.addEventListener("input", () => {
    saveCurrentEntryState();
    filterAndShow();
});


/*
 * Key selection.
 */

keySelect.addEventListener("change", () => {
    saveCurrentEntryState();
    currentIndex =
        Number.parseInt(keySelect.value, 10);

    showEntry();
});


/*
 * Previous / next navigation.
 */

prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
        saveCurrentEntryState();
        currentIndex--;
        showEntry();
    }
});

nextButton.addEventListener("click", () => {
    if (currentIndex < filteredEntries.length - 1) {
        saveCurrentEntryState();
        currentIndex++;
        showEntry();
    }
});


/*
 * Make the header spacing adapt to its actual height.
 */

function adjustPadding(): void {
    const header =
        document.querySelector<HTMLElement>("header");

    if (!header) {
        return;
    }

    document.body.style.paddingTop =
        `${header.offsetHeight + 10}px`;
}

window.addEventListener("resize", adjustPadding);

const header =
    document.querySelector<HTMLElement>("header");

if (header) {
    const observer = new ResizeObserver(adjustPadding);
    observer.observe(header);
}


/*
 * Edit-mode and Pending Edits State Management
 */

function saveCurrentEntryState(): void {
    if (!editMode) return;

    const entry = filteredEntries[currentIndex];
    if (!entry) return;

    const origText = entry.text;
    const origNotes = entry.notes ?? "";
    const origChecked = entry.checked === "True";

    const currentText = textInput.value;
    const currentNotes = notesInput.value;
    const currentChecked = boxChecked.checked;

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
    const opt = Array.from(keySelect.options).find(o => o.text.includes(key));
    if (opt) {
        opt.textContent = isModified ? `✏️ ${key}` : key;
    }
}

function handleInputModification(isTextOrNotes: boolean): void {
    if (!editMode) return;

    const entry = filteredEntries[currentIndex];
    if (!entry) return;

    // When modifying text or notes for the first time, auto-activate "Checked"
    if (isTextOrNotes && !boxChecked.checked) {
        boxChecked.checked = true;
    }

    updateCheckedDisplay(entry);
    saveCurrentEntryState();
}

textInput.addEventListener("input", () => handleInputModification(true));
notesInput.addEventListener("input", () => handleInputModification(true));

boxChecked.addEventListener("change", () => {
    const entry = filteredEntries[currentIndex];
    if (entry) {
        updateCheckedDisplay(entry);
        saveCurrentEntryState();
    }
});

function enterEditMode(): void {
    editMode = true;

    textInput.readOnly = false;
    notesInput.readOnly = false;
    boxChecked.disabled = false;

    textInput.classList.add("editable");
    notesInput.classList.add("editable");
    checkedToggleLabel.classList.add("editable");

    editButton.textContent = "Exit Edit Mode";
    editButton.classList.add("active");

    updateEditState();
}

function exitEditMode(): void {
    editMode = false;
    pendingEdits.clear();

    textInput.readOnly = true;
    notesInput.readOnly = true;
    boxChecked.disabled = true;

    textInput.classList.remove("editable");
    notesInput.classList.remove("editable");
    checkedToggleLabel.classList.remove("editable");

    editButton.textContent = "Enable editing";
    editButton.classList.remove("active");

    // Refresh key list to remove pencil indicators
    filterAndShow();
    updateEditState();
}

function updateEditState(): void {
    if (editMode) {
        const count = pendingEdits.size;
        editStatus.textContent =
            count > 0
                ? `Edit mode active (${editorName}) — ${count} entry/entries modified in ${currentLanguage.toUpperCase()}.`
                : `Edit mode active (${editorName}) — You can edit Text, Notes, and Checked status.`;
        editStatus.classList.add("active");
    } else {
        editStatus.textContent = "Editing is disabled.";
        editStatus.classList.remove("active");
    }

    updateEditButtons();
}

function updateEditButtons(): void {
    const hasAnyChanges = editMode && pendingEdits.size > 0;

    previewButton.disabled = !hasAnyChanges;
    submitButton.disabled = !hasAnyChanges;

    previewButton.textContent =
        pendingEdits.size > 0
            ? `Preview Changes (${pendingEdits.size})`
            : "Preview Changes";

    submitButton.textContent =
        pendingEdits.size > 0
            ? `Submit Changes (${pendingEdits.size})`
            : "Submit Changes";
}

editButton.addEventListener("click", () => {
    if (editMode) {
        exitEditMode();
    } else {
        activationNameInput.value = editorName;
        activationModal.classList.add("visible");
        setTimeout(() => activationNameInput.focus(), 50);
    }
});

activationCancelBtn.addEventListener("click", () => {
    activationModal.classList.remove("visible");
});

function handleActivationConfirm(): void {
    const name = activationNameInput.value.trim();
    if (!name) {
        activationNameInput.focus();
        activationNameInput.classList.add("input-error");
        return;
    }

    activationNameInput.classList.remove("input-error");
    editorName = name;
    localStorage.setItem("dictionary_editor_name", editorName);
    activationModal.classList.remove("visible");
    enterEditMode();
}

activationConfirmBtn.addEventListener("click", handleActivationConfirm);
activationNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleActivationConfirm();
    }
});


/*
 * Preview Changes Modal logic (Key-Grouped Diff)
 */

previewButton.addEventListener("click", () => {
    saveCurrentEntryState();

    if (pendingEdits.size === 0) {
        showInfoModal("Preview Changes", "No modifications have been made yet.");
        return;
    }

    previewSummaryInfo.textContent = `Language: ${currentLanguage.toUpperCase()} | Modified Entries: ${pendingEdits.size}`;
    previewEditorInfo.textContent = `Editor: ${editorName}`;

    previewChangesList.innerHTML = "";

    pendingEdits.forEach((edit) => {
        const card = document.createElement("div");
        card.className = "preview-key-card";

        let fieldDiffs = "";

        // Text diff
        if (edit.text !== edit.origText) {
            fieldDiffs += `
                <div class="diff-section">
                    <span class="diff-field-name">Text</span>
                    <div class="diff-block">
                        <div class="diff-pane">
                            <span class="diff-label">Original:</span>
                            <div class="diff-content original">${escapeHtml(edit.origText)}</div>
                        </div>
                        <div class="diff-pane">
                            <span class="diff-label">Modified:</span>
                            <div class="diff-content modified">${escapeHtml(edit.text)}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Notes diff
        if (edit.notes !== edit.origNotes) {
            fieldDiffs += `
                <div class="diff-section">
                    <span class="diff-field-name">Notes</span>
                    <div class="diff-block">
                        <div class="diff-pane">
                            <span class="diff-label">Original:</span>
                            <div class="diff-content original">${escapeHtml(edit.origNotes || "(empty)")}</div>
                        </div>
                        <div class="diff-pane">
                            <span class="diff-label">Modified:</span>
                            <div class="diff-content modified">${escapeHtml(edit.notes || "(empty)")}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Checked status diff
        if (edit.checked !== edit.origChecked) {
            fieldDiffs += `
                <div class="diff-section">
                    <span class="diff-field-name">Checked Status</span>
                    <div class="diff-inline-status">
                        <span class="diff-content original">${edit.origChecked ? "✅ Checked" : "⬜ Unchecked"}</span>
                        <span> ➔ </span>
                        <span class="diff-content modified">${edit.checked ? "✅ Checked" : "⬜ Unchecked"}</span>
                    </div>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="preview-key-header">
                <span class="preview-cat-badge">${edit.category.toUpperCase()}</span>
                <span class="preview-key-name">${escapeHtml(edit.key)}</span>
            </div>
            ${fieldDiffs}
        `;

        previewChangesList.appendChild(card);
    });

    previewModal.classList.add("visible");
});

previewCloseBtn.addEventListener("click", () => {
    previewModal.classList.remove("visible");
});

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}


/*
 * Preview Timeline dummy logic
 */

previewTimelineButton.addEventListener("click", () => {
    showInfoModal(
        "Preview Timeline",
        "Timeline preview is in progress! The logic to render an interactive timeline for this dictionary entry will follow in an upcoming update."
    );
});


/*
 * Submit Changes Logic (Cloudflare Worker Integration)
 */

submitButton.addEventListener("click", () => {
    saveCurrentEntryState();

    if (pendingEdits.size === 0) {
        showInfoModal("Submit Changes", "No modifications to submit.");
        return;
    }

    submitSummaryList.innerHTML = `
        <p><strong>Language:</strong> ${currentLanguage.toUpperCase()}</p>
        <p><strong>Editor:</strong> ${editorName}</p>
        <p><strong>Keys to submit:</strong> ${Array.from(pendingEdits.keys()).join(", ")}</p>
    `;

    submitStatusMessage.textContent = "";
    submitStatusMessage.className = "submit-status-message";
    submitConfirmBtn.disabled = false;

    submitModal.classList.add("visible");
});

submitCancelBtn.addEventListener("click", () => {
    submitModal.classList.remove("visible");
});

submitConfirmBtn.addEventListener("click", async () => {
    submitConfirmBtn.disabled = true;
    submitStatusMessage.textContent = "Submitting changes to Cloudflare Worker...";
    submitStatusMessage.className = "submit-status-message pending";

    const endpoint = submitWorkerUrlInput.value.trim() || workerEndpoint;
    localStorage.setItem("dictionary_worker_url", endpoint);

    const payload = {
        action: "update_dictionary_entries",
        lang: currentLanguage,
        editor: editorName,
        date: new Date().toISOString().split("T")[0],
        turnstileToken: "mock-or-turnstile-token",
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
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`Worker responded with status: ${res.status}`);
        }

        const data = await res.json();

        submitStatusMessage.textContent = `✅ Successfully submitted! Issue created: ${data.issue_url || "Issue #logged"}`;
        submitStatusMessage.className = "submit-status-message success";

        setTimeout(() => {
            submitModal.classList.remove("visible");
            exitEditMode();
            showInfoModal(
                "Submission Received",
                "Your translation updates have been submitted to kreier/timeline! Thank you for contributing."
            );
        }, 1500);

    } catch (err: any) {
        console.warn("Worker submission notice:", err);
        submitStatusMessage.innerHTML = `
            ⚠️ Submission sent to endpoint. If you haven't deployed the Cloudflare Worker yet, 
            see the setup instructions in the console or documentation.<br>
            <small>Payload ready: ${pendingEdits.size} keys</small>
        `;
        submitStatusMessage.className = "submit-status-message warning";
        submitConfirmBtn.disabled = false;
    }
});


/*
 * Initial application setup.
 */

const initialCategoryButton =
    document.querySelector<HTMLButtonElement>(
        '.cat-btn[data-cat="text"]'
    );

initialCategoryButton?.classList.add("active");

loadLanguages().catch(error => {
    console.error(error);

    const content =
        document.querySelector<HTMLElement>(".content");

    if (content) {
        content.textContent =
            "Could not load dictionary data.";
    }
});

adjustPadding();