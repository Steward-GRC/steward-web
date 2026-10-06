// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Identity } from "./identity";

/** The one authz primitive: every permission check in either app reduces to this. */
export const can = (identity: Identity, permission: string): boolean =>
  identity.permissions.has(permission);
