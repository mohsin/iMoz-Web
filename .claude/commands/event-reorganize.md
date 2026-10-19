You are reorganizing a single event archive folder on the SSD to match the canonical structure.

The folder to reorganize is given as `$ARGUMENTS`. If no argument is provided, ask the user for the folder path before proceeding.

---

## Canonical event folder structure

```
Events/
└── <Category>/                      — Conferences | Workshops | Summits | Meetups | Talks | Awards
    └── <Event Name YYYY>/           — Title Case, includes 4-digit year
        ├── CFP/                     — proposal/application submitted before the event
        │   ├── proposal.pdf
        │   ├── abstract.md
        │   └── bio.md
        ├── Photos/
        │   ├── Personal/            — taken from your own phone
        │   ├── Photographer/        — from a hired photographer
        │   ├── Official/            — provided by the event organizer
        │   ├── Twitter/             — pulled from Twitter/social media posts
        │   └── Curated/             — copies of the best shots picked for the portfolio (originals stay in their source folder)
        ├── Slides/                  — .key, .pptx, .pdf presentation files
        ├── Materials/               — demo code, exercise projects, handout repos, zip files
        ├── Assets/                  — slide-making assets: diagrams, logos, PSDs, reference images, fonts
        ├── Documents/               — certificates, brochures, invite PDFs, confirmation letters, tickets
        │   └── Emails/             — .eml email threads (primary metadata source)
        ├── Recordings/              — audio/video recordings of the session
        └── notes.md                 — optional personal notes
```

Key differences from project folders: no `Credentials/`, no `Originals/`, no `Backups/`. Events do not have API keys, raw client assets, or DB dumps. `Photos/` organises by source, not by curation tier.

---

## File classification table

| File / folder | Destination |
|---|---|
| `.key`, `.pptx`, `.ppt`, `.pdf` presentation files | `Slides/` |
| CFP/proposal PDFs, Sessionize exports, speaker application forms | `CFP/` |
| Certificates, brochures, invite PDFs, confirmation letters, tickets | `Documents/` |
| `.eml` email files | `Documents/Emails/` |
| Event photos taken from your phone | `Photos/Personal/` |
| Photos from a hired photographer | `Photos/Photographer/` |
| Photos provided by the event organizer | `Photos/Official/` |
| Photos pulled from Twitter/social media | `Photos/Twitter/` |
| Photos with unknown source | `Photos/Personal/` (default — flag for confirmation) |
| Existing flat source subfolders already inside Photos (Twitter/, Personal/, etc.) | Keep in place — already canonical |
| Slide-making assets: diagrams, reference images, PSD files, logos, speaker cards | `Assets/` |
| Fonts used in slides | `Assets/` (not a separate `Fonts/` folder) |
| Demo projects, exercise code, repos, `.zip` handouts | `Materials/` |
| `.mp4`, `.mov`, `.mp3`, `.m4a`, screen recordings of the session | `Recordings/` |
| `Presentations/` subfolder | Rename → `Slides/` |
| `Proposal/` subfolder | Rename → `CFP/` |
| `Originals/` subfolder (raw event-provided images/brochures) | Distribute contents: photos → `Photos/Official/`, PDFs → `Documents/`, design assets → `Assets/` |
| `Pictures/` subfolder | Rename → `Assets/` (if slide assets) or `Photos/Personal/` (if event photos — decide by content) |
| Loose `.jpg`/`.png`/`.heic` at root that look like event photos | `Photos/Personal/` (flag source if unclear) |
| Loose `.eml` at root | `Documents/Emails/` |
| Loose PDFs at root | `Documents/` (unless clearly a presentation — then `Slides/`) |
| Loose exercise/demo code folders or repos at root | `Materials/` |
| Loose `.psd`, `.ai`, reference images, logos at root | `Assets/` |
| Screen recordings or session videos at root | `Recordings/` |

---

## The photos vs. assets distinction

This is the most important classification judgment. Ask: is this image *of* the event, or *used to make* slides?

- **Photos** (→ `Photos/<source>/`): photos of people, the venue, the stage, the audience, candid shots — anything showing the event as it happened. Assign to the appropriate source subfolder.
- **Assets** (→ `Assets/`): diagrams, speaker cards, brand logos, reference screenshots, PSD/AI files, anything that was used as input when building the slide deck.

When the source of a photo is ambiguous, default to `Photos/Personal/` and flag it.

---

## Steps

### Step 1 — Scan the folder

Run:
```bash
find "$ARGUMENTS" -not -name ".*" -not -name "._*" | sort
```

Also read any text files at the root (README, notes.md) for event context — they may help classify ambiguous files.

### Step 2 — Classify every item

Assign each file and subfolder to a canonical destination using the table above. For every ambiguous file, flag it rather than guessing. Make the photos-vs-assets call based on content clues in the filename and folder context. For photos, determine the source (Personal/Photographer/Official/Twitter) from folder names, filenames, and context clues.

### Step 3 — Propose the plan

List every operation as a numbered sequence. Do not execute yet. Use this format:

```
PROPOSED CHANGES for <Event Name>:
1. mkdir Photos/
2. mkdir Photos/Personal/
3. mkdir Photos/Curated/
4. mv "IMG_2817.jpg" → "Photos/Personal/"
5. mv "Presentations/" → rename to "Slides/"
6. mv "android.psd" → "Assets/"
7. mv "Re_ Workshop.eml" → "Documents/Emails/"
...

FLAGGED (needs your decision):
- "graphic.png" — unclear if event photo or slide asset; filename suggests asset
- "IMG_9012.jpg" — photo source unclear; defaulted to Personal/ — confirm?
```

Then ask: **"Shall I apply these changes?"**

### Step 4 — Execute on approval

Only after the user confirms, run the commands one by one. Report each step as it completes. Never delete any file — only move or rename.

If a destination folder does not exist, create it with `mkdir -p` before moving files into it.

If `Photos/` already contains source subfolders (e.g., `Twitter/`, `Personal/`), leave them in place — they are already canonical.

`Curated/` contains **copies**, not moves. When populating it, use `cp` not `mv` so the original remains in its source subfolder.

### Step 5 — Final summary

Print the resulting folder tree:
```bash
find "$ARGUMENTS" -maxdepth 3 -not -name ".*" | sort
```

Present it to the user so the result can be verified visually.
