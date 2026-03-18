#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
IMAGE_TAG="mnemonic-admin:latest"

echo "Building image: ${IMAGE_TAG}"
echo "Context: ${PROJECT_ROOT}"

docker build \
    --progress=plain \
    -f "${SCRIPT_DIR}/Dockerfile" \
    -t "${IMAGE_TAG}" \
    "${PROJECT_ROOT}"

echo "Build complete: ${IMAGE_TAG}"
