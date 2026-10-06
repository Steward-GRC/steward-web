# Development

## The workspace

A pnpm workspace (`pnpm-workspace.yaml`): `apps/staff`, `apps/admin` and `apps/docs`, plus the
shared `packages/*` (`ui`, `i18n`, `auth`, `shell`, `api-client`, `mock-gateway`,
`vite-config`) and the `server/` Node server image. `pnpm install --ignore-scripts` is the
only install step; `--ignore-scripts` keeps a `prepare` hook from resetting the commit hooks.

```bash
corepack enable pnpm
pnpm install --ignore-scripts
pnpm run check     # schema check, lint, typecheck, unit tests, build, mock-leak check
```

Run one app in dev mode from its own directory, or with pnpm's `--filter`:

```bash
pnpm --filter @steward-web/staff run dev
pnpm --filter @steward-web/admin run dev
```

Both talk to `GATEWAY_URL` (default `http://localhost:8080/query`; see
`docs/configuration.md`) unless started with `dev:mock` (below).

`apps/docs` is a standalone Docusaurus site with no gateway dependency; run it the same way:

```bash
pnpm --filter @steward-web/docs run dev
```

## The codegen step (`packages/api-client`)

The gateway's GraphQL schema is pinned to a steward-gateway commit, not fetched on every
install: `schema-refs.env` names the commit and the schema file's hash, `schema/gateway.graphql`
is the fetched SDL, and `src/generated/` is codegen's output from that schema plus
`src/operations/*.graphql`. All three are committed; none is hand-edited.

To add or change an operation, edit the `.graphql` file under `src/operations/`, then
regenerate:

```bash
bash packages/api-client/scripts/schema-generate.sh
```

To re-pin to a newer steward-gateway commit, edit `STEWARD_GATEWAY_REF` in `schema-refs.env`
first, then run the same script — it fetches the pinned commit's SDL (the only network step),
rewrites the schema file and its hash, and reruns codegen. Commit the three files together.
`pnpm run check:schema` (part of `pnpm run check`) verifies offline that the committed schema
matches the pinned commit and hash, and that `src/generated/` is exactly what codegen produces
from it; it never writes.

## The mock build

A build's network edge is chosen at build time, from the Vite mode alone:

```bash
pnpm --filter @steward-web/staff run dev:mock     # dev server against the mock gateway
pnpm run build:mock                                # every app, mock edge
```

`--mode mock` swaps in `packages/mock-gateway` as the app's network edge and its persistent
"MOCK DATA" banner; every other mode (including no mode) is live. There is no environment
variable that turns mock mode on — `packages/vite-config`'s `chooseEdge` refuses a live build
that has `STEWARD_MOCK` set to anything but empty or `false`, so a production build can't be
talked into serving mock data. `pnpm run check:no-mock-leak` (part of `pnpm run check`) scans
each app's live `build/` output for the mock marker as a regression guard.

## Tests

Vitest, colocated `*.test.ts`/`*.test.tsx` files, Testing Library for components. No
Playwright or other end-to-end suite in this version; UI behaviour is covered through unit and
component tests against public component and route APIs.
