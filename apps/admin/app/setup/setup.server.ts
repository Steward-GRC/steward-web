// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/**
 * The first-run bootstrap endpoints. The gateway exposes two unauthenticated REST
 * endpoints on the same origin as `/query`:
 *
 *   GET  /setup/state      -> { needsSetup: boolean }
 *   POST /setup/bootstrap  -> 200 { userId, sso? } / 400 / 403 / 409 / 503
 *
 * Like the Kratos client in `@steward-web/auth` (`kratosClient.server.ts`), this never goes
 * through the mock/live edge swap: setup runs before any account (mock or real) exists, so
 * it always talks to a real gateway, same as sign-in always talks to a real Kratos.
 */

export interface SetupGatewayConfig {
  /** The gateway's origin. `GATEWAY_URL` points at `/query`; setup's endpoints are REST,
   *  mounted on that same gateway, so the default strips that suffix. */
  baseUrl: string;
}

const defaultConfig = (): SetupGatewayConfig => {
  const gatewayUrl = process.env.GATEWAY_URL ?? "http://localhost:8080/query";
  return { baseUrl: gatewayUrl.replace(/\/query$/, "") };
};

export interface BootstrapInput {
  email: string;
  name: string;
  password: string;
  setupToken: string;
  sso?: SsoBootstrapInput;
  username: string;
}

export interface BootstrapResult {
  error?: string;
  ok: boolean;
  sso?: SsoBootstrapResult;
  status: number;
  userId?: string;
}

export type SetupState = { needsSetup: boolean };

/** OPTIONAL Day-0 SSO block sent with the bootstrap request. */
export interface SsoBootstrapInput {
  config: Record<string, string>;
  displayName?: string;
  domain: string;
  orgName: string;
  protocol: "oidc" | "saml";
  secretRef?: string;
}

/** The `sso` sub-object echoed back on a successful bootstrap. */
export interface SsoBootstrapResult {
  activationDeferred?: boolean;
  domainVerification?: {
    dnsRecordName: string;
    dnsRecordValue: string;
    instructions: string;
    token: string;
  };
  error?: string;
  organization?: {
    displayName?: string;
    domain: string;
    enabled: boolean;
    orgName: string;
    protocol: string;
    verified: boolean;
  };
}

/** Check whether the system still needs its first-run bootstrap. Any error (network,
 *  non-2xx) is treated as "not needing setup" so the app doesn't get stuck on it. */
export const fetchSetupState = async (
  config: SetupGatewayConfig = defaultConfig(),
): Promise<SetupState> => {
  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}/setup/state`);
  } catch {
    return { needsSetup: false };
  }
  if (!response.ok) return { needsSetup: false };
  return (await response.json()) as SetupState;
};

const STATUS_MESSAGES: Record<number, string> = {
  400: "All fields are required.",
  403: "Invalid setup token.",
  409: "Already set up.",
  503: "Setup is not enabled.",
};

/** Bootstrap the root user (and optionally provision Day-0 SSO). Maps gateway status codes
 *  to user-facing messages. */
export const bootstrapRoot = async (
  input: BootstrapInput,
  config: SetupGatewayConfig = defaultConfig(),
): Promise<BootstrapResult> => {
  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}/setup/bootstrap`, {
      body: JSON.stringify(input),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
  } catch {
    return { error: "Can't reach the gateway.", ok: false, status: 0 };
  }

  if (response.ok) {
    // The body carries { userId, sso? }. Parse best-effort: a body-shape change must never
    // turn a successful bootstrap into a failure.
    let userId: string | undefined;
    let sso: SsoBootstrapResult | undefined;
    try {
      const body = (await response.json()) as { sso?: SsoBootstrapResult; userId?: string };
      userId = body.userId;
      sso = body.sso;
    } catch {
      /* tolerate an empty/unexpected body */
    }
    return { ok: true, sso, status: response.status, userId };
  }

  const message = STATUS_MESSAGES[response.status] ?? `Unexpected error (HTTP ${response.status}).`;
  return { error: message, ok: false, status: response.status };
};
