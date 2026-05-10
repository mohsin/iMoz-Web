You are importing a new event into the portfolio website from a local source folder.

## Project paths
- Events data: `content/data/events.yml`
- Hero images: `public/images/events/<slug>.webp`
- Event assets: `public/events/<slug>/`
- YAML template: `.claude/templates/event-template.yml`
- Photo conversion script: `.claude/scripts/convert-photos.sh`
- Keynote export script: `.claude/scripts/convert-key.sh`

## Current events.yml (for ordering and style reference)
!`cat content/data/events.yml`

## YAML entry template
!`cat .claude/templates/event-template.yml`

## Step 1 — Scan the source folder

The source folder is: $ARGUMENTS

List all files recursively, excluding hidden/macOS metadata files and videos:
```bash
find "$ARGUMENTS" -not -name ".*" -not -name "._*" \
  \( -not -iname "*.mp4" -not -iname "*.mov" -not -iname "*.avi" \) \
  | sort
```

Also read any text files present (README, changes.md, notes, etc.) for event context.

## Step 2 — Identify event metadata

From the folder name, file contents, slide decks, and documents, determine:
- **Title**: full event name
- **Slug**: lowercase, hyphenated, URL-safe (e.g. `aws-community-day-2019`)
- **Type**: one of Conference | Workshop | Summit | Meetup
- **Designation**: your role — one of speaker | leader | organizer | attendee
- **Date**: exact date(s) — check file modification dates (`mdls`), document contents, slides
- **Location**: venue and city
- **Description**: 1–2 sentences about the event and your specific talk/role

If any metadata is unclear, do a web search for the event name + year.

## Step 3 — Web research

Search for:
1. The official event website — check if a `#speakers` anchor or speaker-specific URL exists
2. Any event recap blog posts that mention you (search: `"Saifur Rahman Mohsin" "<event name>" <year>`)
3. Any "Know Your Speaker" posts on the organiser's blog
4. Any other coverage worth linking

Collect all valid URLs for the `link` field.

## Step 4 — Curate photos

Read every image in the source folder visually (use the Read tool). For each, decide:

**Include if:**
- You are visible and clearly the subject (on stage, presenting, receiving award)
- It shows event atmosphere (crowd, venue, stage) that adds context
- It is sharp, well-lit, and correctly oriented
- It shows a meaningful moment (receiving award, audience interaction)

**Skip if:**
- You are not present and it's just a slide screenshot
- Rotated, blurry, or a near-duplicate of another included photo
- Another speaker unrelated to you
- A video file

Order from most impactful to least. Aim for 4–8 photos.

**Hero image:** Look for an official speaker card graphic, event branding with your name, or a strong single portrait. This becomes `image:` in events.yml.

## Step 5 — Convert and copy assets

### Hero image
```bash
cwebp -q 85 "<source_hero>" -o "public/images/events/<slug>.webp"
```

### Carousel photos
```bash
mkdir -p "public/events/<slug>"
bash .claude/scripts/convert-photos.sh "<source>" "public/events/<slug>/photo-1.webp"
# repeat for photo-2.webp, photo-3.webp, ...
```

### Slides
If a `.key` file is present:
```bash
bash .claude/scripts/convert-key.sh "<source.key>" "public/events/<slug>/slides.pptx"
```
If a `.pdf` or `.pptx` already exists, copy it directly.

### Other documents (certificates, brochures)
Copy to `public/events/<slug>/` if they should be linked.

## Step 6 — Insert into events.yml

Events are ordered **reverse chronologically** (latest first). Find the correct position by comparing dates with existing entries, then insert using the Edit tool.

Rules:
- Omit `image:` entirely if there is no hero image (do NOT write `image: ""`)
- Omit `link:` entirely if there are no links
- Omit `photos:` entirely if there are no carousel photos
- Set `added_on:` to today's date and current approximate time

## Step 7 — Report and commit message

Output:
1. A summary of what was imported (event name, photos added, links found, slides converted)
2. A suggested git commit message with bullet points, e.g.:

```
chore(events): add photos and links for <Event Name> <Year>

* Add hero image from official speaker card graphic
* Add N carousel photos converted to WebP
* Export Keynote slides to PPTX
* Link to official event website and AWSUGBLR blog recap
```

Do not run `git commit` — only suggest the message.
