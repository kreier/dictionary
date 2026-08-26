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
            <div class="box-content" id="box-text"></div>
        </div>

        <div class="box">
            <div class="box-label">English</div>
            <div class="box-content" id="box-english"></div>
        </div>

        <div class="box">
            <div class="box-label">Notes</div>
            <div class="box-content" id="box-notes"></div>
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

    </main>
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
    setBox("text", entry.text);
    setBox("english", entry.english);
    setBox("notes", entry.notes);
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