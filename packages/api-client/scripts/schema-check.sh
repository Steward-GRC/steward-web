#!/usr/bin/env bash
# Offline check that the committed schema and generated code match the pin in
# schema-refs.env: schema/gateway.graphql names STEWARD_GATEWAY_REF and hashes to
# STEWARD_GATEWAY_SCHEMA_SHA256, and src/generated/ is exactly what codegen makes
# from it and src/operations/. Never writes: a stale src/generated/ is restored
# and reported. Fix a failure with scripts/schema-generate.sh.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# shellcheck source=/dev/null
source schema-refs.env

fail() {
  echo "schema-check: $*" >&2
  echo "  Run packages/api-client/scripts/schema-generate.sh and commit the result." >&2
  exit 1
}

[[ "${STEWARD_GATEWAY_REF}" =~ ^[0-9a-f]{40}$ ]] ||
  fail "STEWARD_GATEWAY_REF must be a full 40-character commit sha."

schema="schema/gateway.graphql"
[ -f "${schema}" ] || fail "${schema} is missing."

grep -qxF "# steward-gateway commit: ${STEWARD_GATEWAY_REF}" "${schema}" ||
  fail "${schema} was not generated from steward-gateway ${STEWARD_GATEWAY_REF}."

sum="$(sha256sum "${schema}" | cut -d' ' -f1)"
[ "${sum}" = "${STEWARD_GATEWAY_SCHEMA_SHA256}" ] ||
  fail "${schema} has been edited since it was fetched (sha256 ${sum})."

saved="$(mktemp -d)"
trap 'rm -rf "${saved}"' EXIT
cp -R src/generated/. "${saved}/"

pnpm exec graphql-codegen --config codegen.ts --silent >/dev/null

if ! diff -r "${saved}" src/generated >"${saved}.diff"; then
  cat "${saved}.diff" >&2
  rm -f "${saved}.diff"
  rm -rf src/generated
  mkdir -p src/generated
  cp -R "${saved}/." src/generated/
  fail "src/generated/ is out of date with the schema or src/operations/."
fi
rm -f "${saved}.diff"

echo "schema-check: schema and generated code match steward-gateway ${STEWARD_GATEWAY_REF}."
