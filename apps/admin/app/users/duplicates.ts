// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

export interface DuplicateGroup<T extends Account> {
  accounts: T[];
  email: string;
  /** The account to close, and the one to keep. */
  sourceUserId: string;
  targetUserId: string;
}

interface Account {
  deletedAt?: null | string;
  email: string;
  localAccount?: boolean;
  name: string;
  roles?: readonly string[];
  userId: string;
}

/** Which of two accounts to keep: the one with roles, else the local one, else the first. */
const keepScore = (account: Account) =>
  ((account.roles?.length ?? 0) > 0 ? 2 : 0) + (account.localAccount ? 1 : 0);

/**
 * Accounts that look like one person: two or more open accounts on one email (any case). The
 * email is the only match; two people can share a name, and one person's accounts can spell it
 * differently, so a name never offers a pair. Each group proposes merging the first other account
 * into the one to keep; the admin still previews and confirms.
 */
export const likelyDuplicates = <T extends Account>(users: readonly T[]): DuplicateGroup<T>[] => {
  const byEmail = new Map<string, T[]>();
  for (const user of users) {
    if (user.deletedAt) continue;
    const key = user.email.trim().toLowerCase();
    byEmail.set(key, [...(byEmail.get(key) ?? []), user]);
  }
  return [...byEmail.entries()]
    .filter(([, accounts]) => accounts.length > 1)
    .map(([email, accounts]) => {
      const ranked = accounts.toSorted((a, b) => keepScore(b) - keepScore(a));
      return {
        accounts,
        email,
        sourceUserId: ranked[1]!.userId,
        targetUserId: ranked[0]!.userId,
      };
    })
    .toSorted((a, b) => b.accounts.length - a.accounts.length || a.email.localeCompare(b.email));
};
