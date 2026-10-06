/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import type * as Types from "./schema";

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type CategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type CategoriesQuery = {
  readonly categories: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly subcategories: ReadonlyArray<string>;
  }>;
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
