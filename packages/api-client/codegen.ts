// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * Generates packages/api-client/src/generated/ from schema/gateway.graphql and
 * src/operations/*.graphql. Run via `pnpm run codegen` (this package) or
 * scripts/schema-generate.sh (after a schema pin change). The output is committed; never
 * hand-edit it.
 *
 * Two files, not one: the schema's own named types (schema.ts, the `typescript` plugin)
 * and the typed operations (graphql.ts, `typescript-operations` + `typed-document-node`).
 * In one file, `typescript-operations` re-declares every enum a result selects (it assumes
 * it is running alone), colliding with `typescript`'s own declaration of the same enum.
 * `importSchemaTypesFrom` points it at schema.ts instead, so it imports rather than
 * redeclares.
 */
const scalars = { DateTime: "string" };

const config: CodegenConfig = {
  documents: ["src/operations/**/*.graphql"],
  generates: {
    "src/generated/graphql.ts": {
      config: {
        avoidOptionals: false,
        immutableTypes: true,
        importSchemaTypesFrom: "./src/generated/schema",
        scalars,
        skipTypename: true,
        useTypeImports: true,
      },
      plugins: ["typescript-operations", "typed-document-node"],
    },
    "src/generated/schema.ts": {
      config: { immutableTypes: true, scalars, useTypeImports: true },
      plugins: ["typescript"],
    },
  },
  hooks: {
    afterOneFileWrite: ["prettier --write"],
  },
  schema: "schema/gateway.graphql",
};

export default config;
