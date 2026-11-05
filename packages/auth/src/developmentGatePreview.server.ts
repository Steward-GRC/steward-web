// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { SignInCapabilities, SignInState } from "./signInState";
import type { WelcomePerson } from "./welcomeState";

/**
 * The dev gate preview: `?gate=<frame id>` on the sign-in page shows that gate with sample
 * data, for the steps the mock gateway can't reach by itself (the SSO identifier, the password
 * reset, the passkey options and the error states), so each frame can be checked and
 * screenshotted. `@steward-web/vite-config`'s `chooseDevelopmentQuickLogin` aliases
 * `@steward-web/dev-gate-preview.server` to this file only for the dev server or a build made
 * with `DEV_QUICK_LOGIN=true`; every other build gets `NoDevelopmentGatePreview.server.ts`, so
 * none of this reaches a release image. The forms on a previewed gate still post to the real
 * gateway, which refuses the sample references.
 */

/** The release-build leak check looks for this; it must never appear in a release bundle. */
export const DEV_GATE_PREVIEW_MARKER = "steward-dev-gate-preview";

export interface SignInPreview {
  capabilities: SignInCapabilities;
  /** The frame id being previewed. */
  gate: string;
  /** Always DEV_GATE_PREVIEW_MARKER. */
  marker: string;
  state: SignInState;
}

const EVERYTHING: SignInCapabilities = { passkey: true, passwordReset: true, sso: true };
const PENDING = "dev-preview-pending";

const SIGN_IN_GATES: Readonly<Record<string, SignInState>> = {
  G3: { identifier: "alice@example.org", problem: "invalid", view: "password" },
  G3m: { identifier: "alice@example.org", view: "password" },
  G4: { view: "sso" },
  G6: {
    choose: true,
    factor: "totp",
    factors: ["totp", "email", "passkey"],
    pendingId: PENDING,
    sentTo: "a•••@example.org",
    view: "code",
  },
  "G6-code": {
    emailSent: "sent",
    factor: "email",
    factors: ["totp", "email"],
    pendingId: PENDING,
    problem: "wrong",
    sentTo: "a•••@example.org",
    view: "code",
  },
  G7: {
    otpauthUri: "otpauth://totp/Steward:alice@example.org?issuer=Steward&secret=JBSWY3DPEHPK3PXP",
    pendingId: PENDING,
    secret: "JBSW************",
    view: "enrol",
  },
  G8: { step: "request", view: "reset" },
  "G8-code": { email: "alice@example.org", step: "confirm", view: "reset" },
  G9: { view: "signing-in" },
};

/** G3m draws SSO turned off, as it is until an organisation has finished setting it up. */
const NO_SSO_YET: SignInCapabilities = { ...EVERYTHING, sso: false };

/**
 * The sign-in gate `?gate=` names, with every sign-in option on (SSO off for G3m); undefined
 * for anything else.
 */
export const signInPreview = (url: URL): SignInPreview | undefined => {
  const gate = url.searchParams.get("gate") ?? "";
  const state = Object.hasOwn(SIGN_IN_GATES, gate) ? SIGN_IN_GATES[gate] : undefined;
  if (!state) return undefined;
  const capabilities = gate === "G3m" ? NO_SSO_YET : EVERYTHING;
  return { capabilities, gate, marker: DEV_GATE_PREVIEW_MARKER, state };
};

/** The status gates `?gate=` can hold on screen, wherever they render. */
const STATUS_GATES = new Set(["G1", "G10", "G11", "G12", "G2"]);

/** The status gate `?gate=` names (G1, G2, G10, G11 or G12); undefined for anything else. */
export const statusGatePreview = (url: URL): string | undefined => {
  const gate = url.searchParams.get("gate") ?? "";
  return STATUS_GATES.has(gate) ? gate : undefined;
};

/**
 * G10's sample person: a first SSO sign-in whose identity provider sent the email address but
 * no names, so the names start empty and the email is read-only.
 */
export const welcomePreview = (url: URL): undefined | WelcomePerson =>
  url.searchParams.get("gate") === "G10"
    ? { email: "erin@example.org", firstName: "", lastName: "", username: "erin" }
    : undefined;
