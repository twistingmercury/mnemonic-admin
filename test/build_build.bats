#!/usr/bin/env bats

setup() {
    PROJECT_ROOT="$(cd "${BATS_TEST_DIRNAME}/.." && pwd)"
    MOCK_BIN_DIR="${BATS_TEST_TMPDIR}/bin"
    DOCKER_ARGS_FILE="${BATS_TEST_TMPDIR}/docker-args"

    mkdir -p "${MOCK_BIN_DIR}"
    export DOCKER_ARGS_FILE

    # shellcheck disable=SC2016 # The mock needs its variables to expand at runtime.
    printf '%s\n' \
        '#!/usr/bin/env bash' \
        'set -euo pipefail' \
        'printf "%s\\n" "$@" >> "${DOCKER_ARGS_FILE:?}"' \
        > "${MOCK_BIN_DIR}/docker"
    chmod +x "${MOCK_BIN_DIR}/docker"
}

run_build() {
    run env \
        "PATH=${MOCK_BIN_DIR}:${PATH}" \
        "MNEMONIC_API_URL=${1-}" \
        BUILD_VER=test-version \
        BUILD_DATE=2026-01-01T00:00:00Z \
        BUILD_COMMIT=test-commit \
        IMAGE_NAME=test-image \
        IMAGE_TAG=test-tag \
        bash "${PROJECT_ROOT}/build/build.sh"
}

@test "fails without MNEMONIC_API_URL before invoking Docker" {
    run env \
        -u MNEMONIC_API_URL \
        "PATH=${MOCK_BIN_DIR}:${PATH}" \
        bash "${PROJECT_ROOT}/build/build.sh"

    [ "${status}" -ne 0 ]
    [[ "${output}" == *"MNEMONIC_API_URL must be set and non-empty."* ]]
    [ ! -e "${DOCKER_ARGS_FILE}" ]
}

@test "fails with an empty MNEMONIC_API_URL before invoking Docker" {
    run_build ""

    [ "${status}" -ne 0 ]
    [[ "${output}" == *"MNEMONIC_API_URL must be set and non-empty."* ]]
    [ ! -e "${DOCKER_ARGS_FILE}" ]
}

@test "fails with a whitespace-only MNEMONIC_API_URL before invoking Docker" {
    run_build $' \t\n '

    [ "${status}" -ne 0 ]
    [[ "${output}" == *"MNEMONIC_API_URL must be set and non-empty."* ]]
    [ ! -e "${DOCKER_ARGS_FILE}" ]
}

@test "passes MNEMONIC_API_URL to Docker as a build argument" {
    api_url='https://mnemonic-api.example.test/v1/api?tenant=demo&region=us'

    run_build "${api_url}"

    [ "${status}" -eq 0 ]
    [ -f "${DOCKER_ARGS_FILE}" ]
    docker_args="$(<"${DOCKER_ARGS_FILE}")"
    [[ "${docker_args}" == *$'build\n--rm\n--no-cache'* ]]
    [[ "${docker_args}" == *$'--build-arg\nMNEMONIC_API_URL='"${api_url}"* ]]
}
