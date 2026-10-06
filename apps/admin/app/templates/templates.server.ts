// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { SectionInput, Template, TemplateVersion } from "@steward-web/api-client";

import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

const requireTemplateManage = (request: Request) =>
  requirePermissionFromRequest(request, PERMISSIONS.GroupManage, "/");

/** Every template, retired ones included — the admin's own directory. Use `authorableTemplates`
 *  (via the policy-authoring area) for the retired-excluded picker. */
export const listTemplates = async (request: Request): Promise<readonly Template[]> => {
  await requireTemplateManage(request);
  return edge.templates(cookieOf(request));
};

/** URLs carry the human-readable code (TPL-NNN) so they stay bookmark-friendly; this resolves
 *  it back to the template, the same way the gateway's own id-keyed mutations need it. */
export const findTemplateByCode = async (
  request: Request,
  code: string,
): Promise<Template | undefined> => {
  const templates = await listTemplates(request);
  return templates.find((t) => t.code === code);
};

/** All of a template's versions, newest first, drafts included. */
export const listTemplateVersions = async (
  request: Request,
  templateId: string,
): Promise<readonly TemplateVersion[]> => {
  await requireTemplateManage(request);
  const versions = await edge.templateVersions(templateId, cookieOf(request));
  return versions.toSorted((a, b) => b.versionNo - a.versionNo);
};

/** Creates a template, selectable as a group's default once it has a published version. */
export const createTemplate = async (
  request: Request,
  name: string,
  ownerCategoryId: null | string,
): Promise<Template> => {
  await requireTemplateManage(request);
  return edge.createTemplate(name, ownerCategoryId, cookieOf(request));
};

/** Template-level, non-versioned: does not create a new template version. */
export const renameTemplate = async (
  request: Request,
  id: string,
  name: string,
): Promise<Template> => {
  await requireTemplateManage(request);
  return edge.renameTemplate(id, name, cookieOf(request));
};

/** Hides the template from listings and pickers; its versions keep working for policies that
 *  already pinned them. */
export const retireTemplate = async (request: Request, id: string): Promise<Template> => {
  await requireTemplateManage(request);
  return edge.retireTemplate(id, cookieOf(request));
};

/** Hard-deletes an unreferenced template. Fails if any policy references it — retire it instead. */
export const deleteTemplate = async (request: Request, id: string): Promise<void> => {
  await requireTemplateManage(request);
  await edge.deleteTemplate(id, cookieOf(request));
};

/** Starts a new draft version, carrying the given sections forward. */
export const createTemplateVersion = async (
  request: Request,
  templateId: string,
  sections: readonly SectionInput[],
): Promise<TemplateVersion> => {
  await requireTemplateManage(request);
  return edge.createTemplateVersion(templateId, sections, cookieOf(request));
};

/** Saves a draft version's section outline. Published versions are immutable. */
export const updateTemplateVersionSections = async (
  request: Request,
  id: string,
  sections: readonly SectionInput[],
): Promise<TemplateVersion> => {
  await requireTemplateManage(request);
  return edge.updateTemplateVersionSections(id, sections, cookieOf(request));
};

/** Publishes a draft version; it becomes the template's active version for new policies. */
export const publishTemplateVersion = async (
  request: Request,
  id: string,
): Promise<TemplateVersion> => {
  await requireTemplateManage(request);
  return edge.publishTemplateVersion(id, cookieOf(request));
};

/** Discards (deletes) a draft version. Published versions can't be discarded. */
export const discardTemplateVersion = async (request: Request, id: string): Promise<void> => {
  await requireTemplateManage(request);
  await edge.discardTemplateVersion(id, cookieOf(request));
};
