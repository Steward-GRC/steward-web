// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { LatestTemplateVersionQuery, UserFieldsFragment } from "./generated/graphql";
import type {
  DocumentType,
  PolicyViewerCan,
  ReferenceKind,
  RelatedPolicy,
  ReviewCadence,
  Sensitivity,
} from "./generated/schema";

/**
 * The web's own view types: shapes the apps render that the gateway's schema has no single
 * type for. The live edge (edge/live.server.ts) assembles each one from the gateway's real
 * queries; the mock gateway returns them as-is. Everything else the Edge returns is the
 * gateway's own generated type.
 */

/** A policy's lifecycle state as the library and the reader show it. */
export enum PolicyStatus {
  Draft = "DRAFT",
  InReview = "IN_REVIEW",
  Published = "PUBLISHED",
  Rejected = "REJECTED",
  Superseded = "SUPERSEDED",
  Withdrawn = "WITHDRAWN",
}

/** This caller's acknowledgement of one published version. */
export interface AckStatus {
  readonly ackedAt?: null | string;
  readonly acknowledged: boolean;
  /** True when this caller is in the ack audience at all; false means no banner is shown. */
  readonly required: boolean;
}

export interface BreakGlassGrant {
  readonly grantedUntil: string;
}

/** A root category of the library's taxonomy, with its direct children's names. */
export interface Category {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly subcategories: readonly string[];
}

/**
 * A node of the category tree, as the admin groups directory and the new-draft picker read
 * it. The gateway calls these categories; the original UI called them groups.
 */
export interface Group {
  readonly defaultTemplateId?: null | string;
  readonly defaultTemplateNone: boolean;
  readonly defaultWorkflowId?: null | string;
  readonly id: string;
  readonly name: string;
  readonly owners: readonly string[];
  readonly parentId?: null | string;
  readonly reviewCadence: ReviewCadence;
  readonly reviewDate?: null | string;
  readonly slug: string;
}

/** One event in a policy's publish-and-approval history. */
export interface HistoryEntry {
  readonly actorName?: null | string;
  readonly at: string;
  readonly comment?: null | string;
  readonly kind: string;
  readonly stage?: null | string;
  readonly versionLabel: string;
}

/** The signed-in user, as the shell's identity and permission checks read it. */
export interface Me {
  readonly email: string;
  readonly firstName: string;
  readonly id: string;
  readonly lastName: string;
  readonly name: string;
  readonly permissions: readonly string[];
  readonly roles: readonly string[];
  readonly username: string;
}

/**
 * One library row, also the editor's policy. `category` is the home category's root
 * ancestor and `subcategory` the level below it ("" when the home category is a root).
 * `version` and `status` come from the current version (published, else the working
 * draft). `updated` is the gateway's last-write time for the policy row, null when
 * unavailable.
 */
export interface Policy {
  readonly category: string;
  readonly currentDraftVersionId?: null | string;
  readonly currentPublishedVersionId?: null | string;
  readonly documentType: DocumentType;
  readonly homeGroupId: string;
  readonly id: string;
  readonly number: string;
  readonly ownerUserId: string;
  readonly retiredAt?: null | string;
  readonly sensitivity: Sensitivity;
  readonly status: PolicyStatus;
  readonly subcategory: string;
  readonly templateId?: null | string;
  readonly templateNone: boolean;
  readonly title: string;
  readonly updated: null | string;
  readonly version: string;
  readonly viewerCan: PolicyViewerCan;
}

export interface PolicyAppendix {
  readonly id: string;
  readonly letter: string;
  readonly text: string;
  readonly title: string;
}

export interface PolicyContact {
  readonly department?: null | string;
  readonly email?: null | string;
  readonly hours?: null | string;
  readonly id: string;
  readonly label: string;
  readonly name?: null | string;
  readonly notes?: null | string;
  readonly phone?: null | string;
  readonly role?: null | string;
}

export interface PolicyDefinition {
  readonly definition: string;
  readonly id: string;
  readonly term: string;
}

/** The reader's full view of one policy or procedure. */
export interface PolicyDetail {
  readonly ack?: AckStatus | null;
  readonly appendices: readonly PolicyAppendix[];
  readonly bodyText: string;
  readonly canBreakGlass: boolean;
  readonly category: string;
  readonly contacts: readonly PolicyContact[];
  readonly contentObfuscated: boolean;
  /** The current published version's id, for `acknowledgePolicy`. Null before the first publish. */
  readonly currentVersionId?: null | string;
  readonly definitions: readonly PolicyDefinition[];
  readonly documentType: DocumentType;
  readonly history: readonly HistoryEntry[];
  readonly id: string;
  readonly number: string;
  readonly ownerName?: null | string;
  readonly priorVersion?: null | PolicyVersionSummary;
  readonly published?: null | string;
  readonly references: readonly PolicyReference[];
  readonly related: readonly RelatedPolicy[];
  readonly sensitivity: Sensitivity;
  readonly status: PolicyStatus;
  readonly subcategory: string;
  readonly title: string;
  readonly updated: null | string;
  readonly version: string;
}

export interface PolicyReference {
  readonly body?: null | string;
  readonly clause?: null | string;
  readonly id: string;
  readonly kind: ReferenceKind;
  readonly label: string;
  readonly url?: null | string;
}

export interface PolicySectionDiff {
  readonly changeType: string;
  readonly sectionKey: string;
  readonly sectionTitle: string;
  readonly wordDiffHtml?: null | string;
}

/** The current version against the one it superseded. */
export interface PolicyVersionSummary {
  readonly diff: readonly PolicySectionDiff[];
  readonly version: string;
}

/** A template selectable as a default or for a new draft. */
export interface Template {
  readonly code: string;
  readonly id: string;
  readonly name: string;
  readonly ownerCategoryId: null | string;
  readonly retiredAt: null | string;
}

/** A template's newest version with its section outline, as the editor scaffolds from it. */
export type TemplateVersion = NonNullable<LatestTemplateVersionQuery["latestTemplateVersion"]>;

/** One admin user-directory row: the gateway's `User`, trimmed to what the directory reads. */
export type User = UserFieldsFragment;

export interface UserPage {
  readonly nextPageToken: string;
  readonly users: readonly User[];
}

/** A workflow definition selectable as a category's default. */
export interface Workflow {
  readonly id: string;
  readonly name: string;
}
