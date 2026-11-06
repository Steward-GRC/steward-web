// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { type ReactNode } from "react";

import { cn } from "#ui/lib/cn";

import { PageHeader, type PageHeaderProps } from "./PageHeader";

export interface ListPageProps extends Pick<
  PageHeaderProps,
  "actions" | "eyebrow" | "subtitle" | "title"
> {
  /** The table of items (the shared `ResponsiveTable`) or whatever stands in for it. */
  children: ReactNode;
  className?: string;
  /** The search and filter fields: tabs, selects, extra inputs. The table's own search field
   *  sits right under it. */
  filters?: ReactNode;
}

/**
 * The one structure of a list page, admin and staff (#90): a Header (title, short description,
 * the primary action), the Search and filter bar, then the Table of items. Workflows,
 * categories, templates, users, libraries and the other lists differ only in their data and
 * their columns.
 */
export const ListPage = ({
  actions,
  children,
  className,
  eyebrow,
  filters,
  subtitle,
  title,
}: ListPageProps) => {
  const { t } = useTranslation("common");
  return (
    <div className={cn("flex w-full flex-col gap-3.5 p-4 md:p-6", className)}>
      <PageHeader actions={actions} eyebrow={eyebrow} subtitle={subtitle} title={title} />
      {filters ? (
        <div
          aria-label={t("table.filterBar")}
          className="flex flex-wrap items-end gap-3"
          role="search"
        >
          {filters}
        </div>
      ) : null}
      {children}
    </div>
  );
};
