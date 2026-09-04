import type { PendingEdit } from "./types";

export function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export function renderDiffCard(edit: PendingEdit): HTMLDivElement {
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

    return card;
}
