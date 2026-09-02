# Update process for the dictionary

The vite web app at [kreier.github.io/dictionary](https://kreier.github.io/dictionary) offers an interface to update the translations and dictionaries for the [timeline](https://github.com/kreier/timeline) project. The update process involves several steps. In general these are 3 steps:

1. **PROPOSE** - Activate edit mode in kreier/dictionary. Submit edit as issue to kreier/timeline
2. **ACCEPT** - The change is accepted with a `/approve` comment in the kreier/timeline repository
3. **UPDATE** - Automatic runners at kreier/timeline, kreier/dictionary, timeline24/timeline24.github.io and timeline25/timeline25.github.io update their databases and websites

Each step, worker YAML file and python script involved in this process is described below:

## 1. PROPOSE

This step involves the kreier/dictionary and kreier/timeline repositories and a cloudflare turnstile worker.

### Enter editing mode

The **EDIT** mode has to be activated at the [kreier.github.io/dictionary](https://kreier.github.io/dictionary) website. The vite app (see [main.ts](https://github.com/kreier/dictionary/blob/main/src/main.ts)) does this by creating a session cookie and other steps that are described as followed.

### Store and document changes

The changes that are tracked are:

- Text edits in the "text" and "notes" column for each key
- Change from unchecked to checked for a key value

The changes are indicated in the dropdown menu with a pencil in front of each item that has been changed

### Preview changes

The button "preview changes" lists all cells that have been changed.

### Submit changes

Before submitting a separate window appears that shows all cells that have been changed and a small indicator of the Cloudflare turnstile. When activated, the changes are packed into a JSON file and over the turnstile interface submitted as an issue to the kreier/timeline repository.

This triggers my new Dictionary Update GitHub App.

Dictionary → Cloudflare Worker → GitHub App → Timeline

- Cloudflare: https://update-dictionary.matthias-kreier.workers.dev/
- GitHub App: https://github.com/apps/dictionary-update

This will create a new issue in the kreier/timeline repository

## 2. ACCEPT

As contributor to the kreier/timeline repository I can just add the comment `/approve` to the issue, and the bot automatically takes over:

- Bot Action: [approve-translation.yml](https://github.com/kreier/timeline/blob/main/.github/workflows/approve-translation.yml) on `issue_comment` and in jobs: if `startsWith('/approve') it will be executed
- Build and Deploy: [build-and-deploy.yml](https://github.com/kreier/timeline/blob/main/.github/workflows/build-and-deploy.yml) if workflow _"Approve Translation Submission"_ completed then this one is started
- **Build** includes the [status/generate-status.py](https://github.com/kreier/timeline/blob/main/status/generate-status.py) script to update [status](https://kreier.github.io/timeline/status/) page

## 3. UPDATE

This involves several `build & deploy` actions:

- Update entries in kreier/timeline and rebuild the site, especially for kreier.github.io/timeline/status
- Update JSON files for kreier/dictionary
- Update respective PDFs at timeline24.github.io
- Update respective PDFs at timeline25.github.io
