// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/** Whether this Steward is set up, as far as the gateway can say. */
export type InstanceState = "needsSetup" | "ready" | "unknown";

/** What each app's `/resources/status` answers, for the gates that check again by themselves. */
export interface InstanceStatus {
  instance: InstanceState;
  /** The site's maintenance lockdown (globalSettings.maintenance.enabled). */
  maintenance: boolean;
}

/** Where each app serves InstanceStatus, under its own basename. */
export const STATUS_PATH = "/resources/status";
