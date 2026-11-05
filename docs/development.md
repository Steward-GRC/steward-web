# Development

## The workspace

A pnpm workspace (`pnpm-workspace.yaml`): `apps/staff`, `apps/admin` and `apps/docs`, plus the
shared `packages/*` (`ui`, `i18n`, `auth`, `shell`, `api-client`, `vite-config`) and the `server/` Node server image. `pnpm install --ignore-scripts` is the
only install step; `--ignore-scripts` keeps a `prepare` hook from resetting the commit hooks.

```bash
corepack enable pnpm
pnpm install --ignore-scripts
pnpm run check     # schema check, lint, typecheck, unit tests, build, leak checks
```

Run one app in dev mode from its own directory, or with pnpm's `--filter`:

```bash
pnpm --filter @steward-web/staff run dev
pnpm --filter @steward-web/admin run dev
```

Both talk to `GATEWAY_URL` (default `http://localhost:8080/query`; see
`docs/configuration.md`). To work on mock data, point it at the mock server (below).

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

## Mock data

Mock data comes from [steward-mock-server](https://github.com/Steward-GRC/steward-mock-server), a
standalone server that answers steward-gateway's API on its real protocol from invented,
resettable data. The apps run in their normal live mode against it, so there is no mock build
and no mock code in this repo. Clone it beside this repo and start it on port 5175:

```bash
git clone https://github.com/Steward-GRC/steward-mock-server.git ../steward-mock-server
(cd ../steward-mock-server && npm ci --ignore-scripts && npm start)
```

Then run the apps against it, each in its own terminal:

```bash
GATEWAY_URL=http://localhost:5175/query pnpm --filter @steward-web/staff run dev
GATEWAY_URL=http://localhost:5175/query pnpm --filter @steward-web/admin run dev
```

Staff is on <http://localhost:5173> and admin on <http://localhost:5174/admin>; both ports are
pinned, so a port already in use stops that app instead of moving it. The mock's
controls and the people you can sign in as are on <http://localhost:5175/_mock>. Any password
works, and any six-digit code except `000000`. First-run setup takes the token
`mock-setup-token` (the mock's `MOCK_SETUP_TOKEN`).

## The dev UI-issue button

A "Copy for UI issue" button, for local development only, in both the staff and admin apps.
One click copies a single line of compact JSON describing the current page, for pasting into
an issue or a chat.

It needs two things set together:

```bash
# Build with the button's code included.
pnpm --filter @steward-web/staff exec vite build  # or docker build --build-arg DEV_UI_ISSUE_COPY=true ...

# Run the server with the button turned on.
STEWARD_DEV_UI_ISSUE_COPY=true pnpm --filter @steward-web/staff run dev
```

`DEV_UI_ISSUE_COPY=true` (the Dockerfile build argument, `STEWARD_DEV_UI_ISSUE_COPY_BUILD` once
it reaches the build) is what lets the button's code into the bundle at all:
`packages/vite-config`'s `chooseDevUiIssueButton` aliases `@steward-web/dev-ui-issue-button` to
the real button only then, a no-op otherwise, a tree-shaking swap.
`STEWARD_DEV_UI_ISSUE_COPY=true` is the server env the root loader reads to decide whether to
actually render it. Both default to off, and either one being off hides the button.
`pnpm run check:no-dev-ui-issue-leak` (part of `pnpm run check`) scans each app's live `build/`
output for the button's marker as a regression guard.

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

One button per seeded local account under the sign-in form, for local testing against a real
gateway: one click signs in with that account's password through the same gateway
`POST /auth/login` as the form, so a second factor is still asked for. A "Dev login, test users
only" banner sits above the buttons, and the same banner shows as a thin bar at the top of
every other page while the switch is on, so a build or deployment carrying it is never mistaken
for production.

It needs both switches, the same pattern as the dev UI-issue button:

- **Build allowance:** always on for the dev server (`pnpm --filter @steward-web/staff run
  dev`); a production build only with `STEWARD_DEV_QUICK_LOGIN_BUILD=true`, which the image
  sets from the `DEV_QUICK_LOGIN` build argument (default `false`). Without the allowance, `packages/vite-config`'s `chooseDevelopmentQuickLogin` aliases
  `@steward-web/dev-quick-login` and `@steward-web/dev-quick-login.server` to no-ops, so the
  picker and the users-file reader are not in the bundle and the `dev-quick-login` intent
  answers 404.
- **Server switch:** `STEWARD_DEV_QUICK_LOGIN=true`, with the accounts named one of two ways
  (the directory wins when both are set):
  - `STEWARD_DEV_QUICK_LOGIN_USERS_DIR` naming a directory with one JSON-object account per
    file, `{ "username": "...", "password": "...", "label": "...", "note": "..." }` — the shape
    a Kubernetes Secret volume mounts, one Secret key per account. This is the form a cluster
    deployment uses: mount a Secret (holding only the seeded test accounts, on the web pods
    only) and point this variable at the mount path.
  - `STEWARD_DEV_QUICK_LOGIN_USERS` naming a single local JSON file, an array of the same
    account shape:

```json
[
  { "username": "staff.sample@example.org", "password": "...", "label": "Staff (sample)" },
  { "username": "approver.sample@example.org", "password": "...", "note": "approver" }
]
```

`label` and `note` are optional. Either source is read on the server
(`packages/auth/src/developmentQuickLogin.server.ts`); the page only gets each username,
label and note. A missing or malformed source turns the picker (and the banner) off. Keep any
local file out of the repository: it holds local test passwords.

```bash
docker build --build-arg APP=staff --build-arg DEV_QUICK_LOGIN=true -t steward-web:dev .
docker run -e STEWARD_DEV_QUICK_LOGIN=true -e STEWARD_DEV_QUICK_LOGIN_USERS=/users.json \
  -v "$PWD/users.json:/users.json:ro" ... steward-web:dev
```

`pnpm run check:no-dev-quick-login-leak` (part of `pnpm run check`, so CI runs it on every pull
request) fails if a release build under `apps/*/build` carries the picker's marker or the
users-file variable name, or if the Dockerfile's `DEV_QUICK_LOGIN` defaults to anything but
`false`.

## Reaching each gate

Sign-in and the other gates (the Gates design frames) render outside the app shell as one
centred card. Each one can be reached against the mock, so it can be checked and screenshotted.
Where the mock can produce the real state, use it:

| Gate                              | How to reach it against the mock                                                                                                                                                                                                    |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G3 sign in, G3m on a phone        | Open `/sign-in` signed out (`/admin/sign-in` for admin). With `STEWARD_ORGANISATION` set, the organisation slot leads the card.                                                                                                     |
| G3 error state                    | Sign in with the password `wrong-password`.                                                                                                                                                                                         |
| G6 choose a method, then the code | Sign in as `alice` (any password): she has an authenticator app and email codes. A wrong code is `000000`.                                                                                                                          |
| G7 set up a second factor         | Sign in as `dave` (any password): he must enrol an authenticator first.                                                                                                                                                             |
| G9 signing in                     | Shows for a moment after any sign-in succeeds.                                                                                                                                                                                      |
| G4 SSO, then home or G6           | Select "Sign in with SSO →", enter `erin` (signs straight in) or `alice` (goes on to her second factor). The mock's SSO is a pass-through test.                                                                                     |
| G2 not set up yet                 | Start the mock as a new install ("Start as a new install" on `/_mock`), then open `/sign-in`: it goes to `/not-set-up`.                                                                                                             |
| G1 checking the instance          | `/not-set-up` while the gateway can't answer `GET /setup/state` (it keeps answering during maintenance, so use the preview below).                                                                                                  |
| G11 maintenance lockdown          | `POST /_mock/controls` with `{"kind":"maintenance-start"}`, then any staff page; signed in as `alice`, it offers "Go to admin portal". End it with `{"kind":"maintenance-end"}`. An announced window only shows the warning banner. |
| G13–G15 first-run setup           | Start the mock as a new install, then open `/admin/setup`; the setup token is `mock-setup-token`.                                                                                                                                   |
| G16 shared policy reader          | `/share/<any token>` says the gateway can't open shared links yet (steward-gateway#53); use the preview below for the reader.                                                                                                       |
| G18 remote SSO test               | `/sso-test?token=<any>` says the gateway can't look test links up yet (steward-gateway#54); use the preview below.                                                                                                                  |
| G18r remote SSO test result       | `/sso-test/result?test=passed`, `?test=failed&reason=sso_no_email` or `?test=expired`.                                                                                                                                              |
| G12 admins only                   | Sign in to `/admin` as `erin` (a reader).                                                                                                                                                                                           |
| G10 welcome                       | Select "Erin owes onboarding" on `/_mock` (or `POST /_mock/controls` with `{"kind":"needs-onboarding","personId":"user-erin"}`), then sign in as `erin`: she goes to `/welcome`, and Get started clears it.                         |

For any state you want to hold still, such as an error, the dev server takes `?gate=<frame id>`
on the sign-in page and shows that gate with sample data and every option on:

| `?gate=`        | Shows                                                                             |
| --------------- | --------------------------------------------------------------------------------- |
| `G3`            | The password card in its error state, with Forgot password?, SSO and the passkey. |
| `G3m`           | The password card as the phone frame draws it, with SSO turned off.               |
| `G4`            | The SSO identifier step.                                                          |
| `G6`            | Choose a method (authenticator app, email code, passkey).                         |
| `G6-code`       | The six-box code after an emailed code, with the wrong-code error.                |
| `G7`            | Set up an authenticator app, with its QR code.                                    |
| `G8`, `G8-code` | The password reset: the email step, then the code and new password.               |
| `G9`            | Signing in.                                                                       |

The status gates take the same parameter where they render:

| URL                                                              | Shows                                                                                       |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `/not-set-up?gate=G1`, `/not-set-up?gate=G2`                     | Checking the instance; not set up yet.                                                      |
| `/welcome?gate=G10`                                              | The welcome page with a sample first SSO sign-in.                                           |
| `/sign-in?gate=G11`, `/admin/sign-in?gate=G11`                   | The maintenance lockdown (staff with the admin portal).                                     |
| `/share/any?gate=G16`, `G16-revoked`, `G16-expired`, `G16-email` | The shared policy reader, a revoked or expired link, and the sensitive-policy email prompt. |
| `/sso-test?gate=G18`                                             | The remote SSO test's landing, with a sample test.                                          |
| `/admin/sign-in?gate=G12`                                        | Admins only, signed in as a sample reader.                                                  |

The welcome page keeps a slot for a "How do you like to navigate?" step (left sidebar or top
nav). It stays hidden while `NAV_CHOICE_ENABLED` (`packages/auth/src/navigationChoice.ts`) is
`false`, until the top nav is designed and built.

For example <http://localhost:5173/sign-in?gate=G6> or
<http://localhost:5174/admin/sign-in?gate=G4>. The forms on a previewed gate still post to the
gateway, which refuses the sample references. The preview comes and goes with the dev quick
login's build allowance (`packages/vite-config`'s `chooseDevelopmentQuickLogin`): the dev server
always has it, a build only with `DEV_QUICK_LOGIN=true`, and a release build aliases in
`NoDevelopmentGatePreview.server.ts`, so `?gate=` does nothing there.
`pnpm run check:no-dev-quick-login-leak` fails if the preview's marker reaches a release build.

## Tests

Vitest, colocated `*.test.ts`/`*.test.tsx` files, Testing Library for components. No
Playwright or other end-to-end suite in this version; UI behaviour is covered through unit and
component tests against public component and route APIs.
