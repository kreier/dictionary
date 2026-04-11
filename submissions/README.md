# Submitted JSON files

As recommended by ChatGPT the submissions will not be `.csv` files but JSON files instead. It might be easier to integrate, parse and compare. And no conflicts.

## Conversation with ChatGPT on 2026/03/01 - GitHub Crowdsourced Translation Editor

> Dictionary helper: I want to use a GitHub project that displays on a website the content of a dictionary\_fr.csv in a structured way (sorted to categories, part of the CSV file) and shows the English original, the current translation (here french, later more languages) and other proposed translations from Google translate, bing, Baidu, chatgpt, Claude and Gemini. I can select a different translation, enter my own and then submit the changes with a button, creating a pull request for this repository. The user should be able to do this with it's phone, no login or GitHub account needed.

#### ChatGPT said:

Great idea — what you want is essentially a **crowdsourced translation editor UI backed by GitHub PR automation**. The key constraint is:

> ✅ Users can edit from phone  
> ✅ No login / no GitHub account  
> ✅ Changes become pull requests

That means you **cannot let users push directly to GitHub**. Instead you need a **middle service (bot backend)** that submits PRs on their behalf.

Below is a clean architecture that works reliably and is simple to maintain.


# 🧠 Recommended Architecture

```
Phone Browser  
     ↓  
Static Web App (GitHub Pages)  
     ↓ API POST  
Backend PR Service (Cloudflare Worker / Firebase / small VPS)  
     ↓ GitHub API  
Repository Pull Request
```


# 🧩 Components Explained

## 1) Frontend — Static Website (Host on GitHub Pages)

Tech:

-   Vanilla JS or Vue/React (optional)
-   Reads CSV
-   Displays structured UI
-   Sends edits to backend

Responsibilities:

-   Load dictionary_fr.csv
-   Sort by category column
-   Display translations
-   Let user choose / edit
-   POST submission JSON

Example POST payload:

```JSON
{  
  "row_id": 142,  
  "original": "apple",  
  "current": "pomme",  
  "suggested": "la pomme",  
  "source": "user",  
  "comment": "more natural"  
}
```

## 2) Backend — PR Bot Service (Required)

This is the key piece.

Options:

| Option | Difficulty | Cost | Recommended |
| --- | --- | --- | --- |
| Cloudflare Worker | ⭐ easiest | free tier | ✅ best |
| Firebase Functions | medium | free tier | good |
| Small Node server | medium | VPS cost | ok  |
| GitHub Actions only | ❌ not enough | free | cannot accept external requests |

You need something that:

-   accepts POST
-   modifies CSV
-   creates branch
-   commits change
-   opens PR

## 3) GitHub Bot Authentication

Create a **GitHub PAT or App token** stored only in backend.

Permissions needed:

```
repo  
contents:write  
pull_requests:write
```

Never expose token to frontend.

## 4) PR Creation Logic (Backend)

Pseudo-flow:

```
receive edit  
↓  
fetch latest csv from repo  
↓  
apply change  
↓  
create new branch  
↓  
commit edited CSV  
↓  
open pull request  
↓  
return success message
```

## 5) CSV Structure Recommendation

Add a unique ID column if you don't already:

```
id,category,en,fr,google,bing,baidu,chatgpt,claude,gemini  
142,fruit,apple,pomme,pomme,pomme,苹果,pomme,pomme,pomme
```

This avoids merge conflicts and lets backend edit precisely.


# 📱 UI Layout (Mobile Optimized)

Recommended row card layout:

```
[Category: Food]  
  
apple  
Current: pomme  
  
Suggestions:  
○ pomme  
○ la pomme  
○ pomme (fruit)  
  
Custom:  
[___________]  
  
[ Submit Change ]
```

# 🔐 Anti-Spam Protection (Important)

Since no login:

Add one or more:

-   rate limit by IP
-   Cloudflare Turnstile captcha (best)
-   submission cooldown
-   profanity filter
-   PR label "community submission"


# 🧰 Suggested Stack (Best Balance)

Frontend:

-   simple HTML + JS
-   PapaParse (CSV parsing)

Backend:

-   Cloudflare Worker
-   Octokit REST API

Why this combo?

-   free
-   globally fast
-   serverless
-   no maintenance
-   secure token storage

# 🧪 Minimal Backend Example (Pseudo JS)

JavaScript

```js
export default {  
 async fetch(req) {  
   const body = await req.json()  
  
   const csv = await getFileFromGithub()  
  
   const updated = applyChange(csv, body)  
  
   const branch = "edit-" + Date.now()  
  
   await createBranch(branch)  
   await commitFile(branch, updated)  
   await openPR(branch)  
  
   return new Response("PR created!")  
 }  
}
```

# 🚀 Even Easier Alternative (Zero Backend)

If you want **simplest possible setup**:

Instead of auto PR:

👉 generate patch file  
👉 download it  
👉 user taps "Submit" → opens GitHub PR page with prefilled text

Pros:

-   zero backend
-   zero hosting
-   totally free

Cons:

-   one extra tap
-   GitHub account required

Since you said **no GitHub account**, backend bot is required.


# ⭐ Pro Tip — Store Edits as JSON Instead of Editing CSV

Instead of modifying CSV directly:

Store submissions as:

```
/submissions/2026-03-01-142.json
```

Maintainer later merges accepted ones.

Benefits:

-   zero merge conflicts
-   audit trail
-   easy moderation
-   no race conditions

# 🏁 Recommended Final Setup (Production-Ready)

**Frontend**

-   static GitHub Pages app

**Backend**

-   Cloudflare Worker PR bot

**Repo structure**

```
/data/dictionary_fr.csv  
/submissions/*.json
```

**Workflow**

-   user submits
-   PR adds JSON file
-   maintainer reviews
-   merge
-   nightly action updates CSV automatically


> Explain the steps working with Cloudflare to create a pull request and what needs to be prepared.


Here’s a **practical, start-to-finish guide** to using **Cloudflare Workers** as a bot that creates GitHub pull requests when someone edits your dictionary from a website.

I’ll break it into:

1.  What you must prepare
2.  Cloudflare setup
3.  GitHub setup
4.  Worker code logic
5.  Deployment
6.  Testing
7.  Production hardening


# 1️⃣ What You Must Prepare First

Before touching Cloudflare, make sure you have:

**Repository**

-   public or private repo
-   CSV file (example: `/data/dictionary_fr.csv`)
-   unique ID column in CSV

Example:

```
id,category,en,fr  
1,fruit,apple,pomme
```

**Cloudflare Account**

-   free plan works

**GitHub Token**  
Create a fine-grained token with permissions:

```
Repository access → your repo only  
Permissions:  
- Contents: Read + Write  
- Pull Requests: Read + Write
```

Store token somewhere safe — you’ll add it to Cloudflare later.


# 2️⃣ Cloudflare Worker Setup

Go to:
```
Cloudflare Dashboard → Workers & Pages → Create → Worker
```
Choose:

> Hello World Worker

Rename it:
```
dictionary-pr-bot
```


# 3️⃣ Add Secret Token (Important)

Never hardcode GitHub token.

Inside Worker settings:
```
Settings → Variables → Add Secret
```

Name:
```
GITHUB_TOKEN
```
Paste token value.

Add another variable:
```
REPO = username/repo-name
```


# 4️⃣ How the Worker Will Work

Your Worker acts like a webhook API:
```
POST /submit
```

It receives:
```json
{  
  row_id,  
  new_translation,  
  comment  
}
```

Then it:

1.  downloads CSV from GitHub
2.  edits row
3.  creates branch
4.  commits file
5.  opens PR

# 5️⃣ Worker Code (Minimal Working Version)

Paste this into Worker editor:

JavaScript
```js
export default {  
  async fetch(req) {  
    if (req.method !== "POST")  
      return new Response("POST only", { status: 405 })  
  
    const body = await req.json()  
    const token = GITHUB_TOKEN  
    const repo = REPO  
  
    const branch = "edit-" + Date.now()  
  
    // 1 get main branch sha  
    const ref = await fetch(  
      `https://api.github.com/repos/${repo}/git/ref/heads/main`,  
      { headers: { Authorization: `Bearer ${token}` } }  
    ).then(r => r.json())  
  
    const baseSha = ref.object.sha  
  
    // 2 create branch  
    await fetch(  
      `https://api.github.com/repos/${repo}/git/refs`,  
      {  
        method: "POST",  
        headers: {  
          Authorization: `Bearer ${token}`,  
          "Content-Type": "application/json"  
        },  
        body: JSON.stringify({  
          ref: `refs/heads/${branch}`,  
          sha: baseSha  
        })  
      }  
    )  
  
    // 3 get file  
    const file = await fetch(  
      `https://api.github.com/repos/${repo}/contents/data/dictionary\_fr.csv`,  
      { headers: { Authorization: `Bearer ${token}` } }  
    ).then(r => r.json())  
  
    const csv = atob(file.content)  
  
    // 4 edit row  
    const updated = csv.replace(  
      new RegExp(`^${body.row_id},([^\\n]*)`, "m"), 
      `${body.row_id},${body.new_translation}`  
    )  
  
    // 5 commit file  
    await fetch(
      `https://api.github.com/repos/${repo}/contents/data/dictionary_fr.csv`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Edit translation row ${body.row_id}`,
          content: btoa(updated),
          sha: file.sha,
          branch
        })  
      }  
    )  
  
    // 6 create PR  
    await fetch(
      `https://api.github.com/repos/${repo}/pulls`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: `Translation update #${body.row_id}`,
          head: branch,
          base: "main",
          body: body.comment || "Community suggestion"
        })  
      }  
    )  
  
    return new Response("PR created!")  
  }  
}
```

Click **Deploy**.


# 6️⃣ Call It From Your Website

Example frontend submit:

JavaScript
```js
await fetch("https://dictionary-pr-bot.workers.dev", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    row_id: 142,
    new_translation: "la pomme",
    comment: "more natural"
  })  
})
```
Works from:

-   phone browser
-   desktop
-   no login required


# 7️⃣ Testing Without Frontend

Use curl:

```
curl -X POST https://your-worker-url \
-H "Content-Type: application/json" \
-d '{"row_id":1,"new_translation":"banane"}'
```

You should see:

```
PR created!
```

# 8️⃣ Security Improvements (Strongly Recommended)

Add protections:

### Rate limit

Block spam edits.

Cloudflare setting:
```
Security → WAF → Rate limiting rule
```

### CAPTCHA

Add Cloudflare Turnstile token validation.

### Validate Input

Inside worker:
```
if (!Number.isInteger(body.row_id))  
  return new Response("Invalid id", {status:400})
```

### Prevent mass edits

Limit change length:
```
if (body.new_translation.length > 60) reject
```

# 9️⃣ Recommended Production Architecture (Best Practice)

Instead of editing CSV directly:

Worker should:
```
create PR adding JSON file
```
Example:
```
/submissions/edit-123.json
```
Maintainer later merges approved changes.

This avoids:

-   merge conflicts
-   malicious overwrites
-   corruption


# 🏁 Summary Workflow

**User phone**  
→ edits word  
→ taps submit

**Worker**  
→ creates branch  
→ commits change  
→ opens PR

**Maintainer**  
→ reviews PR  
→ merges

✅ This setup is used widely for:

-   community translations
-   crowdsourced corrections
-   typo fixes
-   public datasets
