// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/** One dev quick-login account as the page sees it: never a password. */
export interface QuickLoginUser {
  label: string;
  note?: string;
  username: string;
}

/** A second factor the gateway can offer for a parked sign-in. */
export type SignInFactor = "email" | "passkey" | "totp";

export interface SignInLoaderData {
  next: string;
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
      emailSent?: "sent" | "wait";
      factor: "email" | "totp";
      factors: SignInFactor[];
      pendingId: string;
      problem?: "send" | "unavailable" | "wrong";
      view: "code";
    }
  | {
      identifier?: string;
      problem?: "expired" | "invalid" | "missing" | "unavailable";
      view: "password";
    }
  | {
      otpauthUri: string;
      pendingId: string;
      problem?: "unavailable" | "wrong";
      secret: string;
      view: "enrol";
    };
