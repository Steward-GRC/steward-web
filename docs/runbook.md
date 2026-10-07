# Runbook

## Health probes

Each app's server (`server/src/index.ts`) answers two paths, both carrying the build info
(see below) as `Steward-Version` and `Steward-Commit` response headers. There is no plain
`/health` or `/healthz`.

- **`/livez`** — the process only. Always `200` while the process is up; never checks a
  dependency. A Kubernetes liveness probe points here, never at `/readyz`: a dependency
  outage must not restart the pod.
- **`/readyz`** — the gateway, the server's one required dependency, checked with a 1-second
  ping and cached for a few seconds so a probe hitting `/readyz` every second doesn't load the
  gateway on every call. `200` while the gateway answers, `503` while it doesn't, and it
  recovers on its own once the cache window passes and the gateway answers again. A
  Kubernetes readiness probe points here.

  The body:

  ```json
  {
    "status": "ok",
    "dependencies": {
      "gateway": {
        "state": "ok",
        "required": true,
        "version": "unknown",
        "lastChecked": "2026-10-06T12:00:00.000Z"
      }
    }
  }
  ```

  `state` is `ok` or `down`; a down dependency also carries `lastError`, a short error class
  (for example `unreachable`), never an address. `version` is always `unknown` here: this
  ping is a cheap, unauthenticated reachability check with no way to read the gateway's
  build info back. The gateway's and every other Steward service's actual version and
  commit are available, once signed in, through the shell's Copy diagnostics (the "About
  and diagnostics" entry, and the same button on every error, refusal and warning
  treatment) — it calls the gateway's authenticated `diagnostics` query instead.

## Reading the build info

`VERSION` and `COMMIT` (see `docs/configuration.md`) are stamped in two places from the same
build arguments:

- the server's `Steward-Version` / `Steward-Commit` response headers, on both `/livez` and
  `/readyz`;
- the client bundle, as `__STEWARD_VERSION__` / `__STEWARD_COMMIT__`, read by
  `packages/shell`'s Copy diagnostics report and the About and diagnostics dialog.

An unstamped build (no `VERSION`/`COMMIT` build argument) reports `dev` and `unknown` in both
places, never a build failure.

```bash
curl -si http://localhost:3000/livez | grep -i steward-
```

## Calling other services

The only other service this repo's servers and apps call directly is steward-gateway, over
`GATEWAY_URL` (see `docs/configuration.md`). The GraphQL schema that call is typed against is
pinned to a specific steward-gateway commit, not fetched live: see "The codegen step" in
`docs/development.md` for how the pin works and how to move it forward.

Sign-in goes through the gateway too. `packages/auth`'s sign-in action posts the credentials
to the gateway's `POST /auth/login` (and `POST /auth/mfa/verify` or the enrolment routes when it
asks for a second factor) and relays the gateway's own HttpOnly session cookie, `steward_sid`,
to the browser. The apps never talk to Kratos. Every gateway call made for a signed-in user
carries that cookie and the session's CSRF token in `X-CSRF-Token`, which the server reads from
`GET /auth/session` (`packages/api-client/src/gatewaySession.ts`, cached for 30 seconds per
session); the browser never holds the token. Sign-out (`POST /sign-out`, from the account menu)
calls the gateway's `POST /auth/logout` and clears the cookie.

The public edge must set `X-Steward-Edge: public` on requests it forwards: the sign-in action
passes that header on to `/auth/login`, where the gateway's `MFA_ENFORCE=edge` rule reads it.

Symptom: every page sends you back to sign-in right after a successful sign-in. Check that the
browser holds a `steward_sid` cookie for the app's origin (a `Secure` cookie needs HTTPS, so set
the gateway's `COOKIE_INSECURE` only for a plain-HTTP local run) and that `GATEWAY_URL` reaches
the same gateway that issued it.
