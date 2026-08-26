# Structure of the dictionary csv files

The current release 2026/05/04 contains the following 14 columns:

- key
- text
- english
- notes
- link
- tag
- checked
- checked_by
- date
- google
- chatgpt
- gemini
- claude
- bing

## History

### May 2026

The column "link" was added since the wiki articles had their link in the notes and should have a language-specific link in there, which leaves no room for notes for these articles. And some others might use a link, too - maybe just for reference? Plus one to 14.

- link

### April 2026 

With some AI coding help the columns `checked_by` and `date` for when the last check was done were added. Plus 2 to 13.

- checked_by
- date

### February 2026

With more automation and a planned web interface I wanted to display translation suggestions from some online providers. Five columns for common providers were added:

- google
- chatgpt
- gemini
- claude
- bing

The Google Sheets version had 2 of these columns already integrated. Google provides a free API, this has been used since 2024. For Microsoft you need to create an account to be able to use the API, done in 2025. For LLMs you need to wrap you request, I'm working on it. Columns increased from 6 to 11.

### January 2026

The two columns `tag` and `checked` were added. It should structure and streamline the translation, and addition of new words. See [release notes for version v6.01](https://github.com/kreier/timeline/releases/tag/v6.01). Now 6 columns.

- tag
- checked

### November 2023 - just 4 columns

With version [v3.4](https://github.com/kreier/timeline/releases/tag/v3.4) from 2023/11/06 the first dictionary files entered the timeline project. Back then it were still `TSV` files because I was not sure how commas are handled inside a `CSV` file, and many of my texts contain commas. Turns out, with paranthesis and UTF-8 you can store almost anythin in a csv.

- key
- text
- english
- notes
