# git-recap

> Turn technical git commits into clean, customer-facing product updates, changelogs, and viral social release notes. Zero dependencies.

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](https://opensource.org/licenses/MIT)
[![Node.js: >=18.0.0](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-black.svg)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-black.svg)](src/index.js)
[![Powered by PostReady](https://img.shields.io/badge/Powered%20by-PostReady.org-black.svg)](https://postready.org)

`git-recap` bridges the gap between raw developer commits (`feat(auth): refresh jwt cookie expiry`) and what your customers actually care about (`Seamless session renewals without unexpected logouts`).

It parses your git history, filters automated noise, translates technical commit messages into clean human benefits, and formats them for your **website updates page**, **social media**, or **CHANGELOG.md**.

Part of the **[PostReady.org](https://postready.org)** open-source content repurposing toolkit.

---

## Highlights

- 🧹 **Automated Noise Removal:** Filters out merge commits, branch syncs, dependency bumps, and chore tasks.
- 🗣️ **Humanized Copy:** Strips conventional commit tags and cleans up grammar so outputs read like polished product release notes.
- 📄 **PostReady Updates Format:** Generates drop-in HTML `<details>` components or Markdown matching the [PostReady.org Updates Page](https://postready.org/en/updates).
- 📱 **Social Ready:** One-click generation of "What we shipped today" bulleted updates for X and LinkedIn.
- ⚡ **Zero Runtime Dependencies:** Native Node.js ESM utilizing native git binaries.

---

## Quick Start (CLI)

Run directly with `npx` in any git repository:

```bash
# Generate customer update for commits since yesterday
npx git-recap --since "yesterday"

# Generate weekly update formatted for social media (X & LinkedIn)
npx git-recap --format social --since "7 days ago"

# Output copy-paste ready HTML snippet for your website updates page
npx git-recap --format html > update.html

# Generate standard Keep-A-Changelog between releases
npx git-recap --range v1.0.0..HEAD --format changelog
```

Install globally:

```bash
npm install -g git-recap
```

---

## Output Formats

### 1. `updates` (Default — PostReady Style)

```text
October 23, 2026: Fast Monochrome Social Cards & Batch Cleanup
A summary of 4 new capabilities, performance upgrades, and workflow fixes.

  • Add compact, banner, and square dimension presets with dynamic typography.
  • Resolve package disk size calculation on systems with isolated dist-info files.
  • Enforce strict PEP 508 argument sanitization to prevent subshell injection.
```

### 2. `social` (X & LinkedIn)

```text
What we shipped recently (Oct 23):

• Add compact, banner, and square dimension presets with dynamic typography
• Resolve package disk size calculation on systems with isolated dist-info files
• Enforce strict PEP 508 argument sanitization to prevent subshell injection

Try it live on https://postready.org
#buildinpublic #devtools
```

### 3. `html` (Drop-in Website Accordion)

Produces the exact `<details>` markup used by modern Next.js / Tailwind changelog pages.

---

## CLI Options

```text
USAGE:
  $ git-recap [options]

OPTIONS:
  -f, --format <type>     Output format: updates (default), social, changelog, html, json
  -s, --since <time>      Filter commits since (e.g. "yesterday", "7 days ago", "2026-10-01")
  -u, --until <time>      Filter commits until
  -r, --range <range>     Explicit git commit range (e.g. "v1.0.0..HEAD")
  -n, --count <num>       Max commits to inspect (default: 50)
  -t, --title <text>      Custom release title for the update
  -m, --summary <text>    Custom release summary description
  -h, --help              Show help message
  -v, --version           Show version
```

---

## Programmatic API

Install locally:

```bash
npm install git-recap
```

### Node.js / TypeScript:

```javascript
import { fetchCommits, formatPostReadyUpdates } from 'git-recap';

const commits = fetchCommits({ since: '7 days ago' });
const update = formatPostReadyUpdates(commits, {
  title: 'Autumn Polish & Speed Upgrades'
});

console.log(update.html);
console.log(update.items);
```

---

## About PostReady

This tool was created by **[PostReady.org](https://postready.org)** — the AI content repurposing studio that turns blog articles, podcasts, and notes into publish-ready X threads, LinkedIn posts, and newsletter drafts.

Explore other tools in the suite:
- [social-preview-cli](https://github.com/postready/social-preview-cli) — Fast Rust-backed social card generator.
- [md-to-thread](https://github.com/postready/md-to-thread) — Split markdown files into X threads and carousels.
- [awesome-tech-hooks](https://github.com/postready/awesome-tech-hooks) — 500+ curated viral hooks and opening lines.

---

## License

MIT © [eco-null](https://github.com/eco-null)
