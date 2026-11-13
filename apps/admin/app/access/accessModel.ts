// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The category access editor's model (A5): the rule list being edited, its tri-state cells and
// its reordering, and the simulator's reasons read out of the gateway's words. Plain data, so
// the rule table, the simulator and the route action share one shape.
import {
  RaciGrant,
  type RaciRule,
  type RaciRuleInput,
  RaciSubjectKind,
} from "@steward-web/api-client";

/** The four actions, in the table's column order (RACI: Read, Acknowledge, Approve, Author). */
export const ACTIONS = ["read", "ack", "approve", "author"] as const;
export type AccessAction = (typeof ACTIONS)[number];

/** A rule in the editor: the stored rule, a stable key and, once moved, the way it went. */
export interface DraftRule extends RaciRuleInput {
  key: string;
  /** Set when the person moved this row; it keeps a plum edge until the rules are saved. */
  moved?: "down" | "up";
}

const CYCLE: Record<RaciGrant, RaciGrant> = {
  [RaciGrant.Allow]: RaciGrant.Deny,
  [RaciGrant.Blank]: RaciGrant.Allow,
  [RaciGrant.Deny]: RaciGrant.Blank,
};

/** A cell's next value on a click or Space: blank, allow, deny, then blank again. */
export const nextGrant = (grant: RaciGrant): RaciGrant => CYCLE[grant];

const ruleInputOf = (rule: RaciRule | RaciRuleInput): RaciRuleInput => ({
  ack: rule.ack,
  approve: rule.approve,
  author: rule.author,
  // Carried through so saving the rules never clears a stored Manage grant; the table has no
  // Manage column yet.
  manage: rule.manage,
  read: rule.read,
  subjectKind: rule.subjectKind,
  subjectRef: rule.subjectKind === RaciSubjectKind.Everyone ? "" : rule.subjectRef,
});

/** The stored rules as the editor's draft, each with a key that survives reordering. */
export const draftOf = (rules: readonly RaciRule[]): DraftRule[] =>
  rules.map((rule, index) => ({ ...ruleInputOf(rule), key: `rule-${index}` }));

/** The draft as `setCategoryRuleset` and `simulateCategory` take it. */
export const rulesInputOf = (draft: readonly DraftRule[]): RaciRuleInput[] =>
  draft.map((rule) => ruleInputOf(rule));

export const setGrant = (
  draft: readonly DraftRule[],
  key: string,
  action: AccessAction,
  grant: RaciGrant,
): DraftRule[] => draft.map((rule) => (rule.key === key ? { ...rule, [action]: grant } : rule));

/** Moves one rule a place up (-1) or down (1). At either end the draft comes back unchanged. */
export const moveRule = (
  draft: readonly DraftRule[],
  key: string,
  delta: -1 | 1,
): readonly DraftRule[] => {
  const from = draft.findIndex((rule) => rule.key === key);
  const to = from + delta;
  if (from === -1 || to < 0 || to >= draft.length) return draft;
  const next = [...draft];
  const [moving] = next.splice(from, 1);
  next.splice(to, 0, { ...moving!, moved: delta === -1 ? "up" : "down" });
  return next;
};

/** A new rule for a subject, every action blank, at the bottom of the category's own rules. */
export const newRule = (
  subjectKind: RaciSubjectKind,
  subjectRef: string,
  key: string,
): DraftRule => ({
  ack: RaciGrant.Blank,
  approve: RaciGrant.Blank,
  author: RaciGrant.Blank,
  key,
  read: RaciGrant.Blank,
  subjectKind,
  subjectRef: subjectKind === RaciSubjectKind.Everyone ? "" : subjectRef.trim(),
});

/** Why the simulator decided as it did, read out of the gateway's reason. */
export type Reason =
  | {
      /** The ancestor whose rule decided, or null for this category's own rule. */
      category: null | string;
      effect: "allow" | "deny";
      kind: "rule";
      /** A group name or a user id; empty for Everyone. */
      name: string;
      number: number;
      subjectKind: RaciSubjectKind;
    }
  | { kind: "approverImpliesRead" }
  | { kind: "authorImpliesRead" }
  | { kind: "defaultDeny" }
  | { kind: "other"; text: string }
  | { kind: "owner" }
  | { kind: "requiresRead" }
  | { kind: "siteAdmin" };

const BUILT_IN: Record<string, Reason> = {
  "approver implies read": { kind: "approverImpliesRead" },
  "author implies read": { kind: "authorImpliesRead" },
  "no rule → default deny": { kind: "defaultDeny" },
  "owner (auto read/approve/author)": { kind: "owner" },
  "requires read": { kind: "requiresRead" },
  "site-admin reads all": { kind: "siteAdmin" },
};

const KINDS: Record<string, RaciSubjectKind> = {
  everyone: RaciSubjectKind.Everyone,
  group: RaciSubjectKind.Group,
  user: RaciSubjectKind.User,
};

const OWN_RULE = /^rule #(\d+) (allow|deny) (everyone|group|user)(?: (.+))?$/;
const ANCESTOR_RULE = /^↳ (.+?) #(\d+) (allow|deny) (everyone|group|user)(?: (.+))?$/;

/**
 * The gateway explains each verdict in steward-authz's words ("rule #1 allow group Finance
 * team", "↳ Finance #2 deny everyone", "no rule → default deny"). They are read back into
 * parts here so the simulator can say them in the reader's language and show a person's name
 * instead of their id. Anything else is kept as it came.
 */
export const parseReason = (reason: string): Reason => {
  const builtIn = BUILT_IN[reason];
  if (builtIn) return builtIn;
  const own = OWN_RULE.exec(reason);
  if (own) {
    return {
      category: null,
      effect: own[2] as "allow" | "deny",
      kind: "rule",
      name: own[4] ?? "",
      number: Number(own[1]),
      subjectKind: KINDS[own[3]!]!,
    };
  }
  const inherited = ANCESTOR_RULE.exec(reason);
  if (inherited) {
    return {
      category: inherited[1]!,
      effect: inherited[3] as "allow" | "deny",
      kind: "rule",
      name: inherited[5] ?? "",
      number: Number(inherited[2]),
      subjectKind: KINDS[inherited[4]!]!,
    };
  }
  return { kind: "other", text: reason };
};
