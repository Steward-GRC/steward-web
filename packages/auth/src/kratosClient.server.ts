// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { KratosLoginFlow } from "./kratos";

export interface KratosConfig {
  /** `process.env.KRATOS_PUBLIC_URL`; never the admin API, which carries no session cookie. */
  publicUrl: string;
}

export class KratosError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "KratosError";
    this.status = status;
  }
}

const defaultConfig = (): KratosConfig => ({
  publicUrl: process.env.KRATOS_PUBLIC_URL ?? "http://localhost:4433",
});

/**
 * Starts (or resumes) the browser login flow and returns its current form. `Accept:
 * application/json` keeps Kratos's browser-flow strategy (cookie-based, unlike the API flow)
 * but answers with the flow document instead of a redirect, which is what a server-rendered
 * sign-in page needs.
 */
export const fetchLoginFlow = async (
  cookie?: string,
  config: KratosConfig = defaultConfig(),
): Promise<{ flow: KratosLoginFlow; setCookie: string[] }> => {
  const response = await fetch(`${config.publicUrl}/self-service/login/browser`, {
    headers: { accept: "application/json", ...(cookie ? { cookie } : {}) },
  });
  if (!response.ok) {
    throw new KratosError(`login flow fetch failed with ${response.status}`, response.status);
  }
  const flow = (await response.json()) as KratosLoginFlow;
  return { flow, setCookie: response.headers.getSetCookie() };
};

export type SubmitLoginResult =
  { flow: KratosLoginFlow; status: "failed" } | { setCookie: string[]; status: "succeeded" };

/**
 * Submits the flow's own action with the chosen method's fields. `flow.ui.action` is already
 * the absolute URL Kratos names for this submission (its own public origin), so it is used
 * as-is. A 400 means the flow itself reports the failure (wrong password, an expired code):
 * return its updated form so the page can show the same error messages Kratos renders
 * itself. Anything else is unexpected.
 */
export const submitLogin = async (
  flow: KratosLoginFlow,
  body: Readonly<Record<string, string>>,
  cookie?: string,
): Promise<SubmitLoginResult> => {
  const response = await fetch(flow.ui.action, {
    body: JSON.stringify(body),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    method: flow.ui.method,
  });

  if (response.ok) return { setCookie: response.headers.getSetCookie(), status: "succeeded" };
  if (response.status === 400) {
    return { flow: (await response.json()) as KratosLoginFlow, status: "failed" };
  }
  throw new KratosError(`login submit failed with ${response.status}`, response.status);
};
