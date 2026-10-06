# @steward-web/api-client

The gateway's GraphQL schema, pinned to a steward-gateway commit, the typed operations
generated from it, and the live network edge (`src/edge/live.server.ts`) every loader and
action calls.

## How the schema is pinned

- `schema-refs.env` holds `STEWARD_GATEWAY_REF`, a full commit sha on steward-gateway's
  `main`, and `STEWARD_GATEWAY_SCHEMA_SHA256`, the hash of the fetched schema.
- `schema/gateway.graphql` is steward-gateway's `graphql/*.graphqls` at that commit,
  concatenated (`schema.graphqls` first, then the rest by name). It is generated; never edit
  it by hand, and never change it to suit the web. A field the web needs and the gateway
  lacks is a gateway change.
- `src/generated/` is the codegen output for that schema and `src/operations/*.graphql`.

## Re-pin or regenerate

```bash
corepack enable pnpm
# edit STEWARD_GATEWAY_REF in schema-refs.env, then:
bash packages/api-client/scripts/schema-generate.sh
```

The script fetches the pinned commit's SDL (the only network step), rewrites
`schema/gateway.graphql` and the hash, and reruns codegen. Run it again after editing an
operation. Commit all three together.

## The check

`pnpm run check:schema` (part of `pnpm run check`, so CI runs it) is offline: it verifies
the committed schema names the pinned commit and matches the recorded hash, and that
`src/generated/` is exactly what codegen produces. It never writes.

## View types

Where the gateway answers in several reads what a screen shows as one thing (the library
row, the reader's policy detail, the signed-in identity), `src/views.ts` defines the web's
own shape and the live edge assembles it from the real queries. The mock gateway returns
the same shapes.
