export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /**
   * Vendored slice of the gateway schema. Steward's own gateway is not ported yet, so this
   * file is hand-pinned from the original gateway's v3.0.0 SDL (see ../schema-refs.env),
   * trimmed to the operations steward-web actually sends: the signed-in user, the
   * diagnostics report, editing one's own display name, the policy/procedure library browse
   * (categories and the catalog), and the admin user directory. It gains more of the
   * upstream schema as later ports add operations, and schema-generate.sh switches from this
   * vendored copy to a live fetch once steward-gateway publishes its own schema on its main
   * branch.
   *
   * Identity-provider-specific wording in the original schema's descriptions is dropped (Steward
   * signs in through Ory Kratos); nothing else about the shape of these operations has changed.
   *
   * `Category` and the `Policy` fields below are the library's own aggregated view, not a
   * 1:1 lift of the original `Group`/`Policy`/`PolicyVersion` split: the original computed a
   * policy's display category, status and version by walking its home group's ancestor chain
   * and its version history. steward-gateway is pinned to return that same aggregated shape
   * once it ports the query; `Sensitivity` and `DocumentType` are the original enums unchanged.
   *
   * `PolicyDetail` is the reader's own aggregated view, for the same reason: steward-gateway's
   * real schema answers a policy's content, appendices, related/reference/contact/definition
   * attachments, acknowledgement state and history through several separate reads (`policy`,
   * `policyVersion`, `relatedPolicies`, `policyReferences`, `policyContactBlocks`,
   * `policyDefinitionEntries`, `ackStatus`, `assignmentHistory`, `workflowStatus`) keyed by
   * backend id, with no "find by number" lookup yet. `policyDetail` is this port's own
   * BFF-shaped aggregation (found by the number the library already links to), pending a
   * steward-gateway query that does the same. Document body and appendix content are plain
   * text here, not the original's rich Lexical JSON: no shared document renderer exists yet
   * (it lands with the authoring/editor area), so the reader shows a plain-text rendering
   * until one does.
   */
  DateTime: { input: string; output: string };
};

/** This caller's acknowledgement of one policy version. */
export type AckStatus = {
  readonly __typename?: "AckStatus";
  readonly ackedAt?: Maybe<Scalars["DateTime"]["output"]>;
  readonly acknowledged: Scalars["Boolean"]["output"];
  /** True when this caller is in the ack audience at all; false means no banner is shown. */
  readonly required: Scalars["Boolean"]["output"];
};

export type BreakGlassGrant = {
  readonly __typename?: "BreakGlassGrant";
  readonly grantedUntil: Scalars["DateTime"]["output"];
};

/** A category (and its subcategories) in the policy/procedure taxonomy. */
export type Category = {
  readonly __typename?: "Category";
  readonly id: Scalars["ID"]["output"];
  readonly name: Scalars["String"]["output"];
  readonly slug: Scalars["String"]["output"];
  readonly subcategories: ReadonlyArray<Scalars["String"]["output"]>;
};

export enum ComponentStatus {
  Ok = "OK",
  Unavailable = "UNAVAILABLE",
}

export type ComponentVersion = {
  readonly __typename?: "ComponentVersion";
  readonly commit?: Maybe<Scalars["String"]["output"]>;
  readonly name: Scalars["String"]["output"];
  readonly status: ComponentStatus;
  /** "unavailable" or "unknown" when it can't be read. */
  readonly version: Scalars["String"]["output"];
};

/** Result of deleteUser: the deleted user's id and how many active sessions were revoked. */
export type DeleteUserResult = {
  readonly __typename?: "DeleteUserResult";
  readonly revokedSessions: Scalars["Int"]["output"];
  readonly userId: Scalars["ID"]["output"];
};

/**
 * What a deletion preview line represents. A delete has no target account, so nothing moves:
 * each kind is blocked, orphaned or removed.
 */
export enum DeletionItemKind {
  AccessRow = "ACCESS_ROW",
  Credential = "CREDENTIAL",
  OwnedPolicy = "OWNED_POLICY",
  PendingApproval = "PENDING_APPROVAL",
  RaciGrant = "RACI_GRANT",
}

export type Diagnostics = {
  readonly __typename?: "Diagnostics";
  readonly actor: DiagnosticsActor;
  /** The appliance version, read from an optional mount. Null when not on the appliance. */
  readonly appliance?: Maybe<Scalars["String"]["output"]>;
  readonly gateway: ComponentVersion;
  readonly generatedAt: Scalars["DateTime"]["output"];
  /** The pinned release version. Null when unknown. */
  readonly release?: Maybe<Scalars["String"]["output"]>;
  readonly services: ReadonlyArray<ComponentVersion>;
  readonly thirdParty: ReadonlyArray<ComponentVersion>;
  /** This read's own trace id. */
  readonly traceId: Scalars["String"]["output"];
};

export type DiagnosticsActingAs = {
  readonly __typename?: "DiagnosticsActingAs";
  readonly id: Scalars["ID"]["output"];
  readonly roles: ReadonlyArray<Scalars["String"]["output"]>;
  readonly username: Scalars["String"]["output"];
};

export type DiagnosticsActor = {
  readonly __typename?: "DiagnosticsActor";
  /** Set during act-as: the user the real admin is acting as. */
  readonly actingAs?: Maybe<DiagnosticsActingAs>;
  readonly id: Scalars["ID"]["output"];
  readonly roles: ReadonlyArray<Scalars["String"]["output"]>;
  readonly username: Scalars["String"]["output"];
};

/** Policy vs procedure (core#26 in the original). Procedures carry no acknowledgement. */
export enum DocumentType {
  Policy = "POLICY",
  Procedure = "PROCEDURE",
}

/** One append-only event in a policy's combined publish-and-approval history (U18): submitted, a stage decision, published, changes requested, or withdrawn. */
export type HistoryEntry = {
  readonly __typename?: "HistoryEntry";
  readonly actorName?: Maybe<Scalars["String"]["output"]>;
  readonly at: Scalars["DateTime"]["output"];
  readonly comment?: Maybe<Scalars["String"]["output"]>;
  readonly kind: Scalars["String"]["output"];
  readonly stage?: Maybe<Scalars["String"]["output"]>;
  readonly versionLabel: Scalars["String"]["output"];
};

/** The facts about the signed-in user that drive identity and permission checks. */
export type Me = {
  readonly __typename?: "Me";
  readonly email: Scalars["String"]["output"];
  /** Structured given name; empty when the identity provider sent none and the user hasn't set it. */
  readonly firstName: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
  /** Structured family name; empty when the identity provider sent none and the user hasn't set it. */
  readonly lastName: Scalars["String"]["output"];
  readonly name: Scalars["String"]["output"];
  readonly permissions: ReadonlyArray<Scalars["String"]["output"]>;
  readonly roles: ReadonlyArray<Scalars["String"]["output"]>;
  readonly username: Scalars["String"]["output"];
};

export type Mutation = {
  readonly __typename?: "Mutation";
  /** Records the CALLING user's acknowledgement of a published policy version. Refused when the caller isn't in the ack audience, or the version isn't published. */
  readonly acknowledgePolicy: AckStatus;
  /** A site admin's time-boxed, audited reveal of a sensitive policy's real content. A non-empty reason is required; the grant is recorded for audit. */
  readonly breakGlassReveal: BreakGlassGrant;
  /**
   * Soft-deletes a user: revokes their sessions and drops their access. Never deletes a policy
   * they own; deleteUser is refused while previewUserDeletion reports blocksDelete. Site-admin
   * only.
   */
  readonly deleteUser: DeleteUserResult;
  readonly disableUser: User;
  readonly enableUser: User;
  /** Grants a GLOBAL role (no category). Site-admin only. */
  readonly grantRole: User;
  /** Revokes a GLOBAL role (no category). Site-admin only. */
  readonly revokeRole: User;
  /** Revokes every active session for a user, signing them out everywhere. Site-admin only. */
  readonly revokeUserSessions: Scalars["Int"]["output"];
  /** Edits the CALLING user's own name. Refused when signed out. */
  readonly updateMyProfile: Me;
  /** Edits another user's name and email. Local (non-federated) accounts only, site-admin only. */
  readonly updateUserProfile: User;
};

export type MutationAcknowledgePolicyArgs = {
  policyVersionId: Scalars["ID"]["input"];
};

export type MutationBreakGlassRevealArgs = {
  policyId: Scalars["ID"]["input"];
  reason: Scalars["String"]["input"];
};

export type MutationDeleteUserArgs = {
  userId: Scalars["ID"]["input"];
};

export type MutationDisableUserArgs = {
  userId: Scalars["ID"]["input"];
};

export type MutationEnableUserArgs = {
  userId: Scalars["ID"]["input"];
};

export type MutationGrantRoleArgs = {
  role: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationRevokeRoleArgs = {
  role: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationRevokeUserSessionsArgs = {
  reason?: InputMaybe<Scalars["String"]["input"]>;
  userId: Scalars["ID"]["input"];
};

export type MutationUpdateMyProfileArgs = {
  firstName: Scalars["String"]["input"];
  lastName: Scalars["String"]["input"];
};

export type MutationUpdateUserProfileArgs = {
  email: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

/** One row of the policy/procedure library catalog. */
export type Policy = {
  readonly __typename?: "Policy";
  readonly category: Scalars["String"]["output"];
  readonly documentType: DocumentType;
  readonly id: Scalars["ID"]["output"];
  readonly number: Scalars["String"]["output"];
  readonly sensitivity: Sensitivity;
  readonly status: PolicyStatus;
  readonly subcategory: Scalars["String"]["output"];
  readonly title: Scalars["String"]["output"];
  /** When the current version was last updated. */
  readonly updated: Scalars["DateTime"]["output"];
  readonly version: Scalars["String"]["output"];
};

export type PolicyAppendix = {
  readonly __typename?: "PolicyAppendix";
  readonly id: Scalars["ID"]["output"];
  readonly letter: Scalars["String"]["output"];
  readonly text: Scalars["String"]["output"];
  readonly title: Scalars["String"]["output"];
};

/** A reusable contact block attached to this policy (U16). */
export type PolicyContact = {
  readonly __typename?: "PolicyContact";
  readonly department?: Maybe<Scalars["String"]["output"]>;
  readonly email?: Maybe<Scalars["String"]["output"]>;
  readonly hours?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["ID"]["output"];
  readonly label: Scalars["String"]["output"];
  readonly name?: Maybe<Scalars["String"]["output"]>;
  readonly notes?: Maybe<Scalars["String"]["output"]>;
  readonly phone?: Maybe<Scalars["String"]["output"]>;
  readonly role?: Maybe<Scalars["String"]["output"]>;
};

/** A reusable glossary entry attached to this policy (the original's PolicyDefinitions, U13). */
export type PolicyDefinition = {
  readonly __typename?: "PolicyDefinition";
  readonly definition: Scalars["String"]["output"];
  readonly id: Scalars["ID"]["output"];
  readonly term: Scalars["String"]["output"];
};

/** The reader's full view of one policy or procedure (U7 in the original design). */
export type PolicyDetail = {
  readonly __typename?: "PolicyDetail";
  /** This caller's acknowledgement of the current published version, when the document carries acknowledgement at all. */
  readonly ack?: Maybe<AckStatus>;
  /** The appendix list of the current version (published, or the working draft when there is no published version yet). */
  readonly appendices: ReadonlyArray<PolicyAppendix>;
  readonly bodyText: Scalars["String"]["output"];
  readonly canBreakGlass: Scalars["Boolean"]["output"];
  readonly category: Scalars["String"]["output"];
  readonly contacts: ReadonlyArray<PolicyContact>;
  /** True while this caller sees the body and panels below obfuscated, because they are outside the policy's sensitive read audience. */
  readonly contentObfuscated: Scalars["Boolean"]["output"];
  /** The current version's id, for `acknowledgePolicy`. Null when there is no published version yet. */
  readonly currentVersionId?: Maybe<Scalars["ID"]["output"]>;
  readonly definitions: ReadonlyArray<PolicyDefinition>;
  readonly documentType: DocumentType;
  readonly history: ReadonlyArray<HistoryEntry>;
  readonly id: Scalars["ID"]["output"];
  readonly number: Scalars["String"]["output"];
  /** Resolved from the owning user; null when the lookup is unavailable. */
  readonly ownerName?: Maybe<Scalars["String"]["output"]>;
  /** A summary of the current version against the one it superseded. Null for a first version. */
  readonly priorVersion?: Maybe<PolicyVersionSummary>;
  readonly published?: Maybe<Scalars["DateTime"]["output"]>;
  readonly references: ReadonlyArray<PolicyReference>;
  readonly related: ReadonlyArray<RelatedPolicy>;
  readonly sensitivity: Sensitivity;
  readonly status: PolicyStatus;
  readonly subcategory: Scalars["String"]["output"];
  readonly title: Scalars["String"]["output"];
  readonly updated: Scalars["DateTime"]["output"];
  readonly version: Scalars["String"]["output"];
};

/** A references/standards entry attached to this policy (U15). */
export type PolicyReference = {
  readonly __typename?: "PolicyReference";
  readonly body?: Maybe<Scalars["String"]["output"]>;
  readonly clause?: Maybe<Scalars["String"]["output"]>;
  readonly id: Scalars["ID"]["output"];
  readonly kind: ReferenceKind;
  readonly label: Scalars["String"]["output"];
  readonly url?: Maybe<Scalars["String"]["output"]>;
};

export type PolicySectionDiff = {
  readonly __typename?: "PolicySectionDiff";
  readonly changeType: Scalars["String"]["output"];
  readonly sectionKey: Scalars["String"]["output"];
  readonly sectionTitle: Scalars["String"]["output"];
  readonly wordDiffHtml?: Maybe<Scalars["String"]["output"]>;
};

export enum PolicyStatus {
  Draft = "DRAFT",
  InReview = "IN_REVIEW",
  Published = "PUBLISHED",
  Rejected = "REJECTED",
  Superseded = "SUPERSEDED",
  Withdrawn = "WITHDRAWN",
}

/** The diff between the current version and the one it superseded (U12/U19). */
export type PolicyVersionSummary = {
  readonly __typename?: "PolicyVersionSummary";
  readonly diff: ReadonlyArray<PolicySectionDiff>;
  readonly version: Scalars["String"]["output"];
};

export type Query = {
  readonly __typename?: "Query";
  /** The category tree for the policy/procedure library browse. Any signed-in user. */
  readonly categories: ReadonlyArray<Category>;
  /** Build and version facts for a bug report. Any signed-in user; refused when signed out. */
  readonly diagnostics: Diagnostics;
  /** A user's sessions, site-admin only. */
  readonly listUserSessions: ReadonlyArray<Session>;
  /** The signed-in user, from the verified session. Null when signed out. */
  readonly me?: Maybe<Me>;
  /** The library catalog for one document type. Any signed-in user. */
  readonly policies: ReadonlyArray<Policy>;
  /** The reader's full detail for one policy/procedure, found by number. Null when there is no such document, or the caller cannot see it at all. */
  readonly policyDetail?: Maybe<PolicyDetail>;
  /**
   * A read-only dry run of deleteUser for the delete confirmation screen: what the delete would
   * block on, orphan or drop. Site-admin only.
   */
  readonly previewUserDeletion: UserDeletionPreview;
  /**
   * The platform's users, site-admin only. search filters by email substring; includeDeleted
   * also returns tombstoned accounts.
   */
  readonly users: UserPage;
};

export type QueryListUserSessionsArgs = {
  userId: Scalars["ID"]["input"];
};

export type QueryPoliciesArgs = {
  documentType: DocumentType;
};

export type QueryPolicyDetailArgs = {
  documentType: DocumentType;
  number: Scalars["String"]["input"];
};

export type QueryPreviewUserDeletionArgs = {
  userId: Scalars["ID"]["input"];
};

export type QueryUsersArgs = {
  includeDeleted?: InputMaybe<Scalars["Boolean"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
  pageToken?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
};

export enum ReferenceKind {
  Link = "LINK",
  Standard = "STANDARD",
  Text = "TEXT",
}

/** A structured link to another policy (U14). One-way; the link target's own number and title are resolved live. */
export type RelatedPolicy = {
  readonly __typename?: "RelatedPolicy";
  readonly number: Scalars["String"]["output"];
  readonly policyId: Scalars["ID"]["output"];
  readonly title: Scalars["String"]["output"];
};

export enum Sensitivity {
  Sensitive = "SENSITIVE",
  Standard = "STANDARD",
}

export type Session = {
  readonly __typename?: "Session";
  readonly clientIp: Scalars["String"]["output"];
  readonly expiresAt: Scalars["String"]["output"];
  readonly issuedAt: Scalars["String"]["output"];
  readonly lastSeenAt: Scalars["String"]["output"];
  /** Null while the session is still active. */
  readonly revokedAt?: Maybe<Scalars["String"]["output"]>;
  readonly sessionId: Scalars["ID"]["output"];
  readonly userAgent: Scalars["String"]["output"];
};

/** One platform user. */
export type User = {
  readonly __typename?: "User";
  /** AD group names (membership source), read-only here. */
  readonly adGroups: ReadonlyArray<Scalars["String"]["output"]>;
  /** Tombstone time for a soft-deleted account. Null for a live account. */
  readonly deletedAt?: Maybe<Scalars["String"]["output"]>;
  readonly email: Scalars["String"]["output"];
  readonly enabled: Scalars["Boolean"]["output"];
  /** Structured given name; empty when the identity provider sent none and the user hasn't set it. */
  readonly firstName: Scalars["String"]["output"];
  /** The protected root site-admin; can't be disabled or stripped of site-admin. */
  readonly isRoot: Scalars["Boolean"]["output"];
  /** Structured family name; empty when the identity provider sent none and the user hasn't set it. */
  readonly lastName: Scalars["String"]["output"];
  /** True when the account was created locally (lldap-backed); false when federated (SSO). */
  readonly localAccount: Scalars["Boolean"]["output"];
  /** The surviving account a merged-away row now points at. Null unless the account was merged. */
  readonly mergedIntoUserId?: Maybe<Scalars["ID"]["output"]>;
  readonly name: Scalars["String"]["output"];
  /** Global elevated roles; the Reader baseline is implicit and never listed. */
  readonly roles: ReadonlyArray<Scalars["String"]["output"]>;
  readonly userId: Scalars["ID"]["output"];
  /** Login handle; for SSO/JIT accounts derived from the email local part. */
  readonly username: Scalars["String"]["output"];
};

export type UserDeletionCounts = {
  readonly __typename?: "UserDeletionCounts";
  readonly accessRows: Scalars["Int"]["output"];
  readonly ownedPolicies: Scalars["Int"]["output"];
  readonly pendingApprovals: Scalars["Int"]["output"];
  readonly raciGrants: Scalars["Int"]["output"];
  readonly roles: Scalars["Int"]["output"];
};

/**
 * Read-only projection of deleting userId. blocksDelete is true when deleteUser would refuse
 * right now. locallyAuthenticable reports whether the account can sign in without the identity
 * provider today.
 */
export type UserDeletionPreview = {
  readonly __typename?: "UserDeletionPreview";
  readonly blocksDelete: Scalars["Boolean"]["output"];
  readonly counts: UserDeletionCounts;
  readonly items: ReadonlyArray<UserDeletionPreviewItem>;
  readonly locallyAuthenticable: Scalars["Boolean"]["output"];
  readonly userId: Scalars["ID"]["output"];
  readonly warnings: ReadonlyArray<UserDeletionWarning>;
};

/**
 * One reviewable line in the deletion preview. blocksDelete marks the rows that make deleteUser
 * refuse until they are cleared.
 */
export type UserDeletionPreviewItem = {
  readonly __typename?: "UserDeletionPreviewItem";
  readonly blocksDelete: Scalars["Boolean"]["output"];
  readonly detail: Scalars["String"]["output"];
  readonly kind: DeletionItemKind;
  readonly label: Scalars["String"]["output"];
  readonly refId: Scalars["ID"]["output"];
};

export type UserDeletionWarning = {
  readonly __typename?: "UserDeletionWarning";
  readonly code: Scalars["String"]["output"];
  readonly message: Scalars["String"]["output"];
};

export type UserPage = {
  readonly __typename?: "UserPage";
  readonly nextPageToken: Scalars["String"]["output"];
  readonly users: ReadonlyArray<User>;
};
