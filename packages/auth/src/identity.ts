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
  id: string;
  isSiteAdmin: boolean;
  name: string;
  permissions: ReadonlySet<string>;
  roles: readonly string[];
  username: string;
}

export interface Me {
  email: string;
  id: string;
  name: string;
  permissions: readonly string[];
  roles: readonly string[];
  username: string;
}

export const NO_ACCESS: Identity = {
  email: "",
  id: "",
  isSiteAdmin: false,
  name: "",
  permissions: new Set(),
  roles: [],
  username: "",
};

/** `site-admin` is the one role that grants every permission; see `catalog.ts`. */
export const identityFromMe = (me: Me): Identity => ({
  ...me,
  isSiteAdmin: me.roles.includes("site-admin"),
  permissions: new Set(me.permissions),
});
