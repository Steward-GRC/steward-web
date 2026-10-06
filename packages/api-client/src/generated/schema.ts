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
   * diagnostics report, and editing one's own display name. It gains more of the upstream
   * schema as later ports add operations, and schema-generate.sh switches from this
   * vendored copy to a live fetch once steward-gateway publishes its own schema on its
   * main branch.
   *
   * Identity-provider-specific wording in the original schema's descriptions is dropped (Steward
   * signs in through Ory Kratos); nothing else about the shape of these operations has changed.
   */
  DateTime: { input: string; output: string };
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
  /** Edits the CALLING user's own name. Refused when signed out. */
  readonly updateMyProfile: Me;
};

export type MutationUpdateMyProfileArgs = {
  firstName: Scalars["String"]["input"];
  lastName: Scalars["String"]["input"];
};

export type Query = {
  readonly __typename?: "Query";
  /** Build and version facts for a bug report. Any signed-in user; refused when signed out. */
  readonly diagnostics: Diagnostics;
  /** The signed-in user, from the verified session. Null when signed out. */
  readonly me?: Maybe<Me>;
};
