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

## The dev UI-issue button

A "Copy for UI issue" button, for local development only, in both the staff and admin apps.
One click copies a single line of compact JSON describing the current page, for pasting into
an issue or a chat.

It needs two things set together, the same two-flag pattern the mock build uses:

```bash
# Build with the button's code included.
pnpm --filter @steward-web/staff exec vite build  # or docker build --build-arg DEV_UI_ISSUE_COPY=true ...

# Run the server with the button turned on.
STEWARD_DEV_UI_ISSUE_COPY=true pnpm --filter @steward-web/staff run dev
```

`DEV_UI_ISSUE_COPY=true` (the Dockerfile build argument, `STEWARD_DEV_UI_ISSUE_COPY_BUILD` once
it reaches the build) is what lets the button's code into the bundle at all:
`packages/vite-config`'s `chooseDevUiIssueButton` aliases `@steward-web/dev-ui-issue-button` to
the real button only then, a no-op otherwise, the same tree-shaking swap the mock banner uses.
`STEWARD_DEV_UI_ISSUE_COPY=true` is the server env the root loader reads to decide whether to
actually render it. Both default to off, and either one being off hides the button.
`pnpm run check:no-dev-ui-issue-leak` (part of `pnpm run check`) scans each app's live `build/`
output for the button's marker as a regression guard, the same way `check:no-mock-leak` guards
the mock banner.

What it copies (schema v1, shared with every product's web repos — see
`packages/shell/src/uiIssueBundle.ts`): one line of minified JSON with fixed keys in a fixed
order (`v`, `product`, `app`, `sha`, `route`, `path`, `params`, `role`, `vw`, `vh`, `dpr`, `ua`,
`t`, `theme`, `locale`, `clicked`, `lastErr`, `recentErrors`); a key with no value is omitted,
never set to null. It stays on schema v1; the rules below only narrow what the values may
hold:

- `sha` is the build's `COMMIT`, else `GITHUB_SHA`, else `unknown`.
- `route` is the deepest matched route's id and `path` its pattern, built segment by segment
  so a param value never survives in it, URL-encoded or not. A location no route matched is
  reported as `*` for both, never as its pathname.
- `params` keeps a matched param only when its value is a ULID or a UUID; anything else
  (numbers, slugs, usernames, serials) is dropped.
- `role` is the signed-in user's role, never a username, display name or email.
- `clicked` is the last clicked element's `data-testid`, else a short CSS selector, never its
  text. Clicks inside the button's own UI are never recorded: its container and its portaled
  fallback dialog both carry `data-steward-dev-ui-issue`, and no click counts while that
  dialog is open (so its overlay doesn't either).
- `lastErr`/`recentErrors` hold up to 5 errors, newest first, from window errors, unhandled
  rejections and API failures (`src: "fetch"`). Every API client, server and browser alike,
  reports its failures through `@steward-web/api-client`'s `reportApiError`; a listener that
  throws can never replace the caller's error. The button listens (`onApiError`) only in the
  browser, so the bundle holds the failures of calls the browser made itself (Copy
  diagnostics, the AI-health poll, the AI-job stream); a loader's or action's gateway call
  fails on the server and reaches the page as its error or refusal instead.
- Every message passes one redaction, `redactMessage` in `uiIssueBundle.ts`, before the
  200-character cap (and only its first 4096 characters are looked at): a JSON-style string
  value under a `password`, `token`, `secret` or `api_key` key (any case, any spacing around
  the colon, cut off or itself escaped inside a string) becomes `"[redacted]"`; emails, `Bearer` and
  `Basic` values, JWTs, cookie-style `key=value` values of 8+ characters and token-shaped runs
  of 24+ characters holding both digits and letters (ULIDs and UUIDs excepted) become
  `[redacted]`; URL userinfo collapses to `scheme://[host]`; URL fragments carrying `=`, `&` or
  `/` (such as `#access_token=...`) are stripped; a PEM block, even an unterminated one,
  becomes `[pem]`; hostnames of two or more labels ending in a network or reserved TLD
  (`.com`, `.org`, `.example`, `.corp`, `.internal` and the like) become `[host]`, while code
  stays readable: `a.b`, file names such as `main.js` or `config.local.js`, and property paths
  such as `console.info` (TLDs that double as common property names, like `.app`, `.dev` and
  `.info`, are not treated as hosts); IPv4/IPv6 addresses become `[ip]`.
- Known limits: errors a route's error boundary renders are not recorded (`src: "render"` is
  never set), and loader or action failures happen on the server, so neither reaches the
  bundle.

Nothing it copies ever includes secrets, tokens, cookies, query strings or form data.

## The dev quick login

A "Dev quick login" picker under the sign-in form, for local testing against a real gateway
with a few seeded local accounts. Picking an account signs it in with its password through
the same gateway `POST /auth/login` as the form, so a second factor is still asked for.

It needs both switches, the same pattern as the dev UI-issue button:

- **Build allowance:** always on for the dev server (`pnpm --filter @steward-web/staff run
  dev`); a production build only with `STEWARD_DEV_QUICK_LOGIN_BUILD=true`, which the image
  sets from the `DEV_QUICK_LOGIN` build argument (default `false`). Never in a `--mode mock`
  build. Without the allowance, `packages/vite-config`'s `chooseDevelopmentQuickLogin` aliases
  `@steward-web/dev-quick-login` and `@steward-web/dev-quick-login.server` to no-ops, so the
  picker and the users-file reader are not in the bundle and the `dev-quick-login` intent
  answers 404.
- **Server switch:** `STEWARD_DEV_QUICK_LOGIN=true`, with `STEWARD_DEV_QUICK_LOGIN_USERS`
  naming a local JSON file of accounts:

```json
[
  { "username": "staff.sample@example.org", "password": "...", "label": "Staff (sample)" },
  { "username": "approver.sample@example.org", "password": "...", "note": "approver" }
]
```

`label` and `note` are optional. The file is read on the server
(`packages/auth/src/developmentQuickLogin.server.ts`); the page only gets each username,
label and note. A missing or malformed file turns the picker off. Keep the file out of the
repository: it holds local test passwords.

```bash
docker build --build-arg APP=staff --build-arg DEV_QUICK_LOGIN=true -t steward-web:dev .
docker run -e STEWARD_DEV_QUICK_LOGIN=true -e STEWARD_DEV_QUICK_LOGIN_USERS=/users.json \
  -v "$PWD/users.json:/users.json:ro" ... steward-web:dev
```

`pnpm run check:no-dev-quick-login-leak` (part of `pnpm run check`, so CI runs it on every pull
request) fails if a release build under `apps/*/build` carries the picker's marker or the
users-file variable name, or if the Dockerfile's `DEV_QUICK_LOGIN` defaults to anything but
`false`.

## Tests

Vitest, colocated `*.test.ts`/`*.test.tsx` files, Testing Library for components. No
Playwright or other end-to-end suite in this version; UI behaviour is covered through unit and
component tests against public component and route APIs.
