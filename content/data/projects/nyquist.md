---
title: Nyquist
---

Nyquist (also known as MKB Music Box — named after the initials of the team members) is a media organizer that identifies music by its audio signature, similar to how Shazam works.

## How It Was Built

Built for Softkriti, an IIT-K software contest. Since Shazam is closed-source, the audio fingerprinting technology had to be built from scratch.

Internally, the app uses Fast Fourier Transform (FFT) to calculate an audio signature and stores a hash of it in a database. After building signatures for a library of songs and adding their ID3 tags, a user can select any folder of music and the system automatically identifies each song by comparing its computed signature against the database.

## Performance

The software worked correctly and was very fast, since the global database was run locally during testing. The team came in 3rd at the contest — the winners were both IIT-K students showcasing sample projects on popular platforms of the time.
