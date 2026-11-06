// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType, type Policy, PolicyStatus } from "@steward-web/api-client";
import { can, type Identity, PERMISSIONS } from "@steward-web/auth";
import edge from "@steward-web/edge.server";

import { buildInboxRow } from "../approvals/approvalRows";
import { listPendingTasks } from "../approvals/approvals.server";

/** The library overview on My work (U1): counts across the policies the person can see. */
export interface LibraryOverview {
  /** Policies per top-level category, most first. */
  byCategory: { count: number; name: string }[];
  drafts: number;
  inReview: number;
  policies: number;
  published: number;
  sensitive: number;
}

export interface MyWorkData {
  /** The caller's mandatory reads and how many are done; null when it couldn't be read. */
  ack: { done: number; required: number } | null;
  /** Awaiting my approval; null for someone who doesn't approve. */
  approvals: null | WorkRow[];
  /** My drafts; null for someone who doesn't author. */
  drafts: null | WorkRow[];
  email: string;
  /** Null for a reader, who sees only the acknowledgement parts (U1r). */
  library: LibraryOverview | null;
  /** To acknowledge; null when it couldn't be read. */
  obligations: null | WorkRow[];
}

/** One row of a My work or To acknowledge list: what it is, and where it opens. */
export interface WorkRow {
  /** The policy's category, where the library can say (the acknowledge list groups by it). */
  category?: string;
  /** When it's due, where the gateway says (approvals today). */
  dueAt?: null | string;
  href: string;
  number: string;
  title: string;
  version: string;
}

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

/** A failed read leaves its part of the page out rather than failing the page. */
const orNull = <T>(read: Promise<T>): Promise<null | T> => read.catch(() => null);

const obligationRows = async (request: Request, withCategory = false): Promise<WorkRow[]> => {
  const cookie = cookieOf(request);
  const [obligations, catalog] = await Promise.all([
    edge.myObligations(cookie),
    // The category is only for the acknowledge page's grouping and filter, so the home page
    // doesn't ask for the library; a failed read leaves the rows without it.
    withCategory ? orNull(edge.policies(DocumentType.Policy, cookie)) : Promise.resolve(null),
  ]);
  const categoryOf = new Map((catalog ?? []).map((policy) => [policy.number, policy.category]));
  return obligations.map(({ number, title, version }) => {
    const category = categoryOf.get(number);
    return {
      ...(category ? { category } : {}),
      href: `/policies/${number}`,
      number,
      title,
      version,
    };
  });
};

const libraryOverview = (policies: readonly Policy[]): LibraryOverview => {
  const byName = new Map<string, number>();
  for (const policy of policies) {
    if (policy.category) byName.set(policy.category, (byName.get(policy.category) ?? 0) + 1);
  }
  const count = (status: PolicyStatus) => policies.filter((p) => p.status === status).length;
  return {
    byCategory: [...byName]
      .map(([name, value]) => ({ count: value, name }))
      .toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    drafts: count(PolicyStatus.Draft),
    inReview: count(PolicyStatus.InReview),
    policies: policies.length,
    published: count(PolicyStatus.Published),
    sensitive: policies.filter((p) => p.sensitivity === "SENSITIVE").length,
  };
};

/**
 * What My work (U1) shows the signed-in person, read only as far as their roles allow: an
 * author gets their drafts, an approver what's awaiting them, and both the library overview;
 * everyone gets what they still have to acknowledge and their compliance. A reader's page is
 * only the acknowledgement parts (U1r).
 */
export const myWorkData = async (request: Request, identity: Identity): Promise<MyWorkData> => {
  const cookie = cookieOf(request);
  const author = can(identity, PERMISSIONS.PolicyAuthor);
  const approver = can(identity, PERMISSIONS.PolicyApprove);
  const [ack, obligations, drafts, tasks, catalog] = await Promise.all([
    orNull(edge.myAckSummary(cookie)),
    orNull(obligationRows(request)),
    author ? orNull(edge.myDraftPolicies(cookie)) : Promise.resolve(null),
    approver ? orNull(listPendingTasks(request)) : Promise.resolve(null),
    author || approver ? orNull(edge.policies(DocumentType.Policy, cookie)) : Promise.resolve(null),
  ]);
  return {
    ack: ack ? { done: ack.done, required: ack.required } : null,
    approvals:
      tasks === null
        ? approver
          ? []
          : null
        : tasks.map((task) => {
            const row = buildInboxRow(task, catalog ?? []);
            const match = (catalog ?? []).find((p) => p.number === row.number);
            return {
              dueAt: task.dueAt ?? null,
              href: `/approvals/${row.number || task.policyVersionId}`,
              number: row.number,
              title: row.title,
              version: match?.version ?? "",
            };
          }),
    drafts:
      drafts === null
        ? author
          ? []
          : null
        : drafts.map((policy) => ({
            href: `/drafts/${policy.id}`,
            number: policy.number,
            title: policy.title,
            version: policy.version,
          })),
    email: identity.email,
    library: catalog ? libraryOverview(catalog) : null,
    obligations,
  };
};

/** To acknowledge (U2): what the person still has to acknowledge; null when it can't be read. */
export const toAcknowledgeData = async (request: Request) => ({
  obligations: await orNull(obligationRows(request, true)),
});
