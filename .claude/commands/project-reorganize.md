You are reorganizing a single client project folder on disk to match the canonical structure.

The folder to reorganize is given as `$ARGUMENTS`. If no argument is provided, ask the user for the folder path before proceeding.

---

## Canonical project folder structure

```
<ClientName>/
├── Projects/      — code repos (git repos, zips of source code, scripts)
├── Invoices/      — PDF invoices (always plural; financial source of truth)
├── Contracts/     — proposals, agreements, SOWs, NDAs (signed docs)
├── Requirements/  — PRDs, briefs, scope documents, estimates
├── Design/        — Figma, Sketch, XD, PSD design files
├── Assets/        — processed graphics, favicons, exported files
├── Originals/     — raw files from the client (logos, photos, brand assets) — never edited
├── Screenshots/   — UI screenshots of the live product or mobile app screens
├── Recordings/    — demo videos, screen recordings, call recordings (audio/video)
├── Documents/     — general documents (timesheets, misc PDFs, notes)
│   └── Emails/   — .eml email archives
├── Backups/       — DB dumps, exported content, deployment snapshots
└── Credentials/   — SKIP ENTIRELY — API keys, passwords, logins — never read or list contents
```

---

## File classification table

| File / folder | Destination |
|---|---|
| `.git` repos, `.zip` source archives, loose scripts (`.py`, `.js`, `.sh`) | `Projects/` |
| PDF invoices | `Invoices/` |
| Proposals, agreements, NDAs, SOWs, signed contracts | `Contracts/` |
| PRDs, briefs, specs, scope documents, estimates | `Requirements/` |
| `.fig`, `.sketch`, `.xd`, `.psd`, `.ai` design files | `Design/` |
| Processed logos, favicons, exported PNGs/WebPs, banner graphics | `Assets/` |
| Raw client-provided logos, photos, brand assets, fonts | `Originals/` |
| Reference files provided by the client (sample apps, competitor apps, inspiration code, example designs) | `Originals/` |
| UI screenshots (app screens, website screenshots) | `Screenshots/` |
| Demo `.mp4`/`.mov`, screen recordings, call recordings (`.m4a`, `.mp3`) | `Recordings/` |
| `.eml` email files | `Documents/Emails/` |
| Timesheets, misc PDFs not fitting above, `.txt` notes | `Documents/` |
| DB dumps, `.sql`, deployment snapshots, content exports | `Backups/` |
| `Credentials/` folder | Leave entirely as-is — never read, list, or touch contents |
| API keys, tokens, `.env`, credential files found **loose at the client root** | Move to `Credentials/` without reading |
| Auth/credential files **inside a `Projects/` subfolder** (e.g. `auth.json`, `.env` inside a code repo) | Leave in place — the project depends on them; do not move |
| `Invoice/` (singular) | Rename → `Invoices/` |
| `Paperwork/` | Rename → `Contracts/` |
| `Docs/` | Rename → `Documents/` |
| `PRDs/`, `Briefs/` | Rename → `Requirements/` |
| `Recording/` (singular) | Rename → `Recordings/` |
| `New Repos/`, `Desktop Files/` | Contents → `Projects/` |
| `Timesheets/`, `Consultation/`, `Others/`, `Other/`, `Generated/`, `Estimates/` | Contents → `Documents/` |
| `Insurance/` | Contents → `Contracts/` |

---

## Steps

### Step 1 — Scan the folder

Run:
```bash
find "$ARGUMENTS" -maxdepth 3 -not -path "*/Credentials/*" -not -name ".*" -not -name "._*" | sort
```

Do NOT descend into `Credentials/` or list its contents under any circumstances.

### Step 2 — Classify every item

Assign each file and subfolder to a canonical destination using the table above. For any file that is ambiguous, flag it rather than guessing. Specifically:

- Distinguish invoice PDFs from contract PDFs from requirement PDFs by filename and context
- Distinguish processed/exported graphics (Assets/) from raw client-provided originals (Originals/)
- If a folder name matches a rename rule, plan to rename it rather than create a new folder and move contents (when possible)
- If a file appears to belong to a completely different client or project, flag it

### Step 3 — Propose the plan

List every operation as a numbered sequence. Do not execute yet. Use this format:

```
PROPOSED CHANGES for <ClientName>:
1. mkdir Screenshots/
2. mv "screen-login.png" → "Screenshots/"
3. mv "Invoice/" → rename to "Invoices/"
4. mv "api-keys.txt" → "Credentials/" (without reading contents)
...

FLAGGED (needs your decision):
- "random-file.zip" — unclear if source code or backup; assumed Projects/ — confirm?
- "logo-final-v3.png" — unclear if processed asset or raw original
```

Then ask: **"Shall I apply these changes?"**

### Step 4 — Execute on approval

Only after the user confirms, run the commands one by one. Report each step as it completes. Never delete any file — only move or rename.

If a destination folder does not exist, create it with `mkdir -p` before moving files into it.

For credential files found **loose at the client root**: move them to `Credentials/` using `mv` only — never open, read, or display their contents. Do NOT move auth/credential files that live inside a `Projects/` subfolder — those belong to the repo and must stay in place.

### Step 5 — Final summary

Print the resulting folder tree:
```bash
find "$ARGUMENTS" -maxdepth 2 -not -path "*/Credentials/*" -not -name ".*" | sort
```

Present it to the user so the result can be verified visually.
