#!/usr/bin/env bash
# Refresh packages/api-client/schema/gateway.graphql, then regenerate the typed
# operations in src/generated/. Run after schema-refs.env changes, or after editing
# an operation in src/operations/.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# shellcheck source=/dev/null
source schema-refs.env

if [ -n "${STEWARD_GATEWAY_REF}" ]; then
  echo "schema-generate: STEWARD_GATEWAY_REF is set but the live fetch isn't wired yet." >&2
  echo "  Pin steward-gateway's schema export path here once it exists, and drop the" >&2
  echo "  vendored schema/gateway.graphql and ORIGINAL_GATEWAY_REF." >&2
  exit 1
fi

echo "schema-generate: using the vendored schema (pinned from the original gateway ${ORIGINAL_GATEWAY_REF})."
pnpm exec graphql-codegen --config codegen.ts
