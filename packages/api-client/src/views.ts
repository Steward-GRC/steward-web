// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  IdpGroupNamesQuery,
  ImpersonationStatusQuery,
  LatestTemplateVersionQuery,
  MyFactorsQuery,
  MyWebauthnCredentialsQuery,
  NotificationSettingsFieldsFragment,
  NotificationSettingsQuery,
  RelationshipTypesQuery,
  SearchAndAnswerQuery,
  SearchUsersQuery,
  UserFieldsFragment,
  VersionLinksFieldsFragment,
  WorkflowDefQuery,
} from "./generated/graphql";
import type {
  AckTrigger,
  CategoryDocumentTypes,
  DocumentType,
  WorkflowStatus as GeneratedWorkflowStatus,
  PolicyViewerCan,
  ReferenceKind,
  RelatedPolicy,
  ReviewCadence,
  Sensitivity,
  StageAssignee,
} from "./generated/schema";
import type { VersionChange } from "./semanticVersion";

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

/** Someone who saved or published an appendix; former staff stay listed, with `active` false. */
export interface AppendixContributorView {
  readonly active: boolean;
  readonly name: string;
  readonly userId: string;
}

/** An appendix of a policy or procedure with its own life: a draft beside what is published. */
export interface AppendixEntry {
  /**
   * Everyone who ever saved or published it, active or not, in the order they first did. Empty
   * for anyone who may not see the diff.
   */
  readonly contributors?: readonly AppendixContributorView[];
  readonly draft?: AppendixRowView | null;
  readonly id: string;
  /** The place among the live appendices; null while retired. */
  readonly letter?: null | string;
  readonly orderIndex: number;
  readonly policyId: string;
  readonly published?: AppendixRowView | null;
  /** The published rows, latest first, for the Published tab's drop-down. */
  readonly publishedVersions?: readonly AppendixRowView[];
  readonly retiredAt?: null | string;
  readonly versions: readonly AppendixRowView[];
}

/** One row of an appendix's own version table. */
export interface AppendixRowView {
  readonly contentJson: string;
  readonly id: string;
  readonly publishedAt?: null | string;
  readonly publishedBy?: null | string;
  readonly state: "DRAFT" | "PUBLISHED";
  readonly title: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly versionNo: number;
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
  readonly subcategories: readonly Subcategory[];
}

/**
 * One block of a version's body as the reader draws it (U7): a heading at its depth below the
 * document's top level (1 is a numbered section, 2 its sub-section), a paragraph, a list, a
 * quote or a table.
 */
export type DocumentBlock =
  | {
      readonly depth: 1 | 2 | 3;
      readonly kind: "heading";
      /** The key steward-core gives the section this heading starts, which an AI citation
       *  links to (`#<sectionKey>`). */
      readonly sectionKey?: string;
      readonly text: string;
    }
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
  /** Authors must use the default template: freeform and any other are refused. */
  readonly defaultTemplateLocked?: boolean;
  readonly defaultTemplateNone: boolean;
  readonly defaultWorkflowId?: null | string;
  /** Which document types the category holds; NONE is a container for child categories. */
  readonly documentTypes?: CategoryDocumentTypes;
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
  /** The ordinal of the version the event belongs to, shown beside a semantic label. */
  readonly versionNo?: number;
}

/** A lightweight id+name(+email) pair from the `searchUsers` typeahead — any authenticated
 *  caller, unlike the site-admin-only directory. */
export type IdpGroupNames = IdpGroupNamesQuery["idpGroupNames"];

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
  /** The account's display language (BCP-47); "" or absent means "match my browser". */
  readonly locale?: string;
  /** Platform group ids the caller is a LOCAL group-manager of; empty for everyone else. */
  readonly managedGroupIds: readonly string[];
  readonly name: string;
  /** True until the person finishes first-run onboarding (G10, the welcome page). */
  readonly needsOnboarding: boolean;
  readonly permissions: readonly string[];
  readonly roles: readonly string[];
  readonly username: string;
}

/** The caller's notification settings, with the type catalog they choose from (U35). */
export interface NotificationPreferences {
  readonly catalog: NotificationSettingsQuery["notificationTypeCatalog"];
  readonly settings: NotificationSettingsFieldsFragment;
}

/** A published version the caller still has to acknowledge (To acknowledge, U2). */
export interface Obligation {
  readonly number: string;
  readonly policyId: string;
  readonly policyVersionId: string;
  readonly title: string;
  readonly version: string;
}

/** One of the caller's registered passkeys (U33). */
export type Passkey = MyWebauthnCredentialsQuery["myWebauthnCredentials"][number];

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
  /** The category's slug, for the library's address (`/policies/category/<slug>`). */
  readonly categorySlug: string;
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
  /** The subcategory's slug ("" when there is none). */
  readonly subcategorySlug: string;
  readonly templateId?: null | string;
  readonly templateNone: boolean;
  readonly title: string;
  readonly updated: null | string;
  readonly version: string;
  readonly viewerCan: PolicyViewerCan;
}

export interface PolicyAppendix {
  /** The appendix written in the editor, drawn with its formatting; absent for plain text. */
  readonly blocks?: readonly DocumentBlock[];
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
  /** Whether AI is usable for the caller (`aiHealth`); `reason` says why not. Absent reads as
   *  available. */
  readonly ai?: { readonly available: boolean; readonly reason?: null | string } | null;
  readonly appendices: readonly PolicyAppendix[];
  /** The body as the reader draws it: numbered sections, paragraphs, lists, tables. */
  readonly body: readonly DocumentBlock[];
  readonly bodyText: string;
  /** True when the version has content the reader couldn't read ("couldn't be displayed"). */
  readonly bodyUnreadable: boolean;
  readonly canBreakGlass: boolean;
  /** The viewer may edit this document (the reader's Edit action, in the staff app). */
  readonly canEdit?: boolean;
  readonly category: string;
  readonly categorySlug: string;
  readonly contacts: readonly PolicyContact[];
  readonly contentObfuscated: boolean;
  /** The current published version's id, for `acknowledgePolicy`. Null before the first publish. */
  readonly currentVersionId?: null | string;
  readonly definitions: readonly PolicyDefinition[];
  readonly documentType: DocumentType;
  readonly history: readonly HistoryEntry[];
  readonly id: string;
  /** When the document is next due for review, from its category chain (R1). */
  readonly nextReview?: null | string;
  readonly number: string;
  readonly ownerName?: null | string;
  readonly priorVersion?: null | PolicyVersionSummary;
  readonly published?: null | string;
  readonly references: readonly PolicyReference[];
  readonly related: readonly RelatedItem[];
  /** A newer version being worked on beside the published one, for the revision notice (U10). */
  readonly revision?: { readonly status: PolicyStatus; readonly version: string } | null;
  readonly sensitivity: Sensitivity;
  readonly status: PolicyStatus;
  readonly subcategory: string;
  readonly subcategorySlug: string;
  /** The stored publish-time AI summary of the published version, when there is one. */
  readonly summary?: { readonly generatedAt: string; readonly text: string } | null;
  readonly title: string;
  readonly updated: null | string;
  readonly version: string;
  /** What decided the published version's change type: core's suggestion, the author's pick,
   *  the reason, and who agreed to a lowering. Absent when there is no published version. */
  readonly versionChange?: null | VersionChangeInfo;
  /** The name for each user id in `versionChange`, where the labels resolved. */
  readonly versionChangeNames?: Readonly<Record<string, string>>;
  /** The published version's ordinal (1, 2, 3 ...), which the semantic `version` sits beside. */
  readonly versionNo?: number;
  /** Every version the caller can read, oldest first, for the compare pickers (U19). */
  readonly versions?: readonly PolicyVersionOption[];
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

/** One version as the compare pickers list it (U19): "v2 · published". */
export interface PolicyVersionOption {
  readonly id: string;
  /** The gateway's status word ("published", "superseded", "draft", "in_review"). */
  readonly status: string;
  readonly version: string;
  readonly versionNo?: number;
}

/** The current version against the one it superseded. */
export interface PolicyVersionSummary {
  readonly diff: readonly PolicySectionDiff[];
  /** The two versions the diff runs between, as the compare pickers start (U19). */
  readonly fromVersionId?: string;
  readonly toVersionId?: string;
  readonly version: string;
}

/** A related policy; `label` is how it relates to this one ("supersedes", "is related by"). */
export type RelatedItem = { readonly label?: string } & RelatedPolicy;

/** A related policy the author picked, with the relationship type. */
export interface RelatedLinkChoice {
  readonly policyId: string;
  readonly type: string;
}

/** A relationship type and the type the other side of the link takes. */
export type RelationshipType = RelationshipTypesQuery["relationshipTypes"][number];

/** One message of an inline review thread. */
export interface ReviewMessage {
  readonly authorName: null | string;
  readonly authorUserId: string;
  readonly body: string;
  readonly createdAt: string;
  readonly id: string;
}

/**
 * Replacement text proposed for a thread's quote. The two sides take turns; once it has ended it
 * carries the outcome, who closed it, the text and the reason.
 */
export interface ReviewSuggestion {
  readonly closedBy: null | string;
  readonly closedText: null | string;
  readonly outcome: null | SuggestionOutcome;
  readonly reason: null | string;
  readonly rounds: readonly SuggestionRound[];
  readonly text: string;
  readonly turn: SuggestionSide;
}

/**
 * A comment thread on text in a policy version: the quoted text and which match of it (from 1)
 * place the highlight again in the stored document.
 */
export interface ReviewThread {
  /** The approver the thread is with; the policy's authors see it too. */
  readonly approverUserId: string;
  readonly createdAt: string;
  readonly id: string;
  readonly messages: readonly ReviewMessage[];
  readonly occurrence: number;
  readonly policyVersionId: string;
  readonly quote: string;
  readonly resolved: boolean;
  /** Present when someone proposed replacement text for the quote. */
  readonly suggestion?: null | ReviewSuggestion;
}

/** One of the caller's second factors: kind is "totp", "email" or "passkey". */
export type SecondFactor = MyFactorsQuery["myFactors"][number];

/** A direct child of a root category: its display name and its slug (unique under the parent). */
export interface Subcategory {
  readonly name: string;
  readonly slug: string;
}

/** How a suggestion ended. */
export type SuggestionOutcome = "AGREED" | "CHANGED" | "NOT_AGREED" | "REMOVED" | "WITHDRAWN";

/** One round of a suggestion: who proposed which text. */
export interface SuggestionRound {
  readonly by: SuggestionSide;
  readonly createdAt: string;
  readonly text: string;
  readonly userId: string;
}

/** Who acts on a suggestion: the policy's authors, or a reviewer on its run. */
export type SuggestionSide = "AUTHOR" | "REVIEWER";

/** A template selectable as a default or for a new draft. */
export interface Template {
  readonly code: string;
  readonly id: string;
  readonly name: string;
  readonly ownerCategoryId: null | string;
  readonly retiredAt: null | string;
  /** The latest of a rename and any version of the template being created or published
   *  (RFC 3339); null when the service has no time for it. */
  readonly updatedAt?: null | string;
}

/** A template's newest version with its section outline, as the editor scaffolds from it. */
export type TemplateVersion = NonNullable<LatestTemplateVersionQuery["latestTemplateVersion"]>;

/** One admin user-directory row: the gateway's `User`, trimmed to what the directory reads. */
export type User = UserFieldsFragment;
export type UserLabel = SearchUsersQuery["searchUsers"][number];

export interface UserPage {
  readonly nextPageToken: string;
  readonly users: readonly User[];
}

/**
 * How a version's change type came about (#390). The suggestion is core's; the pick is the
 * author's. A pick below the suggestion waits for the first approval stage, so `requested`
 * shows until it applies, and `agreedByUserIds` names the approvers who agreed.
 */
export interface VersionChangeInfo {
  readonly agreedByUserIds: readonly string[];
  /** What the version publishes as; for a draft, what it would publish as now. */
  readonly changeType: null | VersionChange;
  readonly reason: null | string;
  /** A lowering the approvers have not yet agreed to. */
  readonly requestedChangeType: null | VersionChange;
  readonly setByUserId: null | string;
  readonly suggestedChangeType: null | VersionChange;
}

/** One version's body and appendices, as the reader draws them. */
export interface VersionDocument {
  readonly appendices: readonly PolicyAppendix[];
  readonly blocks: readonly DocumentBlock[];
  /** The version's stored editor document, for the review page's commenting view. */
  readonly contentJson: string;
  readonly version: string;
  /** How the version's change type came about (#390), with the name for each user id in it. */
  readonly versionChange?: VersionChangeInfo;
  readonly versionChangeNames?: Readonly<Record<string, string>>;
  /** The version's ordinal, which the semantic `version` sits beside. */
  readonly versionNo?: number;
}

/**
 * What one version of a policy or procedure links to from the libraries: definitions
 * (alphabetical), related policies with a relationship type, references and contacts (in the
 * order the author gave). `editable` is whether the caller can change them now.
 */
export type VersionLinks = VersionLinksFieldsFragment;

/** A workflow definition selectable as a category's default. */
export interface Workflow {
  readonly id: string;
  readonly name: string;
}

/** A workflow definition's full detail: its ordered approval stages, for admin management. */
export type WorkflowDef = NonNullable<WorkflowDefQuery["workflowDef"]>;

/** One stage of a workflow definition's approval chain. */
export type WorkflowStageDef = WorkflowDef["stages"][number];

/**
 * A run's approval status as the queries read it. The schema's seat also carries `veto`, which
 * the status query leaves out (it is read on its own, see `runVetoes`), so it is not required here.
 */
export type WorkflowStatus = {
  readonly stageAssignees: readonly (readonly Omit<StageAssignee, "veto">[])[];
} & Omit<GeneratedWorkflowStatus, "stageAssignees">;
