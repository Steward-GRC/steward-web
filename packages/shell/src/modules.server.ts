// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * Compliance reporting is an install setting, off unless `STEWARD_REPORTING=true`. It's off for
 * rc.1 (decision 5-screens.s14): the case pages wait for their v0.2.0 redesign. Both apps read
 * it: staff for the case pages and the sidebar's Compliance section, admin for its Compliance
 * group. Ethics is a v0.2.0 module with no switch yet, so it is always off.
 */
export const reportingEnabled = (): boolean => process.env.STEWARD_REPORTING === "true";
