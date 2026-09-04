import type { DictionaryEntry } from "./types";

export interface WebReferenceLinks {
    englishUrl: string;
    targetUrl: string;
    label: string;
    sourceType: "bible" | "a6" | "b9" | "wiki";
}

interface BibleBookDef {
    num: number;
    slug: string;
    names: string[];
}

const BIBLE_BOOKS: BibleBookDef[] = [
    { num: 1, slug: "genesis", names: ["genesis", "gen", "ge"] },
    { num: 2, slug: "exodus", names: ["exodus", "ex"] },
    { num: 3, slug: "leviticus", names: ["leviticus", "lev", "le"] },
    { num: 4, slug: "numbers", names: ["numbers", "num", "nu"] },
    { num: 5, slug: "deuteronomy", names: ["deuteronomy", "deut", "de"] },
    { num: 6, slug: "joshua", names: ["joshua", "josh", "jos"] },
    { num: 7, slug: "judges", names: ["judges", "judg", "jg"] },
    { num: 8, slug: "ruth", names: ["ruth", "ru"] },
    { num: 9, slug: "1-samuel", names: ["1 samuel", "1 sam", "1sa"] },
    { num: 10, slug: "2-samuel", names: ["2 samuel", "2 sam", "2sa"] },
    { num: 11, slug: "1-kings", names: ["1 kings", "1 ki", "1ki"] },
    { num: 12, slug: "2-kings", names: ["2 kings", "2 ki", "2ki"] },
    { num: 13, slug: "1-chronicles", names: ["1 chronicles", "1 chron", "1ch"] },
    { num: 14, slug: "2-chronicles", names: ["2 chronicles", "2 chron", "2ch"] },
    { num: 15, slug: "ezra", names: ["ezra", "ezr"] },
    { num: 16, slug: "nehemiah", names: ["nehemiah", "neh", "ne"] },
    { num: 17, slug: "esther", names: ["esther", "esth", "es"] },
    { num: 18, slug: "job", names: ["job", "jb"] },
    { num: 19, slug: "psalms", names: ["psalms", "psalm", "ps"] },
    { num: 20, slug: "proverbs", names: ["proverbs", "prov", "pr"] },
    { num: 21, slug: "ecclesiastes", names: ["ecclesiastes", "eccl", "ec"] },
    { num: 22, slug: "song-of-solomon", names: ["song of solomon", "song of songs", "ca", "ss"] },
    { num: 23, slug: "isaiah", names: ["isaiah", "isa", "is"] },
    { num: 24, slug: "jeremiah", names: ["jeremiah", "jer", "je"] },
    { num: 25, slug: "lamentations", names: ["lamentations", "lam", "la"] },
    { num: 26, slug: "ezekiel", names: ["ezekiel", "ezek", "eze"] },
    { num: 27, slug: "daniel", names: ["daniel", "dan", "da"] },
    { num: 28, slug: "hosea", names: ["hosea", "hos", "ho"] },
    { num: 29, slug: "joel", names: ["joel", "joe", "jl"] },
    { num: 30, slug: "amos", names: ["amos", "am"] },
    { num: 31, slug: "obadiah", names: ["obadiah", "obad", "ob"] },
    { num: 32, slug: "jonah", names: ["jonah", "jon", "jnh"] },
    { num: 33, slug: "micah", names: ["micah", "mic", "mi"] },
    { num: 34, slug: "nahum", names: ["nahum", "nah", "na"] },
    { num: 35, slug: "habakkuk", names: ["habakkuk", "hab"] },
    { num: 36, slug: "zephaniah", names: ["zephaniah", "zeph", "zep"] },
    { num: 37, slug: "haggai", names: ["haggai", "hag", "hg"] },
    { num: 38, slug: "zechariah", names: ["zechariah", "zech", "zec"] },
    { num: 39, slug: "malachi", names: ["malachi", "mal"] },
    { num: 40, slug: "matthew", names: ["matthew", "matt", "mt"] },
    { num: 41, slug: "mark", names: ["mark", "mr", "mk"] },
    { num: 42, slug: "luke", names: ["luke", "lu", "lk"] },
    { num: 43, slug: "john", names: ["john", "joh", "jn"] },
    { num: 44, slug: "acts", names: ["acts", "ac"] },
    { num: 45, slug: "romans", names: ["romans", "rom", "ro"] },
    { num: 46, slug: "1-corinthians", names: ["1 corinthians", "1 cor", "1co"] },
    { num: 47, slug: "2-corinthians", names: ["2 corinthians", "2 cor", "2co"] },
    { num: 48, slug: "galatians", names: ["galatians", "gal", "ga"] },
    { num: 49, slug: "ephesians", names: ["ephesians", "eph"] },
    { num: 50, slug: "philippians", names: ["philippians", "phil", "php"] },
    { num: 51, slug: "colossians", names: ["colossians", "col"] },
    { num: 52, slug: "1-thessalonians", names: ["1 thessalonians", "1 thess", "1th"] },
    { num: 53, slug: "2-thessalonians", names: ["2 thessalonians", "2 thess", "2th"] },
    { num: 54, slug: "1-timothy", names: ["1 timothy", "1 tim", "1ti"] },
    { num: 55, slug: "2-timothy", names: ["2 timothy", "2 tim", "2ti"] },
    { num: 56, slug: "titus", names: ["titus", "tit"] },
    { num: 57, slug: "philemon", names: ["philemon", "phm"] },
    { num: 58, slug: "hebrews", names: ["hebrews", "heb"] },
    { num: 59, slug: "james", names: ["james", "jas"] },
    { num: 60, slug: "1-peter", names: ["1 peter", "1 pet", "1pe"] },
    { num: 61, slug: "2-peter", names: ["2 peter", "2 pet", "2pe"] },
    { num: 62, slug: "1-john", names: ["1 john", "1 jn", "1jo"] },
    { num: 63, slug: "2-john", names: ["2 john", "2 jn", "2jo"] },
    { num: 64, slug: "3-john", names: ["3 john", "3 jn", "3jo"] },
    { num: 65, slug: "jude", names: ["jude", "jud"] },
    { num: 66, slug: "revelation", names: ["revelation", "rev", "re"] }
];

export function parseBibleReference(notes: string | undefined, englishText?: string): {
    bookSlug: string;
    chapter: number;
    verse?: number;
    verseId?: number;
    label: string;
} | null {
    const textToSearch = (notes && /\d/.test(notes)) ? notes : (englishText || notes || "");
    if (!textToSearch.trim()) return null;

    // Matches e.g. "Genesis 3:15", "Luke 3:38", "1 Kings 6:1", "Gen 10:1", "Psalms 105:23"
    const regex = /((?:[1-3]\s+)?[A-Za-z]+)\s+(\d+)(?::(\d+))?/;
    let match = textToSearch.match(regex);
    if (!match && englishText && textToSearch !== englishText) {
        match = englishText.match(regex);
    }
    if (!match) return null;

    const bookRaw = match[1].toLowerCase().replace(/\s+/g, " ").trim();
    const chapter = Number.parseInt(match[2], 10);
    const verse = match[3] ? Number.parseInt(match[3], 10) : undefined;

    const book = BIBLE_BOOKS.find(b =>
        b.names.some(n => n === bookRaw || bookRaw.startsWith(n))
    );

    if (!book) return null;

    let verseId: number | undefined;
    if (verse !== undefined) {
        verseId = book.num * 1000000 + chapter * 1000 + verse;
    }

    const label = verse !== undefined
        ? `${book.slug.replace(/-/g, " ")} ${chapter}:${verse}`
        : `${book.slug.replace(/-/g, " ")} ${chapter}`;

    return {
        bookSlug: book.slug,
        chapter,
        verse,
        verseId,
        label
    };
}

interface LangBibleConfig {
    basePath: string;
    bookSlugs: Record<string, string>;
}

const BIBLE_LANG_CONFIGS: Record<string, LangBibleConfig> = {
    vi: {
        basePath: "thu-vien/kinh-thanh/nwt/cac-sach",
        bookSlugs: {
            "genesis": "S%C3%A1ng-th%E1%BA%BF",
            "exodus": "Xu%E1%BA%A5t-Ai-C%E1%BA%ADp",
            "numbers": "D%C3%A2n-s%E1%BB%91",
            "deuteronomy": "Ph%E1%BB%A5c-truy%E1%BB%81n-lu%E1%BA%ADt-l%E1%BB%87",
            "joshua": "Gi%C3%B4-su%C3%AA",
            "judges": "Quan-x%C3%A9t",
            "1-samuel": "1-Sa-mu-%C3%AAn",
            "1-kings": "1-C%C3%A1c-vua",
            "2-kings": "2-C%C3%A1c-vua",
            "1-chronicles": "1-S%E1%BB%AD-k%C3%BD",
            "ezra": "%C3%8A-x%C6%A1-ra",
            "esther": "%C3%8A-x%C6%A1-t%C3%AA",
            "psalms": "Thi-thi%C3%AAn",
            "isaiah": "%C3%8A-sai",
            "ezekiel": "%C3%8A-x%C3%AA-chi-%C3%AAn",
            "hosea": "%C3%94-s%C3%AA",
            "zechariah": "xa-cha-ri",
            "luke": "lu-ca",
            "acts": "C%C3%B4ng-v%E1%BB%A5"
        }
    }
};

export function getBibleLinks(notes: string | undefined, targetLang: string, englishText?: string): WebReferenceLinks {
    const parsed = parseBibleReference(notes, englishText);
    const lang = targetLang || "en";

    if (parsed) {
        const englishPath = `library/bible/nwt/books/${parsed.bookSlug}/${parsed.chapter}/`;
        const anchor = parsed.verseId ? `#v${parsed.verseId}` : "";
        const englishUrl = `https://www.jw.org/en/${englishPath}${anchor}`;

        let targetUrl: string;
        const config = BIBLE_LANG_CONFIGS[lang];
        if (config) {
            const localizedSlug = config.bookSlugs[parsed.bookSlug] || parsed.bookSlug;
            targetUrl = `https://www.jw.org/${lang}/${config.basePath}/${localizedSlug}/${parsed.chapter}/${anchor}`;
        } else if (lang === "en") {
            targetUrl = englishUrl;
        } else {
            targetUrl = `https://www.jw.org/${lang}/library/bible/nwt/books/`;
        }

        return {
            englishUrl,
            targetUrl,
            label: parsed.label.toUpperCase(),
            sourceType: "bible"
        };
    }

    const fallbackTarget = BIBLE_LANG_CONFIGS[lang]
        ? `https://www.jw.org/${lang}/${BIBLE_LANG_CONFIGS[lang].basePath}/`
        : `https://www.jw.org/${lang}/library/bible/nwt/books/`;

    return {
        englishUrl: "https://www.jw.org/en/library/bible/nwt/books/",
        targetUrl: fallbackTarget,
        label: "BIBLE (NWT)",
        sourceType: "bible"
    };
}

export function getA6Links(tag: string | undefined, targetLang: string): WebReferenceLinks {
    const lang = targetLang || "en";
    const isIsrael = tag === "A6-B";
    const subpath = isIsrael ? "kings-of-israel" : "kings-of-judah";
    const title = isIsrael ? "Kings of Israel (Appendix A6)" : "Kings of Judah (Appendix A6)";

    return {
        englishUrl: `https://www.jw.org/en/library/bible/nwt/appendix-a/${subpath}/`,
        targetUrl: `https://www.jw.org/${lang}/library/bible/nwt/appendix-a/${subpath}/`,
        label: title,
        sourceType: "a6"
    };
}

export function getB9Links(targetLang: string): WebReferenceLinks {
    const lang = targetLang || "en";
    return {
        englishUrl: "https://www.jw.org/en/library/bible/nwt/appendix-b/daniel-2-image/",
        targetUrl: `https://www.jw.org/${lang}/library/bible/nwt/appendix-b/daniel-2-image/`,
        label: "Daniel 2 Image (Appendix B9)",
        sourceType: "b9"
    };
}

export function getWikiLinks(entry: DictionaryEntry, targetLang: string): WebReferenceLinks {
    const lang = targetLang || "en";
    const rawLink = entry.link?.trim();

    let articleName = "";
    if (rawLink && rawLink.includes("/wiki/")) {
        articleName = rawLink.split("/wiki/")[1];
    } else {
        articleName = encodeURIComponent(entry.key.replace(/ /g, "_"));
    }

    const englishUrl = `https://en.wikipedia.org/wiki/${articleName}`;
    const targetUrl = (rawLink && rawLink.startsWith("http") && !rawLink.includes("en.wikipedia.org"))
        ? rawLink
        : `https://${lang}.wikipedia.org/wiki/${articleName}`;

    return {
        englishUrl,
        targetUrl,
        label: `Wikipedia: ${entry.english || entry.key}`,
        sourceType: "wiki"
    };
}

export function getReferenceLinksForEntry(
    entry: DictionaryEntry,
    targetLang: string
): WebReferenceLinks | null {
    switch (entry.category) {
        case "bible":
            return getBibleLinks(entry.notes, targetLang, entry.english);
        case "A6":
            return getA6Links(entry.tag, targetLang);
        case "B9":
            return getB9Links(targetLang);
        case "wiki":
            return getWikiLinks(entry, targetLang);
        default:
            return null;
    }
}
