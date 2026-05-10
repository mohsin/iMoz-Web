#!/bin/bash
# Usage: convert-photos.sh <source_file> <dest_file> [quality]
# Converts a single image (JPG/PNG/HEIC) to WebP
# Call once per file so the caller controls naming (photo-1.webp, photo-2.webp, etc.)

SOURCE="$1"
DEST="$2"
QUALITY="${3:-85}"

cwebp -q "$QUALITY" "$SOURCE" -o "$DEST"
