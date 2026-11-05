// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  documentText,
  nodeText,
  parseDocument,
  type SerializedNode,
} from "@steward-web/editor-steward/document";

import type { AuthoringPolicyFieldsFragment } from "../generated/graphql";

import { GatewayError } from "../gatewayFetch";
import {
  type DocumentBlock,
  type HistoryEntry,
  type InlineRun,
  type Policy,
  PolicyStatus,
} from "../views";

/** The part of a gateway `Category` the library's names are built from. */
export interface CategoryNode {
  readonly id: string;
  readonly name: string;
  readonly parentId?: null | string;
}

interface StoredSection {
  text?: unknown;
  title?: unknown;
}

/**
 * A version's `contentJson` as the reader's plain-text body. The editor saves its serialized
 * document (a `{ root }` tree), read block by block; older content is a JSON array of
 * `{ sectionKey, title, text }`, read as each section with text, titled, in stored order.
 */
export const bodyTextFromContent = (contentJson: string): string => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contentJson);
  } catch {
    return "";
  }
  if (!Array.isArray(parsed)) {
    const document = parseDocument(contentJson);
    return document ? documentText(document) : "";
  }
  return (parsed as StoredSection[])
    .filter((s) => typeof s.text === "string" && s.text.trim() !== "")
    .map((s) => `${typeof s.title === "string" ? s.title : ""}\n\n${String(s.text)}`)
    .join("\n\n");
};

// Lexical's text format bits.
const BOLD = 1;
const ITALIC = 2;
const STRIKE = 4;
const UNDERLINE = 8;
const CODE = 16;

const runsOf = (node: SerializedNode, href?: string): InlineRun[] =>
  (node.children ?? []).flatMap((child): InlineRun[] => {
    if (child.type === "link" || child.type === "autolink") {
      const url = typeof child.url === "string" ? child.url : undefined;
      return runsOf(child, url);
    }
    if (child.type === "linebreak") return [{ text: "\n" }];
    if (typeof child.text === "string") {
      if (child.text === "") return [];
      const format = typeof child.format === "number" ? child.format : 0;
      const marks: Partial<InlineRun> = {};
      if (format & BOLD) Object.assign(marks, { bold: true });
      if (format & CODE) Object.assign(marks, { code: true });
      if (href) Object.assign(marks, { href });
      if (format & ITALIC) Object.assign(marks, { italic: true });
      if (format & STRIKE) Object.assign(marks, { strike: true });
      if (format & UNDERLINE) Object.assign(marks, { underline: true });
      return [{ ...marks, text: child.text }];
    }
    return runsOf(child, href);
  });

const headingLevel = (node: SerializedNode): number =>
  Number.parseInt(String(node.tag ?? "h1").replace(/^h/i, ""), 10) || 1;

const blockOf = (node: SerializedNode, top: number): DocumentBlock | undefined => {
  switch (node.type) {
    case "heading": {
      const text = nodeText(node).trim();
      if (!text) return undefined;
      const depth = Math.min(3, Math.max(1, headingLevel(node) - top + 1)) as 1 | 2 | 3;
      return { depth, kind: "heading", text };
    }
    case "list": {
      const items = (node.children ?? [])
        .filter((item) => item.type === "listitem")
        .map((item) => runsOf(item))
        .filter((runs) => runs.length > 0);
      return items.length > 0
        ? { items, kind: "list", ordered: node.listType === "number" }
        : undefined;
    }
    case "quote": {
      const runs = runsOf(node);
      return runs.length > 0 ? { kind: "quote", runs } : undefined;
    }
    case "table": {
      const rows = (node.children ?? [])
        .filter((row) => row.type === "tablerow")
        .map((row) => {
          const cells = (row.children ?? []).filter((cell) => cell.type === "tablecell");
          return {
            cells: cells.map((cell) => nodeText(cell).replaceAll(/\s+/g, " ").trim()),
            header: cells.length > 0 && cells.every((cell) => Number(cell.headerState ?? 0) !== 0),
          };
        });
      return rows.length > 0 ? { kind: "table", rows } : undefined;
    }
    default: {
      const runs = runsOf(node);
      if (runs.length === 0 && typeof node.text !== "string") {
        const plain = nodeText(node).trim();
        return plain ? { kind: "paragraph", runs: [{ text: plain }] } : undefined;
      }
      return runs.length > 0 ? { kind: "paragraph", runs } : undefined;
    }
  }
};

/**
 * A version's `contentJson` as the reader's blocks (U7). Heading depth is measured from the
 * document's own top heading level, so its sections number "1.", "2." and their sub-sections
 * "1.1". The older section array reads as each section's heading and its paragraphs. Content
 * that can't be read answers no blocks.
 */
export const documentBlocksFromContent = (contentJson: string): DocumentBlock[] => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contentJson);
  } catch {
    return [];
  }
  if (Array.isArray(parsed)) {
    return (parsed as StoredSection[]).flatMap((section): DocumentBlock[] => {
      const title = typeof section.title === "string" ? section.title.trim() : "";
      const body = typeof section.text === "string" ? section.text : "";
      const paragraphs = body
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph): DocumentBlock => ({ kind: "paragraph", runs: [{ text: paragraph }] }));
      return [
        ...(title ? [{ depth: 1, kind: "heading", text: title } as const] : []),
        ...paragraphs,
      ];
    });
  }
  const document = parseDocument(contentJson);
  if (!document) return [];
  const headings = document.root.children.filter((node) => node.type === "heading");
  const top = headings.length > 0 ? Math.min(...headings.map((node) => headingLevel(node))) : 1;
  return document.root.children
    .map((node) => blockOf(node, top))
    .filter((block): block is DocumentBlock => block !== undefined);
};

/** True for stored content the reader can read: blank, the older section array, or a tree. */
export const readableContent = (contentJson: string): boolean => {
  if (!contentJson.trim()) return true;
  try {
    const parsed = JSON.parse(contentJson) as unknown;
    if (Array.isArray(parsed)) return true;
  } catch {
    return false;
  }
  return parseDocument(contentJson) !== undefined;
};

/** An appendix's `contentJson` (the editor's `{ text }`) as plain text. */
export const appendixText = (contentJson: string): string => {
  try {
    const parsed = JSON.parse(contentJson) as unknown;
    if (parsed && typeof parsed === "object" && "text" in parsed) {
      const { text } = parsed as { text: unknown };
      return typeof text === "string" ? text : "";
    }
  } catch {
    return "";
  }
  return "";
};

/** The library's category (root ancestor) and subcategory (the level below it) names. */
export const categoryNames = (
  index: ReadonlyMap<string, CategoryNode>,
  homeCategoryId: string,
): { category: string; subcategory: string } => {
  const chain: CategoryNode[] = [];
  let node = index.get(homeCategoryId);
  while (node && chain.length <= index.size) {
    chain.unshift(node);
    node = node.parentId ? index.get(node.parentId) : undefined;
  }
  return { category: chain[0]?.name ?? "", subcategory: chain[1]?.name ?? "" };
};

const statuses = new Set<string>(Object.values(PolicyStatus));

/** A policy row's status: published once any version is, else its working draft's own. */
export const policyStatusOf = (hasPublished: boolean, versionStatus?: string): PolicyStatus => {
  if (hasPublished) return PolicyStatus.Published;
  const upper = versionStatus?.toUpperCase() ?? "";
  return statuses.has(upper) ? (upper as PolicyStatus) : PolicyStatus.Draft;
};

/** The gateway policy and its category names as the library row; the current version's
 *  number and status come straight off the policy row, with no extra version read. */
export const toPolicyView = (
  policy: Omit<AuthoringPolicyFieldsFragment, "ownerName">,
  names: { category: string; subcategory: string },
): Policy => ({
  ackAudienceOverride: policy.ackAudienceOverride,
  ackTriggers: policy.ackTriggers,
  category: names.category,
  currentDraftVersionId: policy.currentDraftVersionId,
  currentPublishedVersionId: policy.currentPublishedVersionId,
  documentType: policy.documentType,
  homeGroupId: policy.homeCategoryId,
  id: policy.id,
  number: policy.number,
  ownerUserId: policy.ownerUserId,
  retiredAt: policy.retiredAt,
  sensitivity: policy.sensitivity,
  status: policyStatusOf(
    Boolean(policy.currentPublishedVersionId),
    policy.currentVersionStatus ?? undefined,
  ),
  subcategory: names.subcategory,
  templateId: policy.templateId,
  templateNone: policy.templateNone,
  title: policy.title,
  updated: policy.updatedAt,
  version: policy.currentVersionNo === null ? "" : String(policy.currentVersionNo),
  viewerCan: policy.viewerCan,
});

/** True for the gateway's signed-out refusal, by code or by HTTP status. */
export const isUnauthenticated = (error: unknown): boolean =>
  error instanceof GatewayError &&
  (error.status === 401 || error.code?.toUpperCase() === "UNAUTHENTICATED");

/** True for the gateway's refusal of a caller who lacks the grant, by its code alone: the
 *  gRPC status name ("PermissionDenied") or its symbol ("PERMISSION_DENIED"). */
export const isPermissionDenied = (error: unknown): boolean =>
  error instanceof GatewayError &&
  error.code?.replaceAll("_", "").toUpperCase() === "PERMISSIONDENIED";

/** True for the gateway's "no such thing" refusal, by its code alone: the gRPC status name
 *  ("NotFound") or its symbol ("NOT_FOUND"). */
export const isNotFound = (error: unknown): boolean =>
  error instanceof GatewayError && error.code?.replaceAll("_", "").toUpperCase() === "NOTFOUND";

/** The audit actions that are a policy's lifecycle steps, shown with their own badge. A bulk
 *  decision is still that approver's decision, so it reads the same as a single one. */
const LIFECYCLE_KINDS: Readonly<Record<string, string>> = {
  "policy.published": "published",
  "policy.retired": "retired",
  "workflow.bulk.approved": "approved",
  "workflow.bulk.rejected": "rejected",
  "workflow.decision.approved": "approved",
  "workflow.decision.rejected": "rejected",
  "workflow.signal.request_changes": "changesRequested",
  "workflow.submitted": "submitted",
  "workflow.withdrawn": "withdrawn",
};

/** An audit action as the history's event kind, which is also its translation key under
 *  `reader.history.events`: a lifecycle step by name, anything else camelCased with the
 *  `policy.` prefix dropped ("policy.break_glass_read" -> "breakGlassRead",
 *  "workflow.stage.escalated" -> "workflowStageEscalated"). A key never holds a dot, which
 *  i18next would read as nesting. */
const historyKindOf = (action: string): string =>
  LIFECYCLE_KINDS[action] ??
  action
    .replace(/^policy\./, "")
    .split(/[._]/)
    .filter(Boolean)
    .map((word, index) => (index === 0 ? word : word[0]!.toUpperCase() + word.slice(1)))
    .join("");

/**
 * A policy's audit records as the reader's history: oldest first (the gateway's own
 * `auditLog` reads newest first), each attributed to `versionLabel` since the audit trail
 * carries no per-event version number. `comment` and `stage` are null for the same reason:
 * the audit record has neither.
 */
export const historyFromAuditLog = (
  records: readonly { action: string; actorName?: null | string; occurredAt: string }[],
  versionLabel: string,
): HistoryEntry[] =>
  records.toReversed().map((r) => ({
    actorName: r.actorName ?? null,
    at: r.occurredAt,
    comment: null,
    kind: historyKindOf(r.action),
    stage: null,
    versionLabel,
  }));

/**
 * The published versions as the reader's history, for a caller who can't read the audit
 * log: one "published" event per version that carries a publish time, oldest first, each
 * under its own version number. Actor, comment and stage are null: a version row has none.
 */
export const historyFromVersions = (
  versions: readonly { publishedAt?: null | string; versionNo: number }[],
): HistoryEntry[] =>
  versions
    .toSorted((a, b) => a.versionNo - b.versionNo)
    .flatMap((v) =>
      v.publishedAt
        ? [
            {
              actorName: null,
              at: v.publishedAt,
              comment: null,
              kind: "published",
              stage: null,
              versionLabel: String(v.versionNo),
            },
          ]
        : [],
    );
