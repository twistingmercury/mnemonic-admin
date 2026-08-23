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

run_build_without_api_url() {
    run env \
        -u MNEMONIC_API_URL \
        "PATH=${MOCK_BIN_DIR}:${PATH}" \
        BUILD_VER=test-version \
        BUILD_DATE=2026-01-01T00:00:00Z \
        BUILD_COMMIT=test-commit \
        IMAGE_NAME=test-image \
        IMAGE_TAG=test-tag \
        bash "${PROJECT_ROOT}/build/build.sh"
}

run_build_with_api_url() {
    run env \
        "PATH=${MOCK_BIN_DIR}:${PATH}" \
        "MNEMONIC_API_URL=${1}" \
        BUILD_VER=test-version \
        BUILD_DATE=2026-01-01T00:00:00Z \
        BUILD_COMMIT=test-commit \
        IMAGE_NAME=test-image \
        IMAGE_TAG=test-tag \
        bash "${PROJECT_ROOT}/build/build.sh"
}

assert_ordinary_docker_invocation() {
    expected_args="$(printf '%s\n' \
        build \
        --rm \
        --no-cache \
        --file "${PROJECT_ROOT}/build/Dockerfile" \
        --build-arg \
        BUILD_VER=test-version \
        --build-arg \
        BUILD_DATE=2026-01-01T00:00:00Z \
        --build-arg \
        BUILD_COMMIT=test-commit \
        --target final \
        --tag test-image:test-tag \
        --tag test-image:latest \
        "${PROJECT_ROOT}" \
        images \
        test-image:test-tag \
        --format 'Size: {{.Size}}')"

    diff -u <(printf '%s\n' "${expected_args}") "${DOCKER_ARGS_FILE}"
}

@test "builds without MNEMONIC_API_URL" {
    run_build_without_api_url

    [ "${status}" -eq 0 ]
    [ -f "${DOCKER_ARGS_FILE}" ]
    assert_ordinary_docker_invocation
}

@test "ignores MNEMONIC_API_URL instead of passing it as a Docker build argument" {
    api_url='https://mnemonic-api.example.test/v1/api?tenant=demo&region=us'

    run_build_with_api_url "${api_url}"

    [ "${status}" -eq 0 ]
    [ -f "${DOCKER_ARGS_FILE}" ]
    assert_ordinary_docker_invocation
    docker_args="$(<"${DOCKER_ARGS_FILE}")"
    [[ "${docker_args}" != *MNEMONIC_API_URL* ]]
    [[ "${docker_args}" != *"${api_url}"* ]]
}
