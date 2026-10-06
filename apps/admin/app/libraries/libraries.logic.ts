// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * Pure list-curation rules shared by the three admin libraries (contact blocks, references and
 * definitions). Kept out of the route components so the tab partition and the curate/delete
 * gates are unit-testable and stay aligned with the gateway: a tri-admin (site-admin,
 * template-admin or compliance-admin) may curate any entry; anyone else may curate only the
 * entry they created. Delete is refused while anything attaches the entry (archive instead).
 */

/** The identity facts the curate gate needs: whether the viewer is one of the tri-admin roles,
 *  and their own user id. */
export interface CurateContext {
  isAdmin: boolean;
  userId?: null | string;
}

export type LibraryTab = "active" | "archived";

/** The rows shown for the selected tab: active hides archived, archived shows only archived.
 *  Order is preserved (the table owns sort). */
export const visibleByTab = <T extends { archived: boolean }>(
  entries: readonly T[],
  tab: LibraryTab,
): T[] => entries.filter((entry) => (tab === "archived" ? entry.archived : !entry.archived));

/** Who may edit / archive / delete a given entry: any tri-admin, or the entry's own creator.
 *  Contact blocks have no creator field, so only a tri-admin ever passes `createdByUserId:
 *  undefined`. */
export const canCurate = (context: CurateContext, createdByUserId?: null | string): boolean =>
  context.isAdmin || (!!context.userId && !!createdByUserId && context.userId === createdByUserId);

/** Delete is only offered when nothing attaches the entry; otherwise it must be archived (the
 *  gateway refuses a delete with attachments). */
export const isDeletable = (usedByCount: number): boolean => usedByCount === 0;
