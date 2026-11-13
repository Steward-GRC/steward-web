// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Policy } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";

import { Breadcrumb, type Crumb } from "#ui/components/Breadcrumb";

import { DocumentType, documentTypeBasePath, libraryCategoryPath } from "./policy";
import { recordPath } from "./routes";

type RecordTrail = {
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  subcategorySlug?: string;
} & Pick<Policy, "documentType" | "number" | "title">;

/**
 * Library, category, subcategory, then the record. A page about the record (its draft, its
 * approval) passes `page`: the record then links back to its own page and `page` is last.
 */
export const recordCrumbs = (
  record: RecordTrail,
  libraryLabel: string,
  page?: string,
  published = true,
): Crumb[] => {
  const base = documentTypeBasePath(record.documentType);
  const crumbs: Crumb[] = [{ href: base, label: libraryLabel }];
  // Each level links to the library filtered to it, at its slug path (#378). A level whose slug
  // is not known is shown without a link.
  if (record.category) {
    const slugs = record.categorySlug ? [record.categorySlug] : [];
    crumbs.push({
      ...(slugs.length > 0 ? { href: libraryCategoryPath(record.documentType, slugs) } : {}),
      label: record.category,
    });
    if (record.subcategory) {
      const below =
        slugs.length > 0 && record.subcategorySlug ? [...slugs, record.subcategorySlug] : [];
      crumbs.push({
        ...(below.length > 0 ? { href: libraryCategoryPath(record.documentType, below) } : {}),
        label: record.subcategory,
      });
    }
  }
  if (page) {
    // A document never published has no page of its own to go back to.
    crumbs.push(
      published ? { href: recordPath(record), label: record.title } : { label: record.title },
      { label: page },
    );
  } else {
    crumbs.push({ label: record.title });
  }
  return crumbs;
};

/** The one breadcrumb every record page (reader, draft editor, approval) shows above its title. */
export const RecordBreadcrumb = ({
  page,
  published = true,
  record,
}: {
  page?: string;
  /** False for a draft of a document that has never been published. */
  published?: boolean;
  record: RecordTrail;
}) => {
  const { t } = useTranslation("policy");
  const libraryLabel =
    record.documentType === DocumentType.Procedure
      ? t("reader.back.procedures")
      : t("reader.back.policies");
  return <Breadcrumb items={recordCrumbs(record, libraryLabel, page, published)} />;
};
