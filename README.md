# Dictionary helper

![GitHub License](https://img.shields.io/github/license/kreier/dictionary)
![GitHub Release](https://img.shields.io/github/v/release/kreier/dictionary)

Crowdsourced translation editor UI backed by GitHub PR automation. There are two main goals for this repository

## Web UI helper to translate the [timeline](https://github.com/kreier/timeline)

The production web interface is live at:
**[https://kreier.github.io/dictionary/](https://kreier.github.io/dictionary/)**

For translations, it is best if a native speaker can verify the translation directly. The web interface provides a responsive, mobile-ready tool where contributors can browse categories, search dictionary entries, verify accuracy, edit entries in place with required name attribution, and submit changes directly through Cloudflare Turnstile bot verification. Submissions create an issue in [kreier/timeline](https://github.com/kreier/timeline) that maintainers can approve with a simple `/approve` comment.

## Helper scripts and data generation

The authoritative dictionary data is maintained in `kreier/timeline/db/`. When changes are merged in Timeline, automated GitHub Actions run `scripts/generate-data.py` to regenerate read-optimized static JSON in `public/data/` and deploy the updated application to GitHub Pages.
