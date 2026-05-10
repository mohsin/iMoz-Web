#!/bin/bash
# Usage: scan-folder.sh <events-root-dir>
# Prints a tree of each event folder showing file types found,
# so Claude can identify the current structure and inconsistencies.

ROOT="$1"

find "$ROOT" -mindepth 1 -maxdepth 1 -type d | sort | while read -r event_dir; do
    echo "=== $(basename "$event_dir") ==="
    find "$event_dir" -not -name ".*" -not -name "._*" | sort | sed "s|$ROOT/||"
    echo ""
done
