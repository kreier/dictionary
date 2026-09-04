import { DEFAULT_WORKER_ENDPOINT } from "./api";

export function initAppShell(app: HTMLElement): {
    languageSelect: HTMLSelectElement;
    categoryButtons: NodeListOf<HTMLButtonElement>;
    searchInput: HTMLInputElement;
    keySelect: HTMLSelectElement;
    prevButton: HTMLButtonElement;
    nextButton: HTMLButtonElement;
    textInput: HTMLTextAreaElement;
    notesInput: HTMLTextAreaElement;
    boxChecked: HTMLInputElement;
    checkedEmoji: HTMLSpanElement;
    checkedLabel: HTMLSpanElement;
    checkedInfo: HTMLSpanElement;
    checkedToggleLabel: HTMLLabelElement;
    editButton: HTMLButtonElement;
    previewButton: HTMLButtonElement;
    previewTimelineButton: HTMLButtonElement;
    submitButton: HTMLButtonElement;
    editStatus: HTMLDivElement;
    activationModal: HTMLDivElement;
    activationNameInput: HTMLInputElement;
    activationCancelBtn: HTMLButtonElement;
    activationConfirmBtn: HTMLButtonElement;
    previewModal: HTMLDivElement;
    previewSummaryInfo: HTMLSpanElement;
    previewEditorInfo: HTMLSpanElement;
    previewChangesList: HTMLDivElement;
    previewCloseBtn: HTMLButtonElement;
    submitModal: HTMLDivElement;
    submitSummaryList: HTMLDivElement;
    submitWorkerUrlInput: HTMLInputElement;
    turnstileContainer: HTMLDivElement;
    submitStatusMessage: HTMLDivElement;
    submitCancelBtn: HTMLButtonElement;
    submitConfirmBtn: HTMLButtonElement;
    infoModal: HTMLDivElement;
    infoModalTitle: HTMLHeadingElement;
    infoModalMessage: HTMLParagraphElement;
    infoModalClose: HTMLButtonElement;
} {
    const workerEndpoint =
        localStorage.getItem("dictionary_worker_url") ||
        DEFAULT_WORKER_ENDPOINT;

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
                <div id="turnstile-container"></div>
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

    return {
        languageSelect: app.querySelector<HTMLSelectElement>("#language-select")!,
        categoryButtons: app.querySelectorAll<HTMLButtonElement>(".cat-btn"),
        searchInput: app.querySelector<HTMLInputElement>("#search-input")!,
        keySelect: app.querySelector<HTMLSelectElement>("#key-select")!,
        prevButton: app.querySelector<HTMLButtonElement>("#prev-btn")!,
        nextButton: app.querySelector<HTMLButtonElement>("#next-btn")!,
        textInput: app.querySelector<HTMLTextAreaElement>("#box-text")!,
        notesInput: app.querySelector<HTMLTextAreaElement>("#box-notes")!,
        boxChecked: app.querySelector<HTMLInputElement>("#box-checked")!,
        checkedEmoji: app.querySelector<HTMLSpanElement>("#checked-emoji")!,
        checkedLabel: app.querySelector<HTMLSpanElement>("#checked-label")!,
        checkedInfo: app.querySelector<HTMLSpanElement>("#checked-info")!,
        checkedToggleLabel: app.querySelector<HTMLLabelElement>("#checked-toggle-label")!,
        editButton: app.querySelector<HTMLButtonElement>("#edit-btn")!,
        previewButton: app.querySelector<HTMLButtonElement>("#preview-btn")!,
        previewTimelineButton: app.querySelector<HTMLButtonElement>("#preview-timeline-btn")!,
        submitButton: app.querySelector<HTMLButtonElement>("#submit-btn")!,
        editStatus: app.querySelector<HTMLDivElement>("#edit-status")!,
        activationModal: app.querySelector<HTMLDivElement>("#activation-modal")!,
        activationNameInput: app.querySelector<HTMLInputElement>("#activation-name")!,
        activationCancelBtn: app.querySelector<HTMLButtonElement>("#activation-cancel-btn")!,
        activationConfirmBtn: app.querySelector<HTMLButtonElement>("#activation-confirm-btn")!,
        previewModal: app.querySelector<HTMLDivElement>("#preview-modal")!,
        previewSummaryInfo: app.querySelector<HTMLSpanElement>("#preview-summary-info")!,
        previewEditorInfo: app.querySelector<HTMLSpanElement>("#preview-editor-info")!,
        previewChangesList: app.querySelector<HTMLDivElement>("#preview-changes-list")!,
        previewCloseBtn: app.querySelector<HTMLButtonElement>("#preview-close-btn")!,
        submitModal: app.querySelector<HTMLDivElement>("#submit-modal")!,
        submitSummaryList: app.querySelector<HTMLDivElement>("#submit-summary-list")!,
        submitWorkerUrlInput: app.querySelector<HTMLInputElement>("#submit-worker-url")!,
        turnstileContainer: app.querySelector<HTMLDivElement>("#turnstile-container")!,
        submitStatusMessage: app.querySelector<HTMLDivElement>("#submit-status-message")!,
        submitCancelBtn: app.querySelector<HTMLButtonElement>("#submit-cancel-btn")!,
        submitConfirmBtn: app.querySelector<HTMLButtonElement>("#submit-confirm-btn")!,
        infoModal: app.querySelector<HTMLDivElement>("#info-modal")!,
        infoModalTitle: app.querySelector<HTMLHeadingElement>("#info-modal-title")!,
        infoModalMessage: app.querySelector<HTMLParagraphElement>("#info-modal-message")!,
        infoModalClose: app.querySelector<HTMLButtonElement>("#info-modal-close")!,
    };
}
