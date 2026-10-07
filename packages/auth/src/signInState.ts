// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/** A second factor the gateway can offer for a parked sign-in. */
export type SignInFactor = "email" | "passkey" | "totp";

export interface SignInLoaderData {
  next: string;
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
