// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Failure } from "@steward-web/ui";

/** The governance dialogs the Actions menu opens. */
export type GovernanceDialog =
  | "changeAuthor"
  | "delete"
  | "exportPdf"
  | "magicLinks"
  | "move"
  | "retire";

/** What the admin reader's governance actions answer (A11). */
export type GovernanceResult =
  | { failure: Failure; intent: string; ok: false }
  | { intent: "changeAuthor" | "delete" | "retire"; ok: true }
  | ({ intent: "createMagicLink"; ok: true } & IssuedLink)
  | { intent: "exportPdf"; jobId: string; ok: true }
  | { intent: "move"; number: string; ok: true }
  | { intent: "pdfLink"; ok: true; pending: false; signedUrl: string }
  | { intent: "pdfLink"; ok: true; pending: true }
  | { intent: "recordPrint"; ok: true }
  | ({ intent: "reissueMagicLink"; ok: true; replaced: string } & IssuedLink)
  | { intent: "revokeMagicLink"; ok: true; token: string };

/** A magic link the governance action issued (D31). */
export interface IssuedLink {
  expiresAt: string;
  token: string;
  /** The full share link, on the staff app. */
  url: string;
}
