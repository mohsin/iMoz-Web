# Canonical Event Folder Structure

Every event folder on the SSD should follow this layout.
Use this as the target when reorganizing a given folder.

```
Events/
└── <Category>/                      # Conferences | Workshops | Summits | Meetups | Talks
    └── <Event Name YYYY>/           # Title Case, includes 4-digit year, spaces not hyphens
        ├── CFP/                     # FIRST step — submitted before the event
        │   ├── proposal.pdf         # The CFP/application submitted
        │   ├── abstract.md          # Talk abstract (if separate)
        │   └── bio.md               # Speaker bio submitted with CFP
        ├── Photos/
        │   ├── selected/            # Best curated photos (used on website)
        │   └── all/                 # Full unfiltered set; source subfolders OK (Twitter/, Dad/, Thamu/)
        ├── Slides/                  # Presentation source files
        │   ├── <name>.key           # Original Keynote (source of truth)
        │   └── <name>.pptx          # Exported PowerPoint
        ├── Materials/               # Workshop code, demo projects, zip files, reference repos
        ├── Assets/                  # Slide-making assets: diagrams, logos, speaker cards, .psd files,
        │                            # reference images used in building the presentation
        ├── Documents/               # Certificates, brochures, invite PDFs, contracts, confirmation emails
        └── notes.md                 # (optional) personal notes
```

## Category definitions
- **Conferences** — large multi-track events (AWS Community Day, Google DevFest)
- **Workshops** — you led a hands-on session for others
- **Summits** — invite-only or leadership gatherings (Google Web Leaders Summit)
- **Meetups** — community meetups, smaller public talks
- **Talks** — recorded/online sessions, webinars (Indiez University, Kloudi)

## File classification quick reference
| File | Destination |
|------|-------------|
| `.key`, `.pptx`, `.ppt` | `Slides/` |
| `.pdf` with "CFP", "Call for", "Sessionize", "Proposal" in name | `CFP/` |
| `.pdf` (certificate, brochure, invite, contract) | `Documents/` |
| `.eml`, `.txt` (emails, notes) | `Documents/` |
| Event photos (`.jpg`, `.heic`, `.png` of people/venue) | `Photos/all/` |
| Slide-making assets (diagrams, reference images, `.psd`, logos) | `Assets/` |
| Speaker cards / event branding graphics | `Assets/` |
| Demo projects, code repos, `.zip` files | `Materials/` |
| `Proposal/` subfolder | Rename → `CFP/` |
| `Pictures/` subfolder (slide assets, not event photos) | Rename → `Assets/` |
| Video files | Leave in place, do not move to website |
