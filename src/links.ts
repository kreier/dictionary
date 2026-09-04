import type { DictionaryEntry } from "./types";

export interface WebReferenceLinks {
    englishUrl: string;
    targetUrl: string;
    label: string;
    sourceType: "bible" | "a6" | "b9" | "wiki";
}

export interface BibleBookDef {
    num: number;
    slug: string;
    names: string[];
}

export const BIBLE_BOOKS: BibleBookDef[] = [
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
    { num: 13, slug: "1-chronicles", names: ["1 chronicles", "1 chron", "1 chr", "1ch"] },
    { num: 14, slug: "2-chronicles", names: ["2 chronicles", "2 chron", "2 chr", "2ch"] },
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

export interface ParsedBibleRef {
    bookNum: number;
    bookSlug: string;
    chapter: number;
    verses: number[];
    verse?: number;
    verseId?: number;
    isRange?: boolean;
    rangeStart?: number;
    rangeEnd?: number;
    label: string;
}

export function parseAllBibleReferences(notes: string | undefined, englishText?: string): ParsedBibleRef[] {
    const regex = /((?:[1-3]\s+)?[A-Za-z]+)\s+(\d+)(?::(\d+(?:\s*-\s*\d+)?(?:\s*,\s*\d+)*))?/g;
    const candidates = [notes, englishText].filter((t): t is string => Boolean(t && t.trim()));
    const results: ParsedBibleRef[] = [];

    for (const text of candidates) {
        regex.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(text)) !== null) {
            const rawBook = match[1].toLowerCase().replace(/\s+/g, " ").trim();
            const book = BIBLE_BOOKS.find(b => b.names.includes(rawBook));
            if (!book) continue;

            const chapter = Number.parseInt(match[2], 10);
            const verseSpec = match[3] ? match[3].trim() : undefined;
            const verses: number[] = [];
            let isRange = false;
            let rangeStart: number | undefined;
            let rangeEnd: number | undefined;

            if (verseSpec) {
                if (verseSpec.includes("-")) {
                    const parts = verseSpec.split("-").map(s => Number.parseInt(s.trim(), 10));
                    if (!Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
                        isRange = true;
                        rangeStart = parts[0];
                        rangeEnd = parts[1];
                        for (let v = parts[0]; v <= parts[1]; v++) {
                            verses.push(v);
                        }
                    }
                } else {
                    const list = verseSpec.split(",").map(s => Number.parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
                    verses.push(...list);
                }
            }

            const bookDisplay = book.slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            let label = `${bookDisplay} ${chapter}`;
            if (isRange && rangeStart !== undefined && rangeEnd !== undefined) {
                label = `${bookDisplay} ${chapter}:${rangeStart}-${rangeEnd}`;
            } else if (verses.length > 0) {
                label = `${bookDisplay} ${chapter}:${verses.join(", ")}`;
            }

            const firstVerse = verses.length > 0 ? verses[0] : undefined;
            const firstVerseId = firstVerse !== undefined ? book.num * 1000000 + chapter * 1000 + firstVerse : undefined;

            results.push({
                bookNum: book.num,
                bookSlug: book.slug,
                chapter,
                verses,
                verse: firstVerse,
                verseId: firstVerseId,
                isRange,
                rangeStart,
                rangeEnd,
                label
            });
        }
        if (results.length > 0) break;
    }

    return results;
}

export function parseBibleReference(notes: string | undefined, englishText?: string): ParsedBibleRef | null {
    const refs = parseAllBibleReferences(notes, englishText);
    return refs.length > 0 ? refs[0] : null;
}

export function getBibleLinks(notes: string | undefined, targetLang: string, englishText?: string): WebReferenceLinks {
    const parsedRefs = parseAllBibleReferences(notes, englishText);
    const lang = targetLang || "en";

    if (parsedRefs.length > 0) {
        const primary = parsedRefs[0];
        const labels = parsedRefs.map(r => r.label.toUpperCase()).join("; ");

        let anchor = "";
        let bibleParam = "";

        const bookCode = String(primary.bookNum).padStart(2, "0");
        const chapterCode = String(primary.chapter).padStart(3, "0");

        if (primary.isRange && primary.rangeStart !== undefined && primary.rangeEnd !== undefined) {
            const startVerseCode = String(primary.rangeStart).padStart(3, "0");
            const endVerseCode = String(primary.rangeEnd).padStart(3, "0");
            const startVerseId = primary.bookNum * 1000000 + primary.chapter * 1000 + primary.rangeStart;
            const endVerseId = primary.bookNum * 1000000 + primary.chapter * 1000 + primary.rangeEnd;
            anchor = `#v${startVerseId}-v${endVerseId}`;
            bibleParam = `${bookCode}${chapterCode}${startVerseCode}-${bookCode}${chapterCode}${endVerseCode}`;
        } else if (primary.verses.length > 0) {
            const verseCode = String(primary.verses[0]).padStart(3, "0");
            const verseId = primary.bookNum * 1000000 + primary.chapter * 1000 + primary.verses[0];
            anchor = `#v${verseId}`;
            bibleParam = `${bookCode}${chapterCode}${verseCode}`;
        } else {
            bibleParam = `${bookCode}${chapterCode}000`;
        }

        const englishPath = `library/bible/nwt/books/${primary.bookSlug}/${primary.chapter}/`;
        const englishUrl = `https://www.jw.org/en/${englishPath}${anchor}`;
        const targetUrl = lang === "en"
            ? englishUrl
            : `https://www.jw.org/finder?locale=${lang}&bible=${bibleParam}`;

        return {
            englishUrl,
            targetUrl,
            label: labels,
            sourceType: "bible"
        };
    }

    const fallbackTarget = lang === "en"
        ? "https://www.jw.org/en/library/bible/nwt/books/"
        : `https://www.jw.org/finder?locale=${lang}&pub=nwt`;

    return {
        englishUrl: "https://www.jw.org/en/library/bible/nwt/books/",
        targetUrl: fallbackTarget,
        label: "BIBLE (NWT)",
        sourceType: "bible"
    };
}

export const A6_DIRECT_URLS: Record<string, Record<string, string>> = {
    "A6-A": {
        "en": "https://www.jw.org/en/library/bible/nwt/appendix-a/kings-of-judah/",
        "hy": "https://www.jw.org/hy/%D5%A3%D6%80%D5%A1%D5%A4%D5%A1%D6%80%D5%A1%D5%B6/bible/nwt/%D5%B0%D5%A1%D5%BE%D5%A5%D5%AC%D5%BE%D5%A1%D5%AE-%D5%A1/%D5%B0%D5%B8%D6%82%D5%A4%D5%A1%D5%B5%D5%AB-%D5%A9%D5%A1%D5%A3%D5%A1%D5%BE%D5%B8%D6%80%D5%B6%D5%A5%D6%80%D5%A8/",
        "ceb": "https://www.jw.org/ceb/librarya/bibliya/nwt/apendise-a/mga-hari-sa-juda/",
        "nl": "https://www.jw.org/nl/bibliotheek/bijbel/nwt/appendix-a/koningen-van-juda/",
        "et": "https://www.jw.org/et/raamatukogu/piibel/nwt/lisa-a/juuda-kuningad/",
        "fj": "https://www.jw.org/fj/ka-e-vakarautaki/ivolatabu/nwt/ikuri-a/tui-juta/",
        "tl": "https://www.jw.org/tl/library/bibliya/nwt/apendise-a/mga-hari-ng-juda/",
        "fi": "https://www.jw.org/fi/kirjasto/raamattu/nwt/liite-a/juudan-kuninkaat/",
        "fr": "https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/appendice-a/rois-de-juda-et-d-israel/",
        "de": "https://www.jw.org/de/bibliothek/bibel/nwt/anhang-a/koenige-juda/",
        "el": "https://www.jw.org/el/%CE%B2%CE%B9%CE%B2%CE%BB%CE%B9%CE%BF%CE%B8%CE%AE%CE%BA%CE%B7/%CE%B1%CE%B3%CE%AF%CE%B1-%CE%B3%CF%81%CE%B1%CF%86%CE%AE/nwt/%CF%80%CE%B1%CF%81%CE%AC%CF%81%CF%84%CE%B7%CE%BC%CE%B1-%CE%B1/%CE%B2%CE%B1%CF%83%CE%B9%CE%BB%CE%B9%CE%AC%CE%B4%CE%B5%CF%82-%CF%84%CE%BF%CF%85-%CE%B9%CE%BF%CF%8D%CE%B4%CE%B1/",
        "he": "https://www.jw.org/he/%D7%A1%D7%A4%D7%A8%D7%99%D7%99%D7%94/%D7%94%D7%AA%D7%A0%D7%9A-%D7%95%D7%9B%D7%AA%D7%91%D7%99-%D7%94%D7%A7%D7%95%D7%93%D7%A9-%D7%94%D7%99%D7%95%D7%95%D7%A0%D7%99%D7%99%D7%9D/nwt/%D7%A0%D7%A1%D7%A4%D7%97-%D7%90/%D7%9E%D7%9C%D7%9B%D7%99-%D7%99%D7%94%D7%95%D7%93%D7%94/",
        "hi": "https://www.jw.org/hi/%E0%A4%B2%E0%A4%BE%E0%A4%87%E0%A4%AC%E0%A5%8D%E0%A4%B0%E0%A5%87%E0%A4%B0%E0%A5%80/%E0%A4%AC%E0%A4%BE%E0%A4%87%E0%A4%AC%E0%A4%B2/nwt/%E0%A4%85%E0%A4%A4%E0%A4%BF%E0%A4%B0%E0%A4%BF%E0%A4%95%E0%A5%8D%E2%80%8D%E0%A4%A4-%E0%A4%B2%E0%A5%87%E0%A4%96-%E0%A4%95/%E0%A4%AF%E0%A4%B9%E0%A5%82%E0%A4%A6%E0%A4%BE-%E0%A4%95%E0%A5%87-%E0%A4%B0%E0%A4%BE%E0%A4%9C%E0%A4%BE/",
        "hu": "https://www.jw.org/hu/konyvtar/biblia/nwt/a-fuggelek/juda-kiralyai/",
        "ig": "https://www.jw.org/ig/ihe-ndi-anyi-nwere/baibul/nwt/ihe-ndi-ozo-a-kowara-nke-a/ndi-eze-juda/",
        "ilo": "https://www.jw.org/ilo/libraria/biblia/nwt/apendise-a/dagiti-ari-ti-juda/",
        "id": "https://www.jw.org/id/perpustakaan/alkitab/nwt/lampiran-a/raja-raja-yehuda/",
        "it": "https://www.jw.org/it/biblioteca-digitale/bibbia/nwt/appendice-a/re-di-giuda/",
        "ja": "https://www.jw.org/ja/%E3%83%A9%E3%82%A4%E3%83%96%E3%83%A9%E3%83%AA%E3%83%BC/%E8%81%96%E6%9B%B8/nwt/%E4%BB%98%E9%8C%B2A/%E3%83%A6%E3%83%80%E3%81%AE%E7%8E%8B/",
        "jv": "https://www.jw.org/jv/perpustakaan/alkitab/nwt/lampiran-a/nabi-raja-yehuda/",
        "kn": "https://www.jw.org/kn/%E0%B2%B2%E0%B3%88%E0%B2%AC%E0%B3%8D%E0%B2%B0%E0%B2%B0%E0%B2%BF/%E0%B2%AC%E0%B3%88%E0%B2%AC%E0%B2%B2%E0%B3%8D%E2%80%8C/nwt/%E0%B2%AA%E0%B2%B0%E0%B2%BF%E0%B2%B6%E0%B2%BF%E0%B2%B7%E0%B3%8D%E0%B2%9F-%E0%B2%8E/%E0%B2%AF%E0%B3%86%E0%B2%B9%E0%B3%82%E0%B2%A6%E0%B2%A6-%E0%B2%B0%E0%B2%BE%E0%B2%9C%E0%B2%B0%E0%B3%81/",
        "km": "https://www.jw.org/km/%E1%9E%94%E1%9E%8E%E1%9F%92%E1%9E%8E%E1%9E%B6%E1%9E%9B%E1%9F%90%E1%9E%99/%E1%9E%82%E1%9E%98%E1%9F%92%E1%9E%96%E1%9E%B8%E1%9E%9A/nwt/%E1%9E%9F%E1%9F%81%E1%9E%85%E1%9E%80%E1%9F%92%E1%9E%8A%E1%9E%B8-%E1%9E%96%E1%9E%93%E1%9F%92%E1%9E%99%E1%9E%9B%E1%9F%8B-%E1%9E%94%E1%9E%93%E1%9F%92%E1%9E%90%E1%9F%82%E1%9E%98-%E1%9E%95%E1%9F%92%E1%9E%93%E1%9F%82%E1%9E%80-%E1%9E%80/%E1%9E%9F%E1%9F%92%E1%9E%8A%E1%9F%81%E1%9E%85-%E1%9E%93%E1%9F%83-%E1%9E%99%E1%9E%BC%E1%9E%8A%E1%9E%B6/",
        "kg": "https://www.jw.org/kg/biblioteke/biblia/nwt/bangindu-ya-ngika-a/bantotila-ya-yuda/",
        "ko": "https://www.jw.org/ko/%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC/%EC%84%B1%EA%B2%BD/nwt/%EB%B6%80%EB%A1%9D-%EA%B0%80/%EC%9C%A0%EB%8B%A4%EC%9D%98-%EC%99%95/",
        "lo": "https://www.jw.org/lo/%E0%BA%AA%E0%BA%B7%E0%BB%88%E0%BB%81%E0%BA%A5%E0%BA%B0%E0%BA%AA%E0%BA%B4%E0%BB%88%E0%BA%87%E0%BA%9E%E0%BA%B4%E0%BA%A1/%E0%BA%84%E0%BA%B3%E0%BA%9E%E0%BA%B5%E0%BB%84%E0%BA%9A%E0%BB%80%E0%BA%9A%E0%BA%B4%E0%BA%99/nwt/%E0%BA%9E%E0%BA%B2%E0%BA%81%E0%BA%9C%E0%BA%B0%E0%BB%9C%E0%BA%A7%E0%BA%81-%E0%BA%81/%E0%BA%81%E0%BA%B0%E0%BA%AA%E0%BA%B1%E0%BA%94%E0%BA%A2%E0%BA%B9%E0%BA%94%E0%BA%B2h/",
        "ms": "https://www.jw.org/ms/perpustakaan/bible/nwt/lampiran-a/raja-yehuda/",
        "ml": "https://www.jw.org/ml/%E0%B4%B2%E0%B5%88%E0%B4%AC%E0%B5%8D%E0%B4%B0%E0%B4%B1%E0%B4%BF/%E0%B4%AC%E0%B5%88%E0%B4%AC%E0%B4%BF%E0%B5%BE/nwt/%E0%B4%85%E0%B4%A8%E0%B5%81%E0%B4%AC%E0%B4%A8%E0%B5%8D%E0%B4%A7%E0%B4%82-%E0%B4%8E/%E0%B4%AF%E0%B4%B9%E0%B5%82%E0%B4%A6%E0%B4%AF%E0%B4%BF%E0%B4%B2%E0%B5%86-%E0%B4%B0%E0%B4%BE%E0%B4%9C%E0%B4%BE%E0%B4%95%E0%B5%8D%E0%B4%95%E0%B4%A8%E0%B5%8D%E0%B4%AE%E0%B4%BE%E0%B5%BC/",
        "mr": "https://www.jw.org/mr/%E0%A4%B2%E0%A4%BE%E0%A4%AF%E0%A4%AC%E0%A5%8D%E0%A4%B0%E0%A4%B0%E0%A5%80/%E0%A4%AC%E0%A4%BE%E0%A4%AF%E0%A4%AC%E0%A4%B2/nwt/%E0%A4%85%E0%A4%A4%E0%A4%BF%E0%A4%B0%E0%A4%BF%E0%A4%95%E0%A5%8D%E2%80%8D%E0%A4%A4-%E0%A4%B2%E0%A5%87%E0%A4%96-%E0%A4%95/%E0%A4%AF%E0%A4%B9%E0%A5%82%E0%A4%A6%E0%A4%BE%E0%A4%9A%E0%A5%87-%E0%A4%B0%E0%A4%BE%E0%A4%9C%E0%A5%87/",
        "my": "https://www.jw.org/my/%E1%80%85%E1%80%AC%E1%80%80%E1%80%BC%E1%80%8A%E1%80%B7%E1%80%BA%E1%80%90%E1%80%AD%E1%80%AF%E1%80%80%E1%80%BA/%E1%80%9E%E1%80%99%E1%80%B9%E1%80%99%E1%80%AC%E1%80%80%E1%80%BB%E1%80%99%E1%80%BA%E1%80%B8%E1%80%85%E1%80%AC/nwt/%E1%80%94%E1%80%B1%E1%80%AC%E1%80%80%E1%80%BA%E1%80%86%E1%80%80%E1%80%BA%E1%80%90%E1%80%BD%E1%80%B2-%E1%80%80/%E1%80%9A%E1%80%AF-%E1%80%92-%E1%80%98%E1%80%AF%E1%80%9B%E1%80%84%E1%80%BA%E1%80%99%E1%80%BB%E1%80%AC%E1%80%B8/",
        "no": "https://www.jw.org/no/bibliotek/bibelen/nwt/tillegg-a/konger-i-juda/",
        "fa": "https://www.jw.org/fa/%DA%A9%D8%AA%D8%A7%D8%A8%D8%AE%D8%A7%D9%86%D9%87/%DA%A9%D8%AA%D8%A7%D8%A8-%D9%85%D9%82%D8%AF%D8%B3/nwt/%D8%B6%D9%85%DB%8C%D9%85%D9%87-%D8%A7%D9%84%D9%81/%D9%BE%D8%A7%D8%AF%D8%B4%D8%A7%D9%87%D8%A7%D9%86-%DB%8C%D9%87%D9%88%D8%AF%D8%A7/",
        "pl": "https://www.jw.org/pl/biblioteka/biblia/nwt/dodatek-a/krolowie-judy/",
        "pt": "https://www.jw.org/pt/biblioteca/biblia/nwt/apendice-a/reis-de-juda/",
        "pa": "https://www.jw.org/pa/%E0%A8%B2%E0%A8%BE%E0%A8%87%E0%A8%AC%E0%A9%8D%E0%A8%B0%E0%A9%87%E0%A8%B0%E0%A9%80/%E0%A8%AC%E0%A8%BE%E0%A8%88%E0%A8%AC%E0%A8%B2/nwt/%E0%A8%B5%E0%A8%A7%E0%A9%87%E0%A8%B0%E0%A9%87-%E0%A8%9C%E0%A8%BE%E0%A8%A3%E0%A8%95%E0%A8%BE%E0%A8%B0%E0%A9%80-1/%E0%A8%AF%E0%A8%B9%E0%A9%82%E0%A8%A6%E0%A8%BE%E0%A8%B9-%E0%A8%A6%E0%A9%87-%E0%A8%B0%E0%A8%BE%E0%A8%9C%E0%A9%87/",
        "ru": "https://www.jw.org/ru/%D0%B1%D0%B8%D0%B1%D0%BB%D0%B8%D0%BE%D1%82%D0%B5%D0%BA%D0%B0/%D0%B1%D0%B8%D0%B1%D0%BB%D0%B8%D1%8F/nwt/%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B0/%D1%86%D0%B0%D1%80%D0%B8-%D0%B8%D1%83%D0%B4%D0%B5%D0%B8/",
        "si": "https://www.jw.org/si/%E0%B6%BD%E0%B6%BA%E0%B7%92%E0%B6%B6%E0%B7%8A%E2%80%8D%E0%B6%BB%E0%B6%BB%E0%B7%92/%E0%B6%B6%E0%B6%BA%E0%B7%92%E0%B6%B6%E0%B6%BD%E0%B6%BA/nwt/%E0%B6%8B%E0%B6%B4%E0%B6%9C%E0%B7%8A%E2%80%8D%E0%B6%BB%E0%B6%B1%E0%B7%8A%E0%B6%AE%E0%B6%BA-A/%E0%B6%BA%E0%B7%96%E0%B6%AF%E0%B7%8F-%E0%B6%BB%E0%B6%A2%E0%B7%80%E0%B6%BB%E0%B7%94/",
        "es": "https://www.jw.org/es/biblioteca/biblia/nwt/apendice-a/reyes-de-juda/",
        "sw": "https://www.jw.org/sw/maktaba/biblia/nwt/nyongeza-a/wafalme-wa-yuda/",
        "sv": "https://www.jw.org/sv/bibliotek/bibeln/nwt/till%C3%A4gg-a/kungar-i-juda/",
        "ta": "https://www.jw.org/ta/%E0%AE%B2%E0%AF%88%E0%AE%AA%E0%AF%8D%E0%AE%B0%E0%AE%B0%E0%AE%BF/%E0%AE%AA%E0%AF%88%E0%AE%AA%E0%AE%BF%E0%AE%B3%E0%AF%8D/nwt/%E0%AE%87%E0%AE%A3%E0%AF%88%E0%AE%AA%E0%AF%8D%E0%AE%AA%E0%AF%81-a/%E0%AE%AF%E0%AF%82%E0%AE%A4%E0%AE%BE%E0%AE%B5%E0%AE%BF%E0%AE%A9%E0%AF%8D-%E0%AE%B0%E0%AE%BE%E0%AE%9C%E0%AE%BE%E0%AE%95%E0%AF%8D%E0%AE%95%E0%AE%B3%E0%AF%8D/",
        "te": "https://www.jw.org/te/%E0%B0%B2%E0%B1%88%E0%B0%AC%E0%B1%8D%E0%B0%B0%E0%B0%B0%E0%B1%80/%E0%B0%AC%E0%B1%88%E0%B0%AC%E0%B0%BF%E0%B0%B2%E0%B1%81/nwt/%E0%B0%85%E0%B0%A8%E0%B1%81%E0%B0%AC%E0%B0%82%E0%B0%A7%E0%B0%82-a/%E0%B0%AF%E0%B1%82%E0%B0%A6%E0%B0%BE-%E0%B0%B0%E0%B0%BE%E0%B0%9C%E0%B1%81%E0%B0%B2%E0%B1%81/",
        "th": "https://www.jw.org/th/%E0%B8%AB%E0%B8%99%E0%B8%B1%E0%B8%87%E0%B8%AA%E0%B8%B7%E0%B8%AD%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%AA%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%95%E0%B9%88%E0%B8%B2%E0%B8%87%E0%B9%86/%E0%B8%84%E0%B8%B1%E0%B8%A1%E0%B8%A0%E0%B8%B5%E0%B8%A3%E0%B9%8C%E0%B9%84%E0%B8%9A%E0%B9%80%E0%B8%9A%E0%B8%B4%E0%B8%A5/nwt/%E0%B8%A0%E0%B8%B2%E0%B8%84%E0%B8%9C%E0%B8%99%E0%B8%A7%E0%B8%81-%E0%B8%81/%E0%B8%81%E0%B8%A9%E0%B8%B1%E0%B8%95%E0%B8%A3%E0%B8%B4%E0%B8%A2%E0%B9%8C%E0%B8%A2%E0%B8%B9%E0%B8%94%E0%B8%B2%E0%B8%AB%E0%B9%8C/",
        "tr": "https://www.jw.org/tr/kutuphane/kutsal-kitap/nwt/ek-a/yahuda-krallari/",
        "uk": "https://www.jw.org/uk/%D0%B1%D1%96%D0%B1%D0%BB%D1%96%D0%BE%D1%82%D0%B5%D0%BA%D0%B0/%D0%B1%D1%96%D0%B1%D0%BB%D1%96%D1%8F/nwt/%D0%B4%D0%BE%D0%B4%D0%B0%D1%82%D0%BE%D0%BA-%D0%B0/%D1%86%D0%B0%D1%80%D1%96-%D1%8E%D0%B4%D0%B8/",
        "vi": "https://www.jw.org/vi/thu-vien/kinh-thanh/nwt/phu-luc-a/cac-vua-giuda/"
    },
    "A6-B": {
        "en": "https://www.jw.org/en/library/bible/nwt/appendix-a/kings-of-israel/",
        "hy": "https://www.jw.org/hy/%D5%A3%D6%80%D5%A1%D5%A4%D5%A1%D6%80%D5%A1%D5%B6/bible/nwt/%D5%B0%D5%A1%D5%BE%D5%A5%D5%AC%D5%BE%D5%A1%D5%AE-%D5%A1/%D5%AB%D5%BD%D6%80%D5%A1%D5%B5%D5%A5%D5%AC%D5%AB-%D5%A9%D5%A1%D5%A3%D5%A1%D5%BE%D5%B8%D6%80%D5%B6%D5%A5%D6%80%D5%A8/",
        "ceb": "https://www.jw.org/ceb/librarya/bibliya/nwt/apendise-a/mga-hari-sa-israel/",
        "nl": "https://www.jw.org/nl/bibliotheek/bijbel/nwt/appendix-a/koningen-van-israel/",
        "et": "https://www.jw.org/et/raamatukogu/piibel/nwt/lisa-a/iisraeli-kuningad/",
        "fj": "https://www.jw.org/fj/ka-e-vakarautaki/ivolatabu/nwt/ikuri-a/tui-kei-isireli/",
        "tl": "https://www.jw.org/tl/library/bibliya/nwt/apendise-a/mga-hari-ng-israel/",
        "fi": "https://www.jw.org/fi/kirjasto/raamattu/nwt/liite-a/israelin-kuninkaat/",
        "fr": "https://www.jw.org/fr/biblioth%C3%A8que/bible/nwt/appendice-a/rois-de-juda-et-d-israel-2/",
        "de": "https://www.jw.org/de/bibliothek/bibel/nwt/anhang-a/koenige-israel/",
        "el": "https://www.jw.org/el/%CE%B2%CE%B9%CE%B2%CE%BB%CE%B9%CE%BF%CE%B8%CE%AE%CE%BA%CE%B7/%CE%B1%CE%B3%CE%AF%CE%B1-%CE%B3%CF%81%CE%B1%CF%86%CE%AE/nwt/%CF%80%CE%B1%CF%81%CE%AC%CF%81%CF%84%CE%B7%CE%BC%CE%B1-%CE%B1/%CE%B2%CE%B1%CF%83%CE%B9%CE%BB%CE%B9%CE%AC%CE%B4%CE%B5%CF%82-%CF%84%CE%BF%CF%85-%CE%B9%CF%83%CF%81%CE%B1%CE%AE%CE%BB/",
        "he": "https://www.jw.org/he/%D7%A1%D7%A4%D7%A8%D7%99%D7%99%D7%94/%D7%94%D7%AA%D7%A0%D7%9A-%D7%95%D7%9B%D7%AA%D7%91%D7%99-%D7%94%D7%A7%D7%95%D7%93%D7%A9-%D7%94%D7%99%D7%95%D7%95%D7%A0%D7%99%D7%99%D7%9D/nwt/%D7%A0%D7%A1%D7%A4%D7%97-%D7%90/%D7%9E%D7%9C%D7%9B%D7%99-%D7%99%D7%A9%D7%A8%D7%90%D7%9C/",
        "hi": "https://www.jw.org/hi/%E0%A4%B2%E0%A4%BE%E0%A4%87%E0%A4%AC%E0%A5%8D%E0%A4%B0%E0%A5%87%E0%A4%B0%E0%A5%80/%E0%A4%AC%E0%A4%BE%E0%A4%87%E0%A4%AC%E0%A4%B2/nwt/%E0%A4%85%E0%A4%A4%E0%A4%BF%E0%A4%B0%E0%A4%BF%E0%A4%95%E0%A5%8D%E2%80%8D%E0%A4%A4-%E0%A4%B2%E0%A5%87%E0%A4%96-%E0%A4%95/%E0%A4%87%E0%A4%B8%E0%A4%B0%E0%A4%BE%E0%A4%8F%E0%A4%B2-%E0%A4%95%E0%A5%87-%E0%A4%B0%E0%A4%BE%E0%A4%9C%E0%A4%BE/",
        "hu": "https://www.jw.org/hu/konyvtar/biblia/nwt/a-fuggelek/izrael-kiralyai/",
        "ig": "https://www.jw.org/ig/ihe-ndi-anyi-nwere/baibul/nwt/ihe-ndi-ozo-a-kowara-nke-a/ndi-eze-izrel/",
        "ilo": "https://www.jw.org/ilo/libraria/biblia/nwt/apendise-a/dagiti-ari-ti-israel/",
        "id": "https://www.jw.org/id/perpustakaan/alkitab/nwt/lampiran-a/raja-raja-israel/",
        "it": "https://www.jw.org/it/biblioteca-digitale/bibbia/nwt/appendice-a/re-d-israele/",
        "ja": "https://www.jw.org/ja/%E3%83%A9%E3%82%A4%E3%83%96%E3%83%A9%E3%83%AA%E3%83%BC/%E8%81%96%E6%9B%B8/nwt/%E4%BB%98%E9%8C%B2A/%E3%82%A4%E3%82%B9%E3%83%A9%E3%82%A8%E3%83%AB%E3%81%AE%E7%8E%8B/",
        "jv": "https://www.jw.org/jv/perpustakaan/alkitab/nwt/lampiran-a/nabi-raja-israel/",
        "kn": "https://www.jw.org/kn/%E0%B2%B2%E0%B3%88%E0%B2%AC%E0%B3%8D%E0%B2%B0%E0%B2%B0%E0%B2%BF/%E0%B2%AC%E0%B3%88%E0%B2%AC%E0%B2%B2%E0%B3%8D%E2%80%8C/nwt/%E0%B2%AA%E0%B2%B0%E0%B2%BF%E0%B2%B6%E0%B2%BF%E0%B2%B7%E0%B3%8D%E0%B2%9F-%E0%B2%8E/%E0%B2%87%E0%B2%B8%E0%B3%8D%E0%B2%B0%E0%B2%BE%E0%B2%AF%E0%B3%87%E0%B2%B2%E0%B2%BF%E0%B2%A8-%E0%B2%B0%E0%B2%BE%E0%B2%9C%E0%B2%B0%E0%B3%81/",
        "km": "https://www.jw.org/km/%E1%9E%94%E1%9E%8E%E1%9F%92%E1%9E%8E%E1%9E%B6%E1%9E%9B%E1%9F%90%E1%9E%99/%E1%9E%82%E1%9E%98%E1%9F%92%E1%9E%96%E1%9E%B8%E1%9E%9A/nwt/%E1%9E%9F%E1%9F%81%E1%9E%85%E1%9E%80%E1%9F%92%E1%9E%8A%E1%9E%B8-%E1%9E%96%E1%9E%93%E1%9F%92%E1%9E%99%E1%9E%9B%E1%9F%8B-%E1%9E%94%E1%9E%93%E1%9F%92%E1%9E%90%E1%9F%82%E1%9E%98-%E1%9E%95%E1%9F%92%E1%9E%93%E1%9F%82%E1%9E%80-%E1%9E%80/%E1%9E%9F%E1%9F%92%E1%9E%8A%E1%9F%81%E1%9E%85-%E1%9E%93%E1%9F%83-%E1%9E%A2%E1%9F%8A%E1%9E%B8%E1%9E%9F%E1%9F%92%E1%9E%9A%E1%9E%B6%E1%9E%A2%E1%9F%82%E1%9E%9B/",
        "kg": "https://www.jw.org/kg/biblioteke/biblia/nwt/bangindu-ya-ngika-a/bantotila-ya-izraele/",
        "ko": "https://www.jw.org/ko/%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC/%EC%84%B1%EA%B2%BD/nwt/%EB%B6%80%EB%A1%9D-%EA%B0%80/%EC%9D%B4%EC%8A%A4%EB%9D%BC%EC%97%98%EC%9D%98-%EC%99%95/",
        "lo": "https://www.jw.org/lo/%E0%BA%AA%E0%BA%B7%E0%BB%88%E0%BB%81%E0%BA%A5%E0%BA%B0%E0%BA%AA%E0%BA%B4%E0%BB%88%E0%BA%87%E0%BA%9E%E0%BA%B4%E0%BA%A1/%E0%BA%84%E0%BA%B3%E0%BA%9E%E0%BA%B5%E0%BB%84%E0%BA%9A%E0%BB%80%E0%BA%9A%E0%BA%B4%E0%BA%99/nwt/%E0%BA%9E%E0%BA%B2%E0%BA%81%E0%BA%9C%E0%BA%B0%E0%BB%9C%E0%BA%A7%E0%BA%81-%E0%BA%81/%E0%BA%81%E0%BA%B0%E0%BA%AA%E0%BA%B1%E0%BA%94%E0%BA%AD%E0%BA%B4%E0%BA%94%E0%BA%AA%E0%BA%B0%E0%BA%A3%E0%BA%B2%E0%BB%80%E0%BA%AD%E0%BA%99/",
        "ms": "https://www.jw.org/ms/perpustakaan/bible/nwt/lampiran-a/raja-israel/",
        "ml": "https://www.jw.org/ml/%E0%B4%B2%E0%B5%88%E0%B4%AC%E0%B5%8D%E0%B4%B0%E0%B4%B1%E0%B4%BF/%E0%B4%AC%E0%B5%88%E0%B4%AC%E0%B4%BF%E0%B5%BE/nwt/%E0%B4%85%E0%B4%A8%E0%B5%81%E0%B4%AC%E0%B4%A8%E0%B5%8D%E0%B4%A7%E0%B4%82-%E0%B4%8E/%E0%B4%87%E0%B4%B8%E0%B5%8D%E0%B4%B0%E0%B4%BE%E0%B4%AF%E0%B5%87%E0%B4%B2%E0%B4%BF%E0%B4%B2%E0%B5%86-%E0%B4%B0%E0%B4%BE%E0%B4%9C%E0%B4%BE%E0%B4%95%E0%B5%8D%E0%B4%95%E0%B4%A8%E0%B5%8D%E0%B4%AE%E0%B4%BE%E0%B5%BC/",
        "mr": "https://www.jw.org/mr/%E0%A4%B2%E0%A4%BE%E0%A4%AF%E0%A4%AC%E0%A5%8D%E0%A4%B0%E0%A4%B0%E0%A5%80/%E0%A4%AC%E0%A4%BE%E0%A4%AF%E0%A4%AC%E0%A4%B2/nwt/%E0%A4%85%E0%A4%A4%E0%A4%BF%E0%A4%B0%E0%A4%BF%E0%A4%95%E0%A5%8D%E2%80%8D%E0%A4%A4-%E0%A4%B2%E0%A5%87%E0%A4%96-%E0%A4%95/%E0%A4%87%E0%A4%B8%E0%A5%8D%E0%A4%B0%E0%A4%BE%E0%A4%8F%E0%A4%B2%E0%A4%9A%E0%A5%87-%E0%A4%B8%E0%A4%82%E0%A4%A6%E0%A5%87%E0%A4%B7%E0%A5%8D%E0%A4%9F%E0%A5%87/",
        "my": "https://www.jw.org/my/%E1%80%85%E1%80%AC%E1%80%80%E1%80%BC%E1%80%8A%E1%80%B7%E1%80%BA%E1%80%90%E1%80%AD%E1%80%AF%E1%80%80%E1%80%BA/%E1%80%9E%E1%80%99%E1%80%B9%E1%80%99%E1%80%AC%E1%80%80%E1%80%BB%E1%80%99%E1%80%BA%E1%80%B8%E1%80%85%E1%80%AC/nwt/%E1%80%94%E1%80%B1%E1%80%AC%E1%80%80%E1%80%BA%E1%80%86%E1%80%80%E1%80%BA%E1%80%90%E1%80%BD%E1%80%B2-%E1%80%80/%E1%80%9A%E1%80%AF-%E1%80%92-%E1%80%98%E1%80%AF%E1%80%9B%E1%80%84%E1%80%BA%E1%80%99%E1%80%BB%E1%80%AC%E1%80%B8-2/",
        "no": "https://www.jw.org/no/bibliotek/bibelen/nwt/tillegg-a/konger-i-israel/",
        "fa": "https://www.jw.org/fa/%DA%A9%D8%AA%D8%A7%D8%A8%D8%AE%D8%A7%D9%86%D9%87/%DA%A9%D8%AA%D8%A7%D8%A8-%D9%85%D9%82%D8%AF%D8%B3/nwt/%D8%B6%D9%85%DB%8C%D9%85%D9%87-%D8%A7%D9%84%D9%81/%D9%BE%D8%A7%D8%AF%D8%B4%D8%A7%D9%87%D8%A7%D9%86-%D8%A7%D8%B3%D8%B1%D8%A7%D8%A6%DB%8C%D9%84/",
        "pl": "https://www.jw.org/pl/biblioteka/biblia/nwt/dodatek-a/krolowie-izraela/",
        "pt": "https://www.jw.org/pt/biblioteca/biblia/nwt/apendice-a/reis-de-israel/",
        "pa": "https://www.jw.org/pa/%E0%A8%B2%E0%A8%BE%E0%A8%87%E0%A8%AC%E0%A9%8D%E0%A8%B0%E0%A9%87%E0%A8%B0%E0%A9%80/%E0%A8%AC%E0%A8%BE%E0%A8%88%E0%A8%AC%E0%A8%B2/nwt/%E0%A8%B5%E0%A8%A7%E0%A9%87%E0%A8%B0%E0%A9%87-%E0%A8%9C%E0%A8%BE%E0%A8%A3%E0%A8%95%E0%A8%BE%E0%A8%B0%E0%A9%80-1/%E0%A8%87%E0%A8%9C%E0%A8%BC%E0%A8%B0%E0%A8%BE%E0%A8%88%E0%A8%B2-%E0%A8%A6%E0%A9%87-%E0%A8%B0%E0%A8%BE%E0%A8%9C%E0%A9%87/",
        "ru": "https://www.jw.org/ru/%D0%B1%D0%B8%D0%B1%D0%BB%D0%B8%D0%BE%D1%82%D0%B5%D0%BA%D0%B0/%D0%B1%D0%B8%D0%B1%D0%BB%D0%B8%D1%8F/nwt/%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B0/%D1%86%D0%B0%D1%80%D0%B8-%D0%B8%D0%B7%D1%80%D0%B0%D0%B8%D0%BB%D1%8F/",
        "si": "https://www.jw.org/si/%E0%B6%BD%E0%B6%BA%E0%B7%92%E0%B6%B6%E0%B7%8A%E2%80%8D%E0%B6%BB%E0%B6%BB%E0%B7%92/%E0%B6%B6%E0%B6%BA%E0%B7%92%E0%B6%B6%E0%B6%BD%E0%B6%BA/nwt/%E0%B6%8B%E0%B6%B4%E0%B6%9C%E0%B7%8A%E2%80%8D%E0%B6%BB%E0%B6%B1%E0%B7%8A%E0%B6%AE%E0%B6%BA-A/%E0%B6%8A%E0%B7%81%E0%B7%8A%E2%80%8D%E0%B6%BB%E0%B7%8F%E0%B6%BA%E0%B7%99%E0%B6%BD%E0%B7%8A-%E0%B6%BB%E0%B6%A2%E0%B7%80%E0%B6%BB%E0%B7%94/",
        "es": "https://www.jw.org/es/biblioteca/biblia/nwt/apendice-a/reyes-de-israel/",
        "sw": "https://www.jw.org/sw/maktaba/biblia/nwt/nyongeza-a/wafalme-wa-israeli/",
        "sv": "https://www.jw.org/sv/bibliotek/bibeln/nwt/till%C3%A4gg-a/kungar-i-israel/",
        "ta": "https://www.jw.org/ta/%E0%AE%B2%E0%AF%88%E0%AE%AA%E0%AF%8D%E0%AE%B0%E0%AE%B0%E0%AE%BF/%E0%AE%AA%E0%AF%88%E0%AE%AA%E0%AE%BF%E0%AE%B3%E0%AF%8D/nwt/%E0%AE%87%E0%AE%A3%E0%AF%88%E0%AE%AA%E0%AF%8D%E0%AE%AA%E0%AF%81-a/%E0%AE%87%E0%AE%B8%E0%AF%8D%E0%AE%B0%E0%AE%B5%E0%AF%87%E0%AE%B2%E0%AE%BF%E0%AE%A9%E0%AF%8D-%E0%AE%B0%E0%AE%BE%E0%AE%9C%E0%AE%BE%E0%AE%95%E0%AF%8D%E0%AE%95%E0%AE%B3%E0%AF%8D/",
        "te": "https://www.jw.org/te/%E0%B0%B2%E0%B1%88%E0%B0%AC%E0%B1%8D%E0%B0%B0%E0%B0%B0%E0%B1%80/%E0%B0%AC%E0%B1%88%E0%B0%AC%E0%B0%BF%E0%B0%B2%E0%B1%81/nwt/%E0%B0%85%E0%B0%A8%E0%B1%81%E0%B0%AC%E0%B0%82%E0%B0%A7%E0%B0%82-a/%E0%B0%87%E0%B0%B6%E0%B1%8D%E0%B0%B0%E0%B0%BE%E0%B0%AF%E0%B1%87%E0%B0%B2%E0%B1%81-%E0%B0%B0%E0%B0%BE%E0%B0%9C%E0%B1%81%E0%B0%B2%E0%B1%81/",
        "th": "https://www.jw.org/th/%E0%B8%AB%E0%B8%99%E0%B8%B1%E0%B8%87%E0%B8%AA%E0%B8%B7%E0%B8%AD%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%AA%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%95%E0%B9%88%E0%B8%B2%E0%B8%87%E0%B9%86/%E0%B8%84%E0%B8%B1%E0%B8%A1%E0%B8%A0%E0%B8%B5%E0%B8%A3%E0%B9%8C%E0%B9%84%E0%B8%9A%E0%B9%80%E0%B8%9A%E0%B8%B4%E0%B8%A5/nwt/%E0%B8%A0%E0%B8%B2%E0%B8%84%E0%B8%9C%E0%B8%99%E0%B8%A7%E0%B8%81-%E0%B8%81/%E0%B8%81%E0%B8%A9%E0%B8%B1%E0%B8%95%E0%B8%A3%E0%B8%B4%E0%B8%A2%E0%B9%8C%E0%B8%AD%E0%B8%B4%E0%B8%AA%E0%B8%A3%E0%B8%B2%E0%B9%80%E0%B8%AD%E0%B8%A5/",
        "tr": "https://www.jw.org/tr/kutuphane/kutsal-kitap/nwt/ek-a/eski-israil-krallari/",
        "uk": "https://www.jw.org/uk/%D0%B1%D1%96%D0%B1%D0%BB%D1%96%D0%BE%D1%82%D0%B5%D0%BA%D0%B0/%D0%B1%D1%96%D0%B1%D0%BB%D1%96%D1%8F/nwt/%D0%B4%D0%BE%D0%B4%D0%B0%D1%82%D0%BE%D0%BA-%D0%B0/%D1%86%D0%B0%D1%80%D1%96-%D1%96%D0%B7%D1%80%D0%B0%D1%97%D0%BB%D1%8F/",
        "vi": "https://www.jw.org/vi/thu-vien/kinh-thanh/nwt/phu-luc-a/cac-vua-ysoraen/"
    }
};

export function getA6Links(tag: string | undefined, targetLang: string): WebReferenceLinks {
    const lang = targetLang || "en";
    const isIsrael = tag === "A6-B";
    const sectionTag = isIsrael ? "A6-B" : "A6-A";
    const subpath = isIsrael ? "kings-of-israel" : "kings-of-judah";
    const title = isIsrael ? "Kings of Israel (Appendix A6)" : "Kings of Judah (Appendix A6)";

    const directUrl = A6_DIRECT_URLS[sectionTag]?.[lang];
    const targetUrl = directUrl || `https://www.jw.org/${lang}/library/bible/nwt/appendix-a/${subpath}/`;

    return {
        englishUrl: `https://www.jw.org/en/library/bible/nwt/appendix-a/${subpath}/`,
        targetUrl,
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
