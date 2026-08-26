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
                EDIT
            </button>

            <button class="preview-btn" id="preview-btn" disabled>
                Preview Changes
            </button>

            <button class="submit-btn" id="submit-btn" disabled>
                Submit Changes
            </button>
        </div>
        <div id="edit-status" class="edit-status">
            Editing is disabled.
        </div>

        <div id="editor-field" class="editor-field" hidden>
            <label for="edit-name">Your name</label>
            <input
                type="text"
                id="edit-name"
                placeholder="Name associated with your changes"
                autocomplete="name"
            >
        </div>
    </main>

    <div id="edit-modal" class="modal">
        <div class="modal-content">

            <h2>Edit Entry</h2>

            <div class="edit-field">
                <label for="edit-name">Name</label>
                <input
                    type="text"
                    id="edit-name"
                    placeholder="Your name"
                >
            </div>

            <div class="edit-field">
                <label for="edit-text">Text</label>
                <textarea
                    id="edit-text"
                    rows="4"
                ></textarea>
            </div>

            <div class="edit-field">
                <label for="edit-notes">Notes</label>
                <textarea
                    id="edit-notes"
                    rows="3"
                ></textarea>
            </div>

            <div class="edit-field edit-checkbox">
                <label>
                    <input
                        type="checkbox"
                        id="edit-checked"
                    >
                    Checked
                </label>
            </div>

            <div class="edit-actions">
                <button id="edit-cancel">Cancel</button>
                <button id="edit-preview">Preview changes</button>
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

const editModal =
    document.querySelector<HTMLDivElement>("#edit-modal")!;

const editName =
    document.querySelector<HTMLInputElement>("#edit-name")!;

const editText =
    document.querySelector<HTMLTextAreaElement>("#edit-text")!;

const editNotes =
    document.querySelector<HTMLTextAreaElement>("#edit-notes")!;

const editChecked =
    document.querySelector<HTMLInputElement>("#edit-checked")!;

const editCancel =
    document.querySelector<HTMLButtonElement>("#edit-cancel")!;

const editPreview =
    document.querySelector<HTMLButtonElement>("#edit-preview")!;

const previewButton =
    document.querySelector<HTMLButtonElement>("#preview-btn")!;

const submitButton =
    document.querySelector<HTMLButtonElement>("#submit-btn")!;

const editStatus =
    document.querySelector<HTMLDivElement>("#edit-status")!;

const editorField =
    document.querySelector<HTMLDivElement>("#editor-field")!;

const textInput =
    document.querySelector<HTMLTextAreaElement>("#box-text")!;

const notesInput =
    document.querySelector<HTMLTextAreaElement>("#box-notes")!;

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
    // setBox("text", entry.text);
    textInput.value = entry.text;
    setBox("english", entry.english);
    // setBox("notes", entry.notes);
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
        "text",
        "english",
        "notes",
        "google",
        "chatgpt",
        "gemini",
        "claude",
        "deepl"
    ]) {
        setBox(field, "");
    }

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
 * Edit interface
 */

editButton.addEventListener("click", () => {
    const entry = filteredEntries[currentIndex];

    if (!entry) {
        return;
    }

    editName.value = "";
    editText.value = entry.text;
    editNotes.value = entry.notes ?? "";
    editChecked.checked = entry.checked === "True";

    editModal.classList.add("visible");
});


editCancel.addEventListener("click", () => {
    editModal.classList.remove("visible");
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
 * edit-mode logic
 */

function enterEditMode() {
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

    editorField.hidden = false;

    editButton.textContent = "Exit Edit Mode";

    editStatus.textContent =
        "Edit mode active. Enter your name and make your changes.";

    previewButton.disabled = true;
    submitButton.disabled = true;

    updateEditButtons();
}

function exitEditMode() {
    editMode = false;
    originalEdit = null;

    textInput.readOnly = true;
    notesInput.readOnly = true;

    editorField.hidden = true;

    editName.value = "";

    editButton.textContent = "EDIT";

    editStatus.textContent =
        "Editing is disabled.";

    previewButton.disabled = true;
    submitButton.disabled = true;

    showEntry();
}

editButton.addEventListener("click", () => {
    if (editMode) {
        exitEditMode();
    } else {
        enterEditMode();
    }
});

function hasChanges(): boolean {
    if (!originalEdit) {
        return false;
    }

    const entry = filteredEntries[currentIndex];

    if (!entry) {
        return false;
    }

    return (
        textInput.value !== originalEdit.text ||
        notesInput.value !== originalEdit.notes
    );
}

function updateEditButtons() {
    const changed = editMode && hasChanges();

    previewButton.disabled = !changed;
    submitButton.disabled =
        !changed || editName.value.trim() === "";
}

textInput.addEventListener("input", updateEditButtons);
notesInput.addEventListener("input", updateEditButtons);
editName.addEventListener("input", updateEditButtons);



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