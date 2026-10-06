// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * The identity model both apps share.
 *
 * `Me` is the gateway's wire shape (see `@steward-web/api-client`'s `Me`). `Identity` is the
 * in-app derived form: permissions become a `Set` for O(1) `can()` checks, plus a precomputed
 * `isSiteAdmin` flag. `NO_ACCESS` is the fail-closed default for a signed-out request.
 *
 * `Me.permissions` is authoritative: `Identity` never re-derives roles into permissions, it
 * only wraps what the gateway sent.
 */

export interface Identity {
  email: string;
  /** Structured given name; "" when the identity provider sent none and the user hasn't set it. */
  firstName: string;
  id: string;
  /** True when managedGroupIds is non-empty: a LOCAL group-manager of at least one group. */
  isGroupManager: boolean;
  isSiteAdmin: boolean;
  /** Structured family name; "" when the identity provider sent none and the user hasn't set it. */
  lastName: string;
  /** Platform group ids this user is a LOCAL group-manager of, for the "My groups" editor. */
  managedGroupIds: readonly string[];
  name: string;
  permissions: ReadonlySet<string>;
  roles: readonly string[];
  username: string;
}

export interface Me {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  managedGroupIds: readonly string[];
  name: string;
  permissions: readonly string[];
  roles: readonly string[];
  username: string;
}

export const NO_ACCESS: Identity = {
  email: "",
  firstName: "",
  id: "",
  isGroupManager: false,
  isSiteAdmin: false,
  lastName: "",
  managedGroupIds: [],
  name: "",
  permissions: new Set(),
  roles: [],
  username: "",
};

/** `site-admin` is the one role that grants every permission; see `catalog.ts`. */
export const identityFromMe = (me: Me): Identity => ({
  ...me,
  isGroupManager: me.managedGroupIds.length > 0,
  isSiteAdmin: me.roles.includes("site-admin"),
  permissions: new Set(me.permissions),
});
