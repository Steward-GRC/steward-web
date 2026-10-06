// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  ContactBlock,
  ContactBlockInput,
  DefinitionEntry,
  DefinitionEntryInput,
  Reference,
  ReferenceInput,
} from "@steward-web/api-client";

import { requireIdentityFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

/**
 * The three admin libraries sit behind sign-in only, the same as the rest of the admin app's
 * read surface: there is no dedicated permission for them. Who may CREATE or CURATE an entry is
 * a tri-admin-or-creator check the gateway enforces on the mutation; the route components use
 * `libraries.logic`'s `canCurate` against the signed-in identity to decide which controls to
 * show, not to gate the page itself.
 */
const requireSignedIn = (request: Request) => requireIdentityFromRequest(request);

export const listContactBlocks = async (request: Request): Promise<readonly ContactBlock[]> => {
  await requireSignedIn(request);
  return edge.contactBlocks(true, cookieOf(request));
};

export const createContactBlock = async (
  request: Request,
  input: ContactBlockInput,
): Promise<ContactBlock> => {
  await requireSignedIn(request);
  return edge.createContactBlock(input, cookieOf(request));
};

export const updateContactBlock = async (
  request: Request,
  id: string,
  input: ContactBlockInput,
): Promise<ContactBlock> => {
  await requireSignedIn(request);
  return edge.updateContactBlock(id, input, cookieOf(request));
};

export const setContactBlockArchived = async (
  request: Request,
  id: string,
  archived: boolean,
): Promise<ContactBlock> => {
  await requireSignedIn(request);
  return edge.setContactBlockArchived(id, archived, cookieOf(request));
};

export const listReferences = async (request: Request): Promise<readonly Reference[]> => {
  await requireSignedIn(request);
  return edge.references(true, cookieOf(request));
};

export const createReference = async (
  request: Request,
  input: ReferenceInput,
): Promise<Reference> => {
  await requireSignedIn(request);
  return edge.createReference(input, cookieOf(request));
};

export const updateReference = async (
  request: Request,
  id: string,
  input: ReferenceInput,
): Promise<Reference> => {
  await requireSignedIn(request);
  return edge.updateReference(id, input, cookieOf(request));
};

export const setReferenceArchived = async (
  request: Request,
  id: string,
  archived: boolean,
): Promise<Reference> => {
  await requireSignedIn(request);
  return edge.setReferenceArchived(id, archived, cookieOf(request));
};

export const deleteReference = async (request: Request, id: string): Promise<boolean> => {
  await requireSignedIn(request);
  return edge.deleteReference(id, cookieOf(request));
};

/** All categories' definitions; the page itself scopes to one category client-side (the
 *  category filter has no server round trip once the list is loaded). */
export const listDefinitions = async (request: Request): Promise<readonly DefinitionEntry[]> => {
  await requireSignedIn(request);
  return edge.definitions(null, true, cookieOf(request));
};

export const createDefinition = async (
  request: Request,
  input: DefinitionEntryInput,
): Promise<DefinitionEntry> => {
  await requireSignedIn(request);
  return edge.createDefinition(input, cookieOf(request));
};

export const updateDefinition = async (
  request: Request,
  id: string,
  input: DefinitionEntryInput,
): Promise<DefinitionEntry> => {
  await requireSignedIn(request);
  return edge.updateDefinition(id, input, cookieOf(request));
};

export const setDefinitionArchived = async (
  request: Request,
  id: string,
  archived: boolean,
): Promise<DefinitionEntry> => {
  await requireSignedIn(request);
  return edge.setDefinitionArchived(id, archived, cookieOf(request));
};

export const deleteDefinition = async (request: Request, id: string): Promise<boolean> => {
  await requireSignedIn(request);
  return edge.deleteDefinition(id, cookieOf(request));
};
