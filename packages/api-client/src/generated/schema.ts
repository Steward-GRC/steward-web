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
   */
  DateTime: { input: string; output: string };
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

export enum PolicyStatus {
  Draft = "DRAFT",
  InReview = "IN_REVIEW",
  Published = "PUBLISHED",
  Rejected = "REJECTED",
  Superseded = "SUPERSEDED",
  Withdrawn = "WITHDRAWN",
}

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

export type QueryPreviewUserDeletionArgs = {
  userId: Scalars["ID"]["input"];
};

export type QueryUsersArgs = {
  includeDeleted?: InputMaybe<Scalars["Boolean"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
  pageToken?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
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
