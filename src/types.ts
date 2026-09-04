export type Category =
    | "text"
    | "bible"
    | "A6"
    | "B9"
    | "wiki"
    | "other";

export const CATEGORIES: Category[] = [
    "text",
    "bible",
    "A6",
    "B9",
    "wiki",
    "other"
];

export interface DictionaryEntry {
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
    link?: string;
    category: Category;
}

export interface Language {
    key: string;
    language_str: string;
}

export interface PendingEdit {
    key: string;
    category: Category;
    text: string;
    notes: string;
    checked: boolean;
    origText: string;
    origNotes: string;
    origChecked: boolean;
}

export interface SubmissionChange {
    key: string;
    category: Category;
    text: string;
    notes: string;
    checked: string;
    origText: string;
    origNotes: string;
    origChecked: string;
}

export interface SubmissionPayload {
    action: string;
    lang: string;
    editor: string;
    date: string;
    turnstileToken: string;
    changes: SubmissionChange[];
}

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                options: {
                    sitekey: string;
                    callback?: (token: string) => void;
                    "expired-callback"?: () => void;
                    "error-callback"?: (error: string) => void;
                }
            ) => string;
            reset: (widgetId?: string) => void;
        };
    }
}
