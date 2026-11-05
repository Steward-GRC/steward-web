// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/**
 * The path the admin app is served under (decision: the admin app is the staff app's port plus
 * this prefix). React Router's config and sign-in both read it, so they can't drift apart.
 */
export const BASENAME = "/admin";
