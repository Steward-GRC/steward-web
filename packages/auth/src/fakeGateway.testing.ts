// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A real HTTP server that keeps steward-gateway's session contract (`internal/bff`): POST
// /auth/login mints the `steward_sid` cookie and a CSRF token, or parks the sign-in for a
// second factor; GET /auth/session reports the token; POST /query answers only with the
// cookie AND the matching `X-CSRF-Token` (401 without a session, 403 on a CSRF mismatch);
// POST /auth/logout drops the session and clears the cookie. The sign-in helpers answer as the
// gateway's do: GET /auth/config, POST /auth/discover, the password reset by emailed code and
// passkey sign-in (`internal/passwordreset`, `internal/bff`). Tests only.
import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

export interface FakeAccount {
  /** A disabled account: the right password answers 403 `account_disabled`. */
  disabled?: boolean;
  /** The factors a challenge offers; ["totp", "email"] by default. */
  factors?: string[];
  /** "challenge": a TOTP code is owed; "enrol": no factor yet, enrolment is owed. */
  mfa?: "challenge" | "enrol";
  password: string;
  userId: string;
  username: string;
}

/** The one code the fake accepts for any second-factor step. */
export const FAKE_CODE = "123456";

/** The one passkey assertion the fake accepts, for sign-in and as a second factor. */
export const FAKE_CREDENTIAL = '{"id":"cred-1","type":"public-key"}';

/** The username the fake's passkey signs in as. */
export const FAKE_PASSKEY_USER = "passkey.sample";

/** The password the fake answers 429 for, as the gateway's rate limit does. */
export const THROTTLED_PASSWORD = "too-many";

export interface FakeGateway {
  close: () => Promise<void>;
  /** The `/query` URL, as `GATEWAY_URL` would name it. */
  queryUrl: string;
  /** Every request seen, for asserting what reached the gateway. */
  requests: {
    headers: IncomingMessage["headers"];
    method: string;
    path: string;
    /** The query string, without its "?". */
    query: string;
  }[];
  sessions: Map<string, { csrf: string; userId: string }>;
}

export interface FakeGatewayOptions {
  /** GET /auth/config's answer; undefined answers 404, like a gateway without the helpers. */
  authConfig?: Record<string, unknown>;
  /** POST /auth/discover: the identifiers that sign in through SSO, with their connection. */
  sso?: Record<string, string>;
}

const readBody = async (request: IncomingMessage): Promise<Record<string, unknown>> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString();
  return text ? (JSON.parse(text) as Record<string, unknown>) : {};
};

const json = (response: ServerResponse, status: number, body: unknown, cookie?: string) => {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (cookie) headers["set-cookie"] = cookie;
  response.writeHead(status, headers);
  response.end(JSON.stringify(body));
};

const sidOf = (request: IncomingMessage): string | undefined => {
  for (const part of (request.headers.cookie ?? "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === "steward_sid") return rest.join("=");
  }
  return undefined;
};

export const startFakeGateway = async (
  accounts: FakeAccount[],
  options: FakeGatewayOptions = {},
): Promise<FakeGateway> => {
  const sessions = new Map<string, { csrf: string; userId: string }>();
  const pending = new Map<string, { account: FakeAccount; enrol: boolean }>();
  const requests: FakeGateway["requests"] = [];

  const issue = (response: ServerResponse, userId: string) => {
    const sid = randomUUID();
    const csrf = randomUUID();
    sessions.set(sid, { csrf, userId });
    json(
      response,
      200,
      { csrfToken: csrf },
      `steward_sid=${sid}; Path=/; Max-Age=28800; HttpOnly; SameSite=Lax`,
    );
  };

  const server: Server = createServer((request, response) => {
    void (async () => {
      const path = (request.url ?? "/").split("?", 1)[0] ?? "/";
      const method = request.method ?? "GET";
      const query = (request.url ?? "").split("?").slice(1).join("?");
      requests.push({ headers: request.headers, method, path, query });
      const body = method === "POST" ? await readBody(request) : {};

      if (method === "POST" && path === "/auth/login") {
        if (body.password === THROTTLED_PASSWORD)
          return json(response, 429, { error: "rate_limited" });
        const account = accounts.find(
          (a) => a.username === body.username && a.password === body.password,
        );
        if (!account) return json(response, 401, { error: "invalid_credentials" });
        if (account.disabled) return json(response, 403, { error: "account_disabled" });
        if (account.mfa) {
          const pendingId = randomUUID();
          pending.set(pendingId, { account, enrol: account.mfa === "enrol" });
          return json(
            response,
            200,
            account.mfa === "enrol"
              ? { enrollmentRequired: true, mfaRequired: true, pendingId }
              : { factors: account.factors ?? ["totp", "email"], mfaRequired: true, pendingId },
          );
        }
        return issue(response, account.userId);
      }

      if (method === "POST" && path === "/auth/mfa/otp/send") {
        if (!pending.has(String(body.pendingId)))
          return json(response, 401, { error: "invalid_pending" });
        return json(response, 200, { ok: true });
      }

      if (method === "POST" && path === "/auth/mfa/enroll/totp/begin") {
        const parked = pending.get(String(body.pendingId));
        if (!parked?.enrol) return json(response, 400, { error: "invalid_request" });
        return json(response, 200, {
          otpauthUri: "otpauth://totp/Steward:sample",
          secret: "ABCD****",
        });
      }

      // The gateway's SSO start as a pass-through, the way the mock runs it: the identifier's
      // account signs straight in and lands on /home, or is parked for its second factor and
      // sent to /login, as the gateway's callback sends people back.
      if (method === "GET" && path === "/auth/sso/start") {
        const identifier = new URLSearchParams(query).get("identifier");
        const account = accounts.find((a) => a.username === identifier);
        if (!account) {
          response.writeHead(302, { location: "/login?error=sso" });
          return response.end();
        }
        if (account.mfa === "challenge") {
          const pendingId = randomUUID();
          pending.set(pendingId, { account, enrol: false });
          const factors = (account.factors ?? ["totp", "email"]).join(",");
          response.writeHead(302, {
            location: `/login?pendingMfa=${pendingId}&mfaFactors=${encodeURIComponent(factors)}`,
          });
          return response.end();
        }
        const sid = randomUUID();
        sessions.set(sid, { csrf: randomUUID(), userId: account.userId });
        response.writeHead(302, {
          location: "/home",
          "set-cookie": `steward_sid=${sid}; Path=/; Max-Age=28800; HttpOnly; SameSite=Lax`,
        });
        return response.end();
      }

      if (method === "GET" && path === "/auth/config") {
        if (!options.authConfig) return json(response, 404, { error: "not_found" });
        return json(response, 200, options.authConfig);
      }

      if (method === "POST" && path === "/auth/discover") {
        const identifier = String(body.identifier ?? "");
        if (!identifier) return json(response, 400, { error: "invalid_request" });
        const alias = options.sso?.[identifier];
        return json(
          response,
          200,
          alias
            ? { allowLocal: false, connectionAlias: alias, method: "sso" }
            : { allowLocal: true, connectionAlias: "", method: "local" },
        );
      }

      if (method === "POST" && path === "/auth/password-reset/request") {
        if (!body.email) return json(response, 400, { error: "Enter your email address." });
        return json(response, 200, { ok: true });
      }

      if (method === "POST" && path === "/auth/password-reset/confirm") {
        if (body.code !== FAKE_CODE)
          return json(response, 400, { error: "That code is invalid or has expired." });
        return json(response, 200, { ok: true });
      }

      if (method === "POST" && path === "/auth/passkey/login/begin") {
        return json(response, 200, {
          flowId: "flow-1",
          optionsJson: '{"publicKey":{"challenge":"Y2hhbGxlbmdl"}}',
        });
      }

      if (method === "POST" && path === "/auth/passkey/login/finish") {
        if (body.flowId !== "flow-1") return json(response, 400, { error: "invalid_request" });
        if (body.credentialJson !== FAKE_CREDENTIAL)
          return json(response, 401, { error: "invalid_credentials" });
        const account = accounts.find((a) => a.username === FAKE_PASSKEY_USER);
        return issue(response, account?.userId ?? "");
      }

      if (method === "POST" && path === "/auth/mfa/webauthn/begin") {
        if (!pending.has(String(body.pendingId)))
          return json(response, 401, { error: "invalid_pending" });
        return json(response, 200, { optionsJson: '{"publicKey":{"challenge":"bWZh"}}' });
      }

      if (method === "POST" && path === "/auth/mfa/verify" && body.kind === "passkey") {
        const parked = pending.get(String(body.pendingId));
        if (!parked) return json(response, 401, { error: "invalid_pending" });
        if (body.credentialJson !== FAKE_CREDENTIAL)
          return json(response, 401, { error: "invalid_code" });
        pending.delete(String(body.pendingId));
        return issue(response, parked.account.userId);
      }

      const finishing =
        (path === "/auth/mfa/verify" || path === "/auth/mfa/enroll/totp/confirm") &&
        method === "POST";
      if (finishing) {
        const parked = pending.get(String(body.pendingId));
        if (!parked) return json(response, 401, { error: "invalid_pending" });
        if (body.code !== FAKE_CODE) return json(response, 401, { error: "invalid_code" });
        pending.delete(String(body.pendingId));
        return issue(response, parked.account.userId);
      }

      if (method === "GET" && path === "/auth/session") {
        const live = sessions.get(sidOf(request) ?? "");
        return json(
          response,
          200,
          live ? { authenticated: true, csrfToken: live.csrf } : { authenticated: false },
        );
      }

      if (method === "POST" && path === "/auth/logout") {
        sessions.delete(sidOf(request) ?? "");
        return json(
          response,
          200,
          { status: "logged_out" },
          "steward_sid=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
        );
      }

      if (method === "POST" && path === "/query") {
        const live = sessions.get(sidOf(request) ?? "");
        if (!live) return json(response, 401, { error: "unauthorized" });
        if (request.headers["x-csrf-token"] !== live.csrf)
          return json(response, 403, { error: "csrf" });
        const account = accounts.find((a) => a.userId === live.userId);
        return json(response, 200, {
          data: {
            me: {
              email: `${account?.username ?? ""}@example.org`,
              firstName: "",
              lastName: "",
              managedGroupIds: [],
              name: account?.username ?? "",
              permissions: ["policy.read"],
              roles: ["staff"],
              scopes: { author: [] },
              userId: live.userId,
              username: account?.username ?? "",
            },
          },
        });
      }

      json(response, 404, { error: "not_found" });
    })();
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const address = server.address();
  if (address == undefined || typeof address === "string") throw new Error("no port");

  return {
    close: () => new Promise((resolve) => server.close(() => resolve())),
    queryUrl: `http://127.0.0.1:${address.port}/query`,
    requests,
    sessions,
  };
};
