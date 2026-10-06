// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Turning the token's `wsUrl` into something `new WebSocket()` accepts.
//
// `issueCollabToken` returns a SAME-ORIGIN RELATIVE path — "/collab/ws/<draftId>" — on
// purpose, so one container image works unchanged in dev, qa and prod (steward-collab's
// `WsBase` defaults to empty). The gateway serves its collab proxy at
// `GET /collab/ws/{draftID}` on the web app's own origin (through this app's own server-side
// proxy when the gateway is not reachable from the browser directly), so a relative path is
// correct.
//
// The WebSocket constructor does NOT accept a relative URL — it requires an absolute ws:/wss:
// URL. So this resolves it against the current page and maps the scheme: http -> ws,
// https -> wss. Getting this wrong is invisible in dev (where both are http) and breaks only
// in a TLS-terminated deployment, so it is worth its own tested module.
//
// The token rides as `?token=` because that is the only credential channel a browser has on an
// upgrade — `new WebSocket()` cannot set an Authorization header. The proxy strips it from the
// query and re-sends it upstream as a Bearer header, so the JWT never reaches an access log.

/** Split a y-websocket server URL into the parts `WebsocketProvider` wants. */
export interface ProviderTarget {
  /** The room name — the last path segment, i.e. the draft id. */
  room: string;
  /** Everything before the room, e.g. "wss://app.example/collab/ws". */
  serverUrl: string;
}

/**
 * Resolve a possibly-relative `wsUrl` against `base` (normally `globalThis.location.href`) and
 * return an absolute ws:/wss: URL.
 *
 * An absolute ws:/wss: url is passed through untouched, so a deployment that puts collab on a
 * different origin (an absolute `wsUrl`) keeps working.
 */
export const absoluteWsUrl = (wsUrl: string, base: string): string => {
  const resolved = new URL(wsUrl, base);
  switch (resolved.protocol) {
    case "http:": {
      resolved.protocol = "ws:";
      break;
    }
    case "https:": {
      resolved.protocol = "wss:";
      break;
    }
    default: {
      // Already ws:/wss: (an explicit absolute wsUrl), or something that should not be
      // silently rewritten. Leave it alone and let the constructor complain.
      break;
    }
  }
  return resolved.toString();
};

/**
 * Split an absolute ws url into (serverUrl, room) for `WebsocketProvider`, which builds its
 * own url as `serverUrl + "/" + room + "?" + params`.
 *
 * The pieces are handed over rather than a finished url, because the provider re-derives the
 * url on EVERY reconnect (it is a getter) — which is exactly the hook that lets a re-minted
 * token take effect: mutate `provider.params.token` and the next connect carries the new one.
 *
 * Any query string on the input is dropped: the token is supplied through `params`, not baked
 * into the url.
 */
export const providerTarget = (absoluteUrl: string): ProviderTarget => {
  const parsed = new URL(absoluteUrl);
  parsed.search = "";
  parsed.hash = "";
  // Split on the PATH, not the whole url string: a host-only url like "wss://host/" has no
  // room, and a naive lastIndexOf("/") would happily return the second slash of the scheme's
  // "//" and hand back a room of "host" with a serverUrl of "wss:/".
  const segments = parsed.pathname.split("/").filter(Boolean);
  const room = segments.pop();
  if (room === undefined) {
    throw new Error(`collab ws url has no room segment: ${absoluteUrl}`);
  }
  const base = segments.length > 0 ? `/${segments.join("/")}` : "";
  return { room, serverUrl: `${parsed.origin}${base}` };
};

/**
 * The whole resolution in one step: a relative-or-absolute `wsUrl` plus the current page, out
 * come the two pieces `WebsocketProvider` needs.
 */
export const resolveProviderTarget = (wsUrl: string, base: string): ProviderTarget =>
  providerTarget(absoluteWsUrl(wsUrl, base));
