// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/** What a shared link opens to (G16). "unavailable" until the gateway can look links up. */
export type SharedLinkState =
  | { expiredAt: string; view: "expired" }
  | { policy: SharedPolicy; view: "policy" }
  | { view: "email" }
  | { view: "revoked" }
  | { view: "unavailable" };

/** One pinned policy version, as a shared link shows it (G16). */
export interface SharedPolicy {
  /** The category path, "Workplace · Facilities". */
  category: string;
  /** When the link stops working, as an ISO date. */
  expiresAt: string;
  number: string;
  sections: readonly { body: string; heading: string }[];
  /** The display name of whoever shared it. */
  sharedBy: string;
  title: string;
  version: string;
}

/** How a remote SSO test ended (G18r), from its result page's `test` parameter. */
export type SsoTestOutcome = "expired" | "failed" | "passed";

/** What a remote SSO test link opens to (G18). "unavailable" until the gateway can look it up. */
export type SsoTestState =
  | {
      domain: string;
      organisation: string;
      requester: string;
      token: string;
      validHours: number;
      view: "landing";
    }
  | { view: "expired" }
  | { view: "unavailable" };
