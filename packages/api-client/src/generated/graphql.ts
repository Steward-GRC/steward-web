/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import type * as Types from "./schema";

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type AcknowledgePolicyMutationVariables = Exact<{
  policyVersionId: string | number;
}>;

export type AcknowledgePolicyMutation = {
  readonly acknowledgePolicy: {
    readonly acknowledged: boolean;
    readonly ackedAt: string | null;
    readonly required: boolean;
  };
};

export type BreakGlassRevealMutationVariables = Exact<{
  policyId: string | number;
  reason: string;
}>;

export type BreakGlassRevealMutation = {
  readonly breakGlassReveal: { readonly grantedUntil: string };
};

export type CategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type CategoriesQuery = {
  readonly categories: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly subcategories: ReadonlyArray<string>;
  }>;
};

export type DeleteUserMutationVariables = Exact<{
  userId: string | number;
}>;

export type DeleteUserMutation = {
  readonly deleteUser: { readonly userId: string; readonly revokedSessions: number };
};

export type DiagnosticsQueryVariables = Exact<{ [key: string]: never }>;

export type DiagnosticsQuery = {
  readonly diagnostics: {
    readonly generatedAt: string;
    readonly traceId: string;
    readonly release: string | null;
    readonly appliance: string | null;
    readonly actor: {
      readonly id: string;
      readonly username: string;
      readonly roles: ReadonlyArray<string>;
      readonly actingAs: {
        readonly id: string;
        readonly username: string;
        readonly roles: ReadonlyArray<string>;
      } | null;
    };
    readonly gateway: {
      readonly name: string;
      readonly version: string;
      readonly commit: string | null;
      readonly status: Types.ComponentStatus;
    };
    readonly services: ReadonlyArray<{
      readonly name: string;
      readonly version: string;
      readonly commit: string | null;
      readonly status: Types.ComponentStatus;
    }>;
    readonly thirdParty: ReadonlyArray<{
      readonly name: string;
      readonly version: string;
      readonly commit: string | null;
      readonly status: Types.ComponentStatus;
    }>;
  };
};

export type DisableUserMutationVariables = Exact<{
  userId: string | number;
}>;

export type DisableUserMutation = {
  readonly disableUser: {
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly adGroups: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
  };
};

export type EnableUserMutationVariables = Exact<{
  userId: string | number;
}>;

export type EnableUserMutation = {
  readonly enableUser: {
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly adGroups: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
  };
};

export type GrantRoleMutationVariables = Exact<{
  userId: string | number;
  role: string;
}>;

export type GrantRoleMutation = {
  readonly grantRole: {
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly adGroups: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
  };
};

export type ListUserSessionsQueryVariables = Exact<{
  userId: string | number;
}>;

export type ListUserSessionsQuery = {
  readonly listUserSessions: ReadonlyArray<{
    readonly sessionId: string;
    readonly issuedAt: string;
    readonly lastSeenAt: string;
    readonly expiresAt: string;
    readonly revokedAt: string | null;
    readonly clientIp: string;
    readonly userAgent: string;
  }>;
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  readonly me: {
    readonly id: string;
    readonly username: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly roles: ReadonlyArray<string>;
    readonly permissions: ReadonlyArray<string>;
  } | null;
};

export type PoliciesQueryVariables = Exact<{
  documentType: Types.DocumentType;
}>;

export type PoliciesQuery = {
  readonly policies: ReadonlyArray<{
    readonly id: string;
    readonly number: string;
    readonly title: string;
    readonly category: string;
    readonly subcategory: string;
    readonly sensitivity: Types.Sensitivity;
    readonly status: Types.PolicyStatus;
    readonly version: string;
    readonly updated: string;
    readonly documentType: Types.DocumentType;
  }>;
};

export type PolicyDetailQueryVariables = Exact<{
  documentType: Types.DocumentType;
  number: string;
}>;

export type PolicyDetailQuery = {
  readonly policyDetail: {
    readonly id: string;
    readonly number: string;
    readonly title: string;
    readonly documentType: Types.DocumentType;
    readonly category: string;
    readonly subcategory: string;
    readonly sensitivity: Types.Sensitivity;
    readonly status: Types.PolicyStatus;
    readonly version: string;
    readonly ownerName: string | null;
    readonly published: string | null;
    readonly updated: string;
    readonly bodyText: string;
    readonly contentObfuscated: boolean;
    readonly canBreakGlass: boolean;
    readonly currentVersionId: string | null;
    readonly ack: {
      readonly acknowledged: boolean;
      readonly ackedAt: string | null;
      readonly required: boolean;
    } | null;
    readonly appendices: ReadonlyArray<{
      readonly id: string;
      readonly letter: string;
      readonly title: string;
      readonly text: string;
    }>;
    readonly definitions: ReadonlyArray<{
      readonly id: string;
      readonly term: string;
      readonly definition: string;
    }>;
    readonly related: ReadonlyArray<{
      readonly policyId: string;
      readonly number: string;
      readonly title: string;
    }>;
    readonly references: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly kind: Types.ReferenceKind;
      readonly clause: string | null;
      readonly body: string | null;
      readonly url: string | null;
    }>;
    readonly contacts: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly name: string | null;
      readonly role: string | null;
      readonly department: string | null;
      readonly email: string | null;
      readonly phone: string | null;
      readonly hours: string | null;
      readonly notes: string | null;
    }>;
    readonly history: ReadonlyArray<{
      readonly kind: string;
      readonly versionLabel: string;
      readonly stage: string | null;
      readonly actorName: string | null;
      readonly comment: string | null;
      readonly at: string;
    }>;
    readonly priorVersion: {
      readonly version: string;
      readonly diff: ReadonlyArray<{
        readonly sectionKey: string;
        readonly sectionTitle: string;
        readonly changeType: string;
        readonly wordDiffHtml: string | null;
      }>;
    } | null;
  } | null;
};

export type PreviewUserDeletionQueryVariables = Exact<{
  userId: string | number;
}>;

export type PreviewUserDeletionQuery = {
  readonly previewUserDeletion: {
    readonly userId: string;
    readonly blocksDelete: boolean;
    readonly locallyAuthenticable: boolean;
    readonly counts: {
      readonly pendingApprovals: number;
      readonly ownedPolicies: number;
      readonly raciGrants: number;
      readonly roles: number;
      readonly accessRows: number;
    };
    readonly items: ReadonlyArray<{
      readonly kind: Types.DeletionItemKind;
      readonly refId: string;
      readonly label: string;
      readonly detail: string;
      readonly blocksDelete: boolean;
    }>;
    readonly warnings: ReadonlyArray<{ readonly code: string; readonly message: string }>;
  };
};

export type RevokeRoleMutationVariables = Exact<{
  userId: string | number;
  role: string;
}>;

export type RevokeRoleMutation = {
  readonly revokeRole: {
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly adGroups: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
  };
};

export type RevokeUserSessionsMutationVariables = Exact<{
  userId: string | number;
  reason?: string | null | undefined;
}>;

export type RevokeUserSessionsMutation = { readonly revokeUserSessions: number };

export type UpdateMyProfileMutationVariables = Exact<{
  firstName: string;
  lastName: string;
}>;

export type UpdateMyProfileMutation = {
  readonly updateMyProfile: {
    readonly id: string;
    readonly username: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly roles: ReadonlyArray<string>;
    readonly permissions: ReadonlyArray<string>;
  };
};

export type UpdateUserProfileMutationVariables = Exact<{
  userId: string | number;
  name: string;
  email: string;
}>;

export type UpdateUserProfileMutation = {
  readonly updateUserProfile: {
    readonly userId: string;
    readonly name: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly enabled: boolean;
    readonly roles: ReadonlyArray<string>;
    readonly adGroups: ReadonlyArray<string>;
    readonly isRoot: boolean;
    readonly localAccount: boolean;
    readonly username: string;
    readonly deletedAt: string | null;
    readonly mergedIntoUserId: string | null;
  };
};

export type UserFieldsFragment = {
  readonly userId: string;
  readonly name: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly enabled: boolean;
  readonly roles: ReadonlyArray<string>;
  readonly adGroups: ReadonlyArray<string>;
  readonly isRoot: boolean;
  readonly localAccount: boolean;
  readonly username: string;
  readonly deletedAt: string | null;
  readonly mergedIntoUserId: string | null;
};

export type UsersQueryVariables = Exact<{
  search?: string | null | undefined;
  includeDeleted?: boolean | null | undefined;
}>;

export type UsersQuery = {
  readonly users: {
    readonly nextPageToken: string;
    readonly users: ReadonlyArray<{
      readonly userId: string;
      readonly name: string;
      readonly firstName: string;
      readonly lastName: string;
      readonly email: string;
      readonly enabled: boolean;
      readonly roles: ReadonlyArray<string>;
      readonly adGroups: ReadonlyArray<string>;
      readonly isRoot: boolean;
      readonly localAccount: boolean;
      readonly username: string;
      readonly deletedAt: string | null;
      readonly mergedIntoUserId: string | null;
    }>;
  };
};

export const UserFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "adGroups" } },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserFieldsFragment, unknown>;
export const AcknowledgePolicyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AcknowledgePolicy" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "acknowledgePolicy" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyVersionId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyVersionId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "acknowledged" } },
                { kind: "Field", name: { kind: "Name", value: "ackedAt" } },
                { kind: "Field", name: { kind: "Name", value: "required" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AcknowledgePolicyMutation, AcknowledgePolicyMutationVariables>;
export const BreakGlassRevealDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "BreakGlassReveal" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reason" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "breakGlassReveal" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "policyId" },
                value: { kind: "Variable", name: { kind: "Name", value: "policyId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reason" },
                value: { kind: "Variable", name: { kind: "Name", value: "reason" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "grantedUntil" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BreakGlassRevealMutation, BreakGlassRevealMutationVariables>;
export const CategoriesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Categories" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "categories" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "slug" } },
                { kind: "Field", name: { kind: "Name", value: "subcategories" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CategoriesQuery, CategoriesQueryVariables>;
export const DeleteUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteUser" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteUser" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "revokedSessions" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteUserMutation, DeleteUserMutationVariables>;
export const DiagnosticsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Diagnostics" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "diagnostics" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "generatedAt" } },
                { kind: "Field", name: { kind: "Name", value: "traceId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "actor" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                      { kind: "Field", name: { kind: "Name", value: "roles" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "actingAs" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "username" } },
                            { kind: "Field", name: { kind: "Name", value: "roles" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "gateway" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      { kind: "Field", name: { kind: "Name", value: "commit" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "release" } },
                { kind: "Field", name: { kind: "Name", value: "appliance" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "services" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      { kind: "Field", name: { kind: "Name", value: "commit" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "thirdParty" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      { kind: "Field", name: { kind: "Name", value: "commit" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DiagnosticsQuery, DiagnosticsQueryVariables>;
export const DisableUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DisableUser" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "disableUser" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "adGroups" } },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DisableUserMutation, DisableUserMutationVariables>;
export const EnableUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "EnableUser" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "enableUser" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "adGroups" } },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EnableUserMutation, EnableUserMutationVariables>;
export const GrantRoleDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "GrantRole" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "role" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "grantRole" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "role" },
                value: { kind: "Variable", name: { kind: "Name", value: "role" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "adGroups" } },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GrantRoleMutation, GrantRoleMutationVariables>;
export const ListUserSessionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ListUserSessions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "listUserSessions" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
                { kind: "Field", name: { kind: "Name", value: "issuedAt" } },
                { kind: "Field", name: { kind: "Name", value: "lastSeenAt" } },
                { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
                { kind: "Field", name: { kind: "Name", value: "revokedAt" } },
                { kind: "Field", name: { kind: "Name", value: "clientIp" } },
                { kind: "Field", name: { kind: "Name", value: "userAgent" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListUserSessionsQuery, ListUserSessionsQueryVariables>;
export const MeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Me" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "firstName" } },
                { kind: "Field", name: { kind: "Name", value: "lastName" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "roles" } },
                { kind: "Field", name: { kind: "Name", value: "permissions" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const PoliciesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Policies" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "documentType" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "DocumentType" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "policies" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "documentType" },
                value: { kind: "Variable", name: { kind: "Name", value: "documentType" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "subcategory" } },
                { kind: "Field", name: { kind: "Name", value: "sensitivity" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "version" } },
                { kind: "Field", name: { kind: "Name", value: "updated" } },
                { kind: "Field", name: { kind: "Name", value: "documentType" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PoliciesQuery, PoliciesQueryVariables>;
export const PolicyDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PolicyDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "documentType" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "DocumentType" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "number" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "policyDetail" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "documentType" },
                value: { kind: "Variable", name: { kind: "Name", value: "documentType" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: { kind: "Variable", name: { kind: "Name", value: "number" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "documentType" } },
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "subcategory" } },
                { kind: "Field", name: { kind: "Name", value: "sensitivity" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "version" } },
                { kind: "Field", name: { kind: "Name", value: "ownerName" } },
                { kind: "Field", name: { kind: "Name", value: "published" } },
                { kind: "Field", name: { kind: "Name", value: "updated" } },
                { kind: "Field", name: { kind: "Name", value: "bodyText" } },
                { kind: "Field", name: { kind: "Name", value: "contentObfuscated" } },
                { kind: "Field", name: { kind: "Name", value: "canBreakGlass" } },
                { kind: "Field", name: { kind: "Name", value: "currentVersionId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "ack" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "acknowledged" } },
                      { kind: "Field", name: { kind: "Name", value: "ackedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "required" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "appendices" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "letter" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "text" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "definitions" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "term" } },
                      { kind: "Field", name: { kind: "Name", value: "definition" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "related" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "policyId" } },
                      { kind: "Field", name: { kind: "Name", value: "number" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "references" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      { kind: "Field", name: { kind: "Name", value: "kind" } },
                      { kind: "Field", name: { kind: "Name", value: "clause" } },
                      { kind: "Field", name: { kind: "Name", value: "body" } },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "contacts" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      { kind: "Field", name: { kind: "Name", value: "department" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                      { kind: "Field", name: { kind: "Name", value: "phone" } },
                      { kind: "Field", name: { kind: "Name", value: "hours" } },
                      { kind: "Field", name: { kind: "Name", value: "notes" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "history" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "kind" } },
                      { kind: "Field", name: { kind: "Name", value: "versionLabel" } },
                      { kind: "Field", name: { kind: "Name", value: "stage" } },
                      { kind: "Field", name: { kind: "Name", value: "actorName" } },
                      { kind: "Field", name: { kind: "Name", value: "comment" } },
                      { kind: "Field", name: { kind: "Name", value: "at" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "priorVersion" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "diff" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "sectionKey" } },
                            { kind: "Field", name: { kind: "Name", value: "sectionTitle" } },
                            { kind: "Field", name: { kind: "Name", value: "changeType" } },
                            { kind: "Field", name: { kind: "Name", value: "wordDiffHtml" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PolicyDetailQuery, PolicyDetailQueryVariables>;
export const PreviewUserDeletionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PreviewUserDeletion" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "previewUserDeletion" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "blocksDelete" } },
                { kind: "Field", name: { kind: "Name", value: "locallyAuthenticable" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "counts" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "pendingApprovals" } },
                      { kind: "Field", name: { kind: "Name", value: "ownedPolicies" } },
                      { kind: "Field", name: { kind: "Name", value: "raciGrants" } },
                      { kind: "Field", name: { kind: "Name", value: "roles" } },
                      { kind: "Field", name: { kind: "Name", value: "accessRows" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "kind" } },
                      { kind: "Field", name: { kind: "Name", value: "refId" } },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      { kind: "Field", name: { kind: "Name", value: "detail" } },
                      { kind: "Field", name: { kind: "Name", value: "blocksDelete" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "warnings" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "code" } },
                      { kind: "Field", name: { kind: "Name", value: "message" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PreviewUserDeletionQuery, PreviewUserDeletionQueryVariables>;
export const RevokeRoleDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RevokeRole" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "role" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "revokeRole" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "role" },
                value: { kind: "Variable", name: { kind: "Name", value: "role" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "adGroups" } },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RevokeRoleMutation, RevokeRoleMutationVariables>;
export const RevokeUserSessionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RevokeUserSessions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reason" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "revokeUserSessions" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reason" },
                value: { kind: "Variable", name: { kind: "Name", value: "reason" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RevokeUserSessionsMutation, RevokeUserSessionsMutationVariables>;
export const UpdateMyProfileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateMyProfile" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "firstName" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "lastName" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateMyProfile" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "firstName" },
                value: { kind: "Variable", name: { kind: "Name", value: "firstName" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "lastName" },
                value: { kind: "Variable", name: { kind: "Name", value: "lastName" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "firstName" } },
                { kind: "Field", name: { kind: "Name", value: "lastName" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "roles" } },
                { kind: "Field", name: { kind: "Name", value: "permissions" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>;
export const UpdateUserProfileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateUserProfile" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "email" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateUserProfile" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "userId" },
                value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: { kind: "Variable", name: { kind: "Name", value: "name" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "email" },
                value: { kind: "Variable", name: { kind: "Name", value: "email" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "adGroups" } },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;
export const UsersDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Users" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "search" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "includeDeleted" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "users" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "search" },
                value: { kind: "Variable", name: { kind: "Name", value: "search" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "pageSize" },
                value: { kind: "IntValue", value: "200" },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "includeDeleted" },
                value: { kind: "Variable", name: { kind: "Name", value: "includeDeleted" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "nextPageToken" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "users" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "userId" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "enabled" } },
          { kind: "Field", name: { kind: "Name", value: "roles" } },
          { kind: "Field", name: { kind: "Name", value: "adGroups" } },
          { kind: "Field", name: { kind: "Name", value: "isRoot" } },
          { kind: "Field", name: { kind: "Name", value: "localAccount" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "deletedAt" } },
          { kind: "Field", name: { kind: "Name", value: "mergedIntoUserId" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
