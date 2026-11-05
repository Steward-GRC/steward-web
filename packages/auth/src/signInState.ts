// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/** A passkey challenge for the browser: `flowId` only for a passkey sign-in, not a second factor. */
export interface PasskeyChallenge {
  passkey: { flowId?: string; optionsJson: string };
}

/** One dev quick-login account as the page sees it: never a password. */
export interface QuickLoginUser {
  label: string;
  note?: string;
  username: string;
}

/**
 * What this gateway's sign-in offers besides the password (its `GET /auth/config`): the
 * password reset, passkey sign-in, and SSO once an organisation has finished setting it up. A
 * gateway that can't say offers none of them.
 */
export interface SignInCapabilities {
  passkey: boolean;
  passwordReset: boolean;
  sso: boolean;
}

export const NO_CAPABILITIES: SignInCapabilities = {
  passkey: false,
  passwordReset: false,
  sso: false,
};

/** A second factor the gateway can offer for a parked sign-in. */
export type SignInFactor = "email" | "passkey" | "totp";

export interface SignInLoaderData {
  capabilities: SignInCapabilities;
  next: string;
  /** The frame id a dev-only `?gate=` preview is showing; never set in a release build. */
  preview?: string;
  /** The dev quick login's accounts; always empty outside a local build that allows it. */
  quickLoginUsers: QuickLoginUser[];
  state: SignInState;
}

/**
 * Every state the sign-in screen can be in. The server decides it (`signIn.server.ts`) and the
 * page only renders it; a parked sign-in's `pendingId` is the gateway's own opaque reference
 * and carries no credential.
 */
export type SignInState =
  | {
      /** G6's "Choose a method": shown once, right after the password, when there are several. */
      choose?: boolean;
      emailSent?: "sent" | "wait";
      factor: "email" | "totp";
      factors: SignInFactor[];
      pendingId: string;
      problem?: "send" | "unavailable" | "wrong";
      /** The masked address an emailed code goes to ("e•••@example.org"), when it is known. */
      sentTo?: string;
      view: "code";
    }
  | {
      email?: string;
      problem?: "code" | "missing" | "unavailable";
      step: "confirm" | "request";
      view: "reset";
    }
  | {
      identifier?: string;
      notice?: "passwordReset";
      problem?:
        | "expired"
        | "invalid"
        | "missing"
        | "passkey"
        | "sso"
        | "ssoNotActive"
        | "throttled"
        | "unavailable";
      view: "password";
    }
  | {
      identifier?: string;
      problem?: "missing" | "unavailable";
      view: "sso";
    }
  | {
      otpauthUri: string;
      pendingId: string;
      problem?: "unavailable" | "wrong";
      secret: string;
      view: "enrol";
    }
  | { view: "signing-in" };
