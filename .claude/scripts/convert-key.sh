#!/bin/bash
# Usage: convert-key.sh <source.key> <dest.pptx>
# Exports a Keynote file to PowerPoint via AppleScript (macOS only)

SOURCE="$1"
DEST="$2"

osascript << EOF
tell application "Keynote"
    set kFile to POSIX file "$SOURCE"
    open kFile
    set theDoc to front document
    export theDoc to POSIX file "$DEST" as Microsoft PowerPoint
    close theDoc saving no
end tell
EOF
