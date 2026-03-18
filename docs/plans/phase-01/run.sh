#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

/Users/doublej/go/bin/gralph --prd-md "${SCRIPT_DIR}/PRD.md" --prompt-md "${SCRIPT_DIR}/PROMPT.md" --progress-file "${SCRIPT_DIR}/progress.txt"