import type { DictionaryEntry, Language, SubmissionPayload } from "./types";

export const DEFAULT_WORKER_ENDPOINT =
    "https://update-dictionary.matthias-kreier.workers.dev/";

export async function fetchLanguages(): Promise<Language[]> {
    const response = await fetch(
        `${import.meta.env.BASE_URL}data/languages.json`
    );

    if (!response.ok) {
        throw new Error(
            `Could not load languages: ${response.status}`
        );
    }

    return response.json();
}

export async function fetchDictionary(language: string): Promise<DictionaryEntry[]> {
    const response = await fetch(
        `${import.meta.env.BASE_URL}data/${language}.json`
    );

    if (!response.ok) {
        throw new Error(
            `Could not load dictionary: ${response.status}`
        );
    }

    return response.json();
}

export async function submitChanges(
    endpoint: string,
    payload: SubmissionPayload
): Promise<{ issue_url?: string }> {
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

    return res.json();
}
