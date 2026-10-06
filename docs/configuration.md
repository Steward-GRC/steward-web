# Configuration

## Build arguments (`Dockerfile`)

| Argument | Default | Used for |
|---|---|---|
| `APP` | none (required) | Which app's build (`staff` or `admin`) ships in the image. Becomes the runtime `APP` variable below. |
| `VERSION` | `dev` | Stamped into the server's health headers and, via `packages/vite-config`'s `buildInfoDefines`, into the client bundle as `__STEWARD_VERSION__`. |
| `COMMIT` | `unknown` | Same as `VERSION`, as `__STEWARD_COMMIT__`. |
| `DEV_UI_ISSUE_COPY` | `false` | Becomes the build-time `STEWARD_DEV_UI_ISSUE_COPY_BUILD` variable below; `true` only for a local dev image. See "The dev UI-issue button" in `docs/development.md`. |

An unstamped or blank `VERSION`/`COMMIT` falls back to `dev`/`unknown`; nothing fails the
build.

## Runtime environment variables (`server/`)

| Variable | Default | Used for |
|---|---|---|
| `APP` | none (required) | `staff` or `admin`; selects which app's build output and routes the server serves. Set by the Dockerfile; a direct run (outside the image) must set it too. |
| `PORT` | `3000` | The port the Node server listens on. |
| `GATEWAY_URL` | `http://localhost:8080/query` | The steward-gateway GraphQL endpoint for every loader, action, the `/query` proxy and the `/collab/ws` proxy, and the `/readyz` ping. |
| `VERSION` | `dev` | Read back into the `Steward-Version` health header (see `docs/runbook.md`). |
| `COMMIT` | `unknown` | Read back into the `Steward-Commit` health header. |
| `STEWARD_DEV_UI_ISSUE_COPY` | unset | The root loader's gate for the dev UI-issue button: `true` renders it, anything else doesn't. Only takes effect on a build also made with `DEV_UI_ISSUE_COPY=true`; see "The dev UI-issue button" in `docs/development.md`. |

## Other runtime variables (read by individual packages)

| Variable | Default | Used for |
|---|---|---|
| `KRATOS_PUBLIC_URL` | `http://localhost:4433` | `packages/auth`'s server-side session check. Kratos's public API only; the admin API carries no session cookie and is never used here. |

## Build-time only (never set on a live build)

| Variable | Default | Used for |
|---|---|---|
| `STEWARD_MOCK` | unset | Guards against a live build being talked into mock mode by accident: if it is set to anything but `false` or empty on a non-mock build, the build refuses. Mock mode is chosen only by `--mode mock` (`pnpm run build:mock` / `pnpm run dev:mock`), never by this variable. |
| `STEWARD_DEV_UI_ISSUE_COPY_BUILD` | unset | Set from the `DEV_UI_ISSUE_COPY` build argument. `packages/vite-config`'s `chooseDevUiIssueButton` aliases the real dev UI-issue button in only when this is `"true"`; any other value (including unset) aliases in a no-op, so the button's code never reaches a build that didn't ask for it. |

## Configuration that is not an environment variable

- The gateway schema pin (`STEWARD_GATEWAY_REF`, `STEWARD_GATEWAY_SCHEMA_SHA256`) lives in
  `packages/api-client/schema-refs.env`, a committed file, not a runtime setting. See
  "Calling other services" in `docs/runbook.md`.
