---
title: Portable Data Protection System
languages: C#
platforms: Desktop,Windows
frameworks: .NET
tools: Visual Studio
concepts: MVC,JIT
---

PDPS is a novel approach to malware prevention that stops threats before they ever get processor execution cycles — unlike conventional antivirus software that scans for known signatures after the fact.

## How It Works

Instead of a malware definition database, the system uses Access Control Lists (ACLs) to define which processes are allowed to run. Everything else is blocked. The system hooks into the operating system's loader and filters all system calls — much like a firewall — prompting the user whenever an unknown process tries to execute.

Since most malware arrives silently attached to legitimate files, a moderately informed user can immediately spot that a process was never initiated by them and deny it. No definition files, no updates, no heavy scans.

## Portable Deployment

The program was written as an autorun application for a pen drive with a hardware read-only switch. Because the drive itself is write-protected, it can't be infected — making it a versatile, self-contained security tool that can be plugged into any Windows machine.

## Publication

The underlying concept was written up as a research paper and published in a peer-reviewed journal — Special Issue-1, October 2014, ISSN 2321-9653.
