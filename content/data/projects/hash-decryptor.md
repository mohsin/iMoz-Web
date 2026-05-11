---
title: Hash Decryptor
---

An RMI-based Java program that recovers the original plaintext of a given hash string by querying a MySQL database of known hash-to-plaintext mappings.

Uses Java RMI (Remote Method Invocation) for distributed processing across machines, enabling fast parallel lookups across the hash database.
