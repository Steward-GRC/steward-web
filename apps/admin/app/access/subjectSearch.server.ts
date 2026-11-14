// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { PickerOption } from "@steward-web/ui";

import { DocumentType } from "@steward-web/api-client";
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";

import { fetchAllGroups, orderedWithPaths } from "../categories/categories.server";

/** The most results a search sends back; the picker says to keep typing past it. */
export const SUBJECT_SEARCH_LIMIT = 10;

/** The fewest characters that search. The picker holds the same line; the server holds it too. */
export const SUBJECT_SEARCH_MIN = 2;

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

export type SubjectKind = "category" | "document" | "group" | "user";

/** Categories whose full path holds the words, as picker options. */
export const matchCategories = (
  rows: readonly { id: string; path: string }[],
  query: string,
): PickerOption[] => {
  const needle = query.toLowerCase();
  const options = rows
    .filter((row) => row.path.toLowerCase().includes(needle))
    .map((row) => ({
      detail: row.path.includes(" › ") ? row.path.slice(0, row.path.lastIndexOf(" › ")) : undefined,
      id: row.id,
      label: row.path,
    }));
  return rankByPrefix(options, query);
};

/** Policies and procedures whose number or title holds the words. The id is the audit log's own
 *  subject (`policy:<id>`), so the picker can filter the log by it. */
export const matchDocuments = (
  documents: readonly { documentType: string; id: string; number: string; title: string }[],
  query: string,
): PickerOption[] => {
  const needle = query.toLowerCase();
  const options = documents
    .filter(
      (document) =>
        document.number.toLowerCase().includes(needle) ||
        document.title.toLowerCase().includes(needle),
    )
    .map((document) => ({
      detail: document.number,
      id: `${document.documentType === "PROCEDURE" ? "procedure" : "policy"}:${document.id}`,
      label: document.title,
    }));
  return rankByPrefix(options, query);
};

/** Names that start with the words typed come before names that only contain them. */
export const rankByPrefix = <T extends { label: string }>(
  items: readonly T[],
  query: string,
): T[] => {
  const needle = query.toLowerCase();
  const rank = (item: T) => (item.label.toLowerCase().startsWith(needle) ? 0 : 1);
  return items.toSorted((a, b) => rank(a) - rank(b) || a.label.localeCompare(b.label));
};

/**
 * The add-rule typeahead (#88): people or groups, matched on the server and capped, never a full
 * directory sent to the browser. A person's id is the identity. What the service can match
 * today is the email and, for groups, the name (steward-gateway#81 widens both); a shorter
 * query than two characters asks for nothing.
 */
export const searchSubjects = async (
  request: Request,
  kind: SubjectKind,
  query: string,
): Promise<PickerOption[]> => {
  await requireIdentityFromRequest(request);
  const needle = query.trim();
  if (needle.length < SUBJECT_SEARCH_MIN) return [];
  if (kind === "category") {
    const groups = await fetchAllGroups(cookieOf(request)).catch(() => []);
    return matchCategories(orderedWithPaths(groups), needle).slice(0, SUBJECT_SEARCH_LIMIT);
  }
  if (kind === "document") {
    const cookie = cookieOf(request);
    const [policies, procedures] = await Promise.all([
      edge.policies(DocumentType.Policy, cookie).catch(() => []),
      edge.policies(DocumentType.Procedure, cookie).catch(() => []),
    ]);
    return matchDocuments([...policies, ...procedures], needle).slice(0, SUBJECT_SEARCH_LIMIT);
  }
  if (kind === "user") {
    const found = await edge.searchUsers(needle, SUBJECT_SEARCH_LIMIT, cookieOf(request));
    return rankByPrefix(
      found.map((user) => ({
        detail: user.email ?? undefined,
        id: user.id,
        label: user.name,
      })),
      needle,
    ).slice(0, SUBJECT_SEARCH_LIMIT);
  }
  // A group rule matches a directory (identity provider) group by its name, so the picker offers
  // the names that exist rather than letting a typo that never matches through. The gateway
  // matches by prefix, sorted, and caps the page; past the cap the person types a longer prefix.
  const page = await edge
    .idpGroupNames(needle, SUBJECT_SEARCH_LIMIT, cookieOf(request))
    .catch(() => ({ names: [] as readonly string[], truncated: false }));
  return page.names.map((name) => ({ id: name, label: name }));
};
