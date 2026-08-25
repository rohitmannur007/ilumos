#!/usr/bin/env bash
# Mux your own voiceover onto the silent walkthrough cut.
#
# 1. Play walkthrough/iLumos-walkthrough.mp4 (75 s) and record yourself reading
#    the script in walkthrough/WALKTHROUGH.md (any recorder: phone, QuickTime, Audacity).
# 2. Export the audio as my_voiceover.m4a (or .mp3/.wav) into this folder.
# 3. Run:  bash walkthrough/mux_voiceover.sh my_voiceover.m4a
# 4. Result: walkthrough/iLumos-walkthrough-voiced.mp4

set -euo pipefail
AUDIO="${1:?Usage: bash walkthrough/mux_voiceover.sh <your-audio-file>}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ffmpeg -y -v error \
  -i "$DIR/iLumos-walkthrough.mp4" \
  -i "$AUDIO" \
  -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart \
  "$DIR/iLumos-walkthrough-voiced.mp4"

echo "Done: $DIR/iLumos-walkthrough-voiced.mp4"
