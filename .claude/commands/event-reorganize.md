You are reorganizing a single event archive folder on the SSD to match the canonical structure.

## Canonical structure reference
!`cat .claude/reference/event-canonical-structure.md`

## Step 1 — Scan the folder

The folder to reorganize is: $ARGUMENTS

```bash
find "$ARGUMENTS" -not -name ".*" -not -name "._*" | sort
```

## Step 2 — Classify every item

Assign each file and subdirectory to a canonical destination:

- `Pictures/` subdirectory → slide-making assets, rename to `Assets/`
- `Proposal/` subdirectory → rename to `CFP/`
- Event photos (people, venue, stage) → `Photos/all/`
- Source subfolders inside Photos (Twitter/, Dad/, Thamu/) → move under `Photos/all/<source>/`
- `.key`, `.pptx`, `.ppt` files → `Slides/`
- PDFs with "CFP", "Call for", "Sessionize", or "Proposal" in name → `CFP/`
- PDFs (certificate, brochure, invite, contract) → `Documents/`
- `.eml` email files → `Documents/Emails/` (preserved as metadata source for event-import)
- `.txt` notes → `Documents/`
- Slide-making assets, diagrams, `.psd`, logos, speaker cards → `Assets/`
- Demo projects, code repos, `.zip` files → `Materials/`
- PDFs belonging to a **different year's event** → flag, don't move automatically

## Step 3 — Propose the plan

List every operation as numbered `mv`/`mkdir` commands. Do not execute yet:

```
PROPOSED CHANGES for <Event Name>:
1. mkdir Photos/all/
2. mv "Photos/Twitter/"    → "Photos/all/Twitter/"
3. mv "Pictures/"          → "Assets/"
4. mv "Proposal/"          → "CFP/"
5. mv "talk.key"           → "Slides/"
6. mv "invite.pdf"         → "Documents/"
7. mv "demo-project/"      → "Materials/"

FLAGGED (needs your decision):
- "Event 2026 CFP.pdf" — appears to belong to a different year
```

Ask: **"Shall I apply these changes?"**

## Step 4 — Execute on approval

Only after confirmation, run the `mkdir` and `mv` commands. Report each step. Do not delete any files.

## Step 5 — Final summary

Print the resulting tree (maxdepth 3) so you can verify the outcome.
