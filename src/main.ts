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
let originalEdit: {
    text: string;
    notes: string;
    checked: string;
} | null = null;

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
                <span id="checked-emoji"></span>
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
            <h2>Preview Changes</h2>
            <div class="preview-header-info">
                <span id="preview-key-info"></span>
                <span id="preview-editor-info"></span>
            </div>

            <div class="preview-comparison">
                <div class="preview-section">
                    <h3>Text</h3>
                    <div class="diff-block">
                        <div class="diff-pane">
                            <span class="diff-label">Original:</span>
                            <div id="preview-text-orig" class="diff-content original"></div>
                        </div>
                        <div class="diff-pane">
                            <span class="diff-label">Modified:</span>
                            <div id="preview-text-mod" class="diff-content modified"></div>
                        </div>
                    </div>
                </div>

                <div class="preview-section">
                    <h3>Notes</h3>
                    <div class="diff-block">
                        <div class="diff-pane">
                            <span class="diff-label">Original:</span>
                            <div id="preview-notes-orig" class="diff-content original"></div>
                        </div>
                        <div class="diff-pane">
                            <span class="diff-label">Modified:</span>
                            <div id="preview-notes-mod" class="diff-content modified"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-actions">
                <button id="preview-close-btn" class="btn-primary">Close Preview</button>
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

const previewKeyInfo =
    document.querySelector<HTMLSpanElement>("#preview-key-info")!;

const previewEditorInfo =
    document.querySelector<HTMLSpanElement>("#preview-editor-info")!;

const previewTextOrig =
    document.querySelector<HTMLDivElement>("#preview-text-orig")!;

const previewTextMod =
    document.querySelector<HTMLDivElement>("#preview-text-mod")!;

const previewNotesOrig =
    document.querySelector<HTMLDivElement>("#preview-notes-orig")!;

const previewNotesMod =
    document.querySelector<HTMLDivElement>("#preview-notes-mod")!;

const previewCloseBtn =
    document.querySelector<HTMLButtonElement>("#preview-close-btn")!;

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

    if (languages.length > 0) {
        await loadLanguage(languages[0].key);
    }
}


/*
 * Load one language dictionary.
 */

async function loadLanguage(language: string): Promise<void> {
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
        option.textContent = entry.key;

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
    textInput.value = entry.text;
    setBox("english", entry.english);
    notesInput.value = entry.notes ?? "";
    setBox("google", entry.google);
    setBox("chatgpt", entry.chatgpt);
    setBox("gemini", entry.gemini);
    setBox("claude", entry.claude);
    setBox("deepl", entry.deepl);

    const checkedEmoji =
        document.getElementById("checked-emoji");

    const checkedInfo =
        document.getElementById("checked-info");

    if (entry.checked === "True") {
        checkedEmoji!.textContent = "✅";

        checkedInfo!.textContent =
            ` by ${entry.checked_by ?? ""} on ${entry.date ?? ""}`;
    } else {
        checkedEmoji!.textContent = "⬜";
        checkedInfo!.textContent = "";
    }

    prevButton.disabled = currentIndex === 0;
    nextButton.disabled =
        currentIndex >= filteredEntries.length - 1;

    if (editMode) {
        originalEdit = {
            text: entry.text,
            notes: entry.notes ?? "",
            checked: entry.checked ?? "False"
        };
        updateEditButtons();
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

    document.getElementById("checked-emoji")!.textContent = "";
    document.getElementById("checked-info")!.textContent = "";

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
    filterAndShow();
});


/*
 * Key selection.
 */

keySelect.addEventListener("change", () => {
    currentIndex =
        Number.parseInt(keySelect.value, 10);

    showEntry();
});


/*
 * Previous / next navigation.
 */

prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        showEntry();
    }
});

nextButton.addEventListener("click", () => {
    if (currentIndex < filteredEntries.length - 1) {
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
 * Edit-mode logic
 */

function enterEditMode(): void {
    const entry = filteredEntries[currentIndex];

    if (!entry) {
        return;
    }

    editMode = true;

    originalEdit = {
        text: entry.text,
        notes: entry.notes ?? "",
        checked: entry.checked ?? "False"
    };

    textInput.readOnly = false;
    notesInput.readOnly = false;
    textInput.classList.add("editable");
    notesInput.classList.add("editable");

    editButton.textContent = "Exit Edit Mode";
    editButton.classList.add("active");

    editStatus.textContent =
        `Edit mode active. Editing as "${editorName}". You can edit Text and Notes.`;
    editStatus.classList.add("active");

    updateEditButtons();
}

function exitEditMode(): void {
    editMode = false;
    originalEdit = null;

    textInput.readOnly = true;
    notesInput.readOnly = true;
    textInput.classList.remove("editable");
    notesInput.classList.remove("editable");

    editButton.textContent = "Enable editing";
    editButton.classList.remove("active");

    editStatus.textContent =
        "Editing is disabled.";
    editStatus.classList.remove("active");

    previewButton.disabled = true;
    submitButton.disabled = true;

    showEntry();
}

function hasChanges(): boolean {
    if (!originalEdit) {
        return false;
    }

    return (
        textInput.value !== originalEdit.text ||
        notesInput.value !== originalEdit.notes
    );
}

function updateEditButtons(): void {
    const changed = editMode && hasChanges();

    previewButton.disabled = !changed;
    submitButton.disabled = !changed;
}

textInput.addEventListener("input", updateEditButtons);
notesInput.addEventListener("input", updateEditButtons);

editButton.addEventListener("click", () => {
    if (editMode) {
        exitEditMode();
    } else {
        // Open activation modal
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
 * Preview Changes Modal logic
 */

previewButton.addEventListener("click", () => {
    const entry = filteredEntries[currentIndex];
    if (!entry) return;

    previewKeyInfo.textContent = `Entry: [${entry.key}] (${currentLanguage.toUpperCase()})`;
    previewEditorInfo.textContent = `Editor: ${editorName}`;

    previewTextOrig.textContent = originalEdit?.text ?? entry.text;
    previewTextMod.textContent = textInput.value;

    previewNotesOrig.textContent = originalEdit?.notes ?? (entry.notes ?? "");
    previewNotesMod.textContent = notesInput.value;

    previewModal.classList.add("visible");
});

previewCloseBtn.addEventListener("click", () => {
    previewModal.classList.remove("visible");
});


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
 * Submit Changes logic
 */

submitButton.addEventListener("click", () => {
    showInfoModal(
        "Submit Changes",
        "Submission will be enabled once Cloudflare Turnstile bot and spam verification is configured."
    );
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