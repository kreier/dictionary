import "./style.css";

interface DictionaryEntry {
    key: string;
    text: string;
    english?: string;
    notes?: string;
    link?: string;
    tag?: string;
    category?: string;
}

let entries: DictionaryEntry[] = [];
let currentLanguage = "";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
    throw new Error("Could not find #app");
}

app.innerHTML = `
    <header>
        <h1>Dictionary</h1>

        <label>
            Language:
            <select id="language">
                <option value="">Select language...</option>
            </select>
        </label>
    </header>

    <main>
        <input
            id="search"
            type="search"
            placeholder="Search..."
            disabled
        >

        <div id="results"></div>
    </main>
`;

const languageSelect =
    document.querySelector<HTMLSelectElement>("#language")!;

const searchInput =
    document.querySelector<HTMLInputElement>("#search")!;

const results =
    document.querySelector<HTMLDivElement>("#results")!;


/*
 * Load a dictionary.
 *
 * The JSON files live in public/data/.
 *
 * For example:
 *
 * public/data/de.json
 *
 * becomes available in the browser as:
 *
 * /data/de.json
 */
async function loadLanguage(language: string) {
    currentLanguage = language;

    results.textContent = "Loading...";
    searchInput.disabled = true;

    const response = await fetch(`/data/${language}.json`);

    if (!response.ok) {
        throw new Error(
            `Could not load dictionary: ${response.status}`
        );
    }

    entries = await response.json();

    searchInput.disabled = false;
    searchInput.value = "";

    displayEntries(entries);
}


function displayEntries(items: DictionaryEntry[]) {
    results.innerHTML = "";

    if (items.length === 0) {
        results.textContent = "No entries found.";
        return;
    }

    for (const entry of items) {
        const element = document.createElement("article");

        element.className = "entry";

        element.innerHTML = `
            <h2>${escapeHtml(entry.key)}</h2>

            <div class="translation">
                ${escapeHtml(entry.text)}
            </div>

            ${
                entry.english
                    ? `<div class="english">
                         ${escapeHtml(entry.english)}
                       </div>`
                    : ""
            }
        `;

        results.appendChild(element);
    }
}


function search() {
    const query = searchInput.value
        .trim()
        .toLowerCase();

    if (!query) {
        displayEntries(entries);
        return;
    }

    const filtered = entries.filter(entry =>
        entry.key.toLowerCase().includes(query) ||
        entry.text.toLowerCase().includes(query) ||
        (entry.english ?? "").toLowerCase().includes(query)
    );

    displayEntries(filtered);
}


function escapeHtml(value: string): string {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
}


searchInput.addEventListener("input", search);


// Temporary language list.
//
// Later this will come from supported_languages.csv
// converted into a JSON file by the data-generation script.
const languages = [
    { code: "de", name: "German" },
    { code: "en", name: "English" },
    { code: "vi", name: "Vietnamese" }
];

for (const language of languages) {
    const option = document.createElement("option");

    option.value = language.code;
    option.textContent = language.name;

    languageSelect.appendChild(option);
}

languageSelect.addEventListener("change", () => {
    if (languageSelect.value) {
        loadLanguage(languageSelect.value)
            .catch(error => {
                console.error(error);
                results.textContent =
                    "Could not load dictionary.";
            });
    }
});