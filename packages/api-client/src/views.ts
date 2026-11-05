// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  ImpersonationStatusQuery,
  LatestTemplateVersionQuery,
  MyFactorsQuery,
  SearchAndAnswerQuery,
  SearchUsersQuery,
  UserFieldsFragment,
  WorkflowDefQuery,
} from "./generated/graphql";
import type {
  AckTrigger,
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

/** The caller's mandatory reads and how many are done (My work's compliance card, U1). */
export interface AckSummary {
  readonly done: number;
  readonly required: number;
}

/** Ask's answer (U6): the text, its citations, and which spans of the text each one backs. */
export type AskAnswer = SearchAndAnswerQuery["searchAndAnswer"];

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
 * One block of a version's body as the reader draws it (U7): a heading at its depth below the
 * document's top level (1 is a numbered section, 2 its sub-section), a paragraph, a list, a
 * quote or a table.
 */
export type DocumentBlock =
  | { readonly depth: 1 | 2 | 3; readonly kind: "heading"; readonly text: string }
  | {
      readonly items: readonly (readonly InlineRun[])[];
      readonly kind: "list";
      readonly ordered: boolean;
    }
  | { readonly kind: "paragraph"; readonly runs: readonly InlineRun[] }
  | { readonly kind: "quote"; readonly runs: readonly InlineRun[] }
  | {
      readonly kind: "table";
      readonly rows: readonly { readonly cells: readonly string[]; readonly header: boolean }[];
    };

/**
 * A node of the category tree, as the admin groups directory and the new-draft picker read
 * it. The gateway calls these categories; the original UI called them groups.
 */
export interface Group {
  /** Ack-audience "Everyone" tri-state: true/false is this category's own value;
   *  `ackEveryoneSet` says whether it's an explicit override (true) or inherited (false). */
  readonly ackEveryone: boolean;
  readonly ackEveryoneSet: boolean;
  readonly ackTriggers: AckTrigger;
  readonly defaultTemplateId?: null | string;
  readonly defaultTemplateNone: boolean;
  readonly defaultWorkflowId?: null | string;
  /** Per-category exclusion IdP group names. null = inherit from the ancestor chain; an
   *  (possibly empty) array is this category's own explicit override. */
  readonly exclusionGroupIds?: null | readonly string[];
  readonly id: string;
  /** Per-category ack-audience IdP group names. Same inherit/override nullability as
   *  `exclusionGroupIds`. */
  readonly idpGroupIds?: null | readonly string[];
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

/** The caller's "act as" session (H9), or null when they aren't acting as anyone. */
export type ImpersonationStatus = ImpersonationStatusQuery["impersonationStatus"];

/** One run of inline text in a document block, with its marks and link. */
export interface InlineRun {
  readonly bold?: boolean;
  readonly code?: boolean;
  readonly href?: string;
  readonly italic?: boolean;
  readonly strike?: boolean;
  readonly text: string;
  readonly underline?: boolean;
}

/** The signed-in user, as the shell's identity and permission checks read it. */
export interface Me {
  readonly email: string;
  readonly firstName: string;
  readonly id: string;
  readonly lastName: string;
  /** Platform group ids the caller is a LOCAL group-manager of; empty for everyone else. */
  readonly managedGroupIds: readonly string[];
  readonly name: string;
  /** True until the person finishes first-run onboarding (G10, the welcome page). */
  readonly needsOnboarding: boolean;
  readonly permissions: readonly string[];
  readonly roles: readonly string[];
  readonly username: string;
}

/** A published version the caller still has to acknowledge (To acknowledge, U2). */
export interface Obligation {
  readonly number: string;
  readonly policyId: string;
  readonly policyVersionId: string;
  readonly title: string;
  readonly version: string;
}

/**
 * One library row, also the editor's policy. `category` is the home category's root
 * ancestor and `subcategory` the level below it ("" when the home category is a root).
 * `version` and `status` come from the current version (published, else the working
 * draft). `updated` is the gateway's last-write time for the policy row, null when
 * unavailable.
 */
export interface Policy {
  /** Non-empty overrides the owning group's descendants as the ack audience; empty/undefined
   *  inherits it. See `ackTriggers` for whether the policy requires ack at all. */
  readonly ackAudienceOverride?: null | readonly string[];
  /** The policy's own ack trigger; undefined/null inherits the owning group's. */
  readonly ackTriggers?: AckTrigger | null;
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
  /** The body as the reader draws it: numbered sections, paragraphs, lists, tables. */
  readonly body: readonly DocumentBlock[];
  readonly bodyText: string;
  /** True when the version has content the reader couldn't read ("couldn't be displayed"). */
  readonly bodyUnreadable: boolean;
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
  /** A newer version being worked on beside the published one, for the revision notice (U10). */
  readonly revision?: { readonly status: PolicyStatus; readonly version: string } | null;
  readonly sensitivity: Sensitivity;
  readonly status: PolicyStatus;
  readonly subcategory: string;
  /** The stored publish-time AI summary of the published version, when there is one. */
  readonly summary?: { readonly generatedAt: string; readonly text: string } | null;
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

/** One of the caller's second factors: kind is "totp", "email" or "passkey". */
export type SecondFactor = MyFactorsQuery["myFactors"][number];

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

/** A lightweight id+name(+email) pair from the `searchUsers` typeahead — any authenticated
 *  caller, unlike the site-admin-only directory. */
export type UserLabel = SearchUsersQuery["searchUsers"][number];

export interface UserPage {
  readonly nextPageToken: string;
  readonly users: readonly User[];
}

/** A workflow definition selectable as a category's default. */
export interface Workflow {
  readonly id: string;
  readonly name: string;
}

/** A workflow definition's full detail: its ordered approval stages, for admin management. */
export type WorkflowDef = NonNullable<WorkflowDefQuery["workflowDef"]>;

/** One stage of a workflow definition's approval chain. */
export type WorkflowStageDef = WorkflowDef["stages"][number];
