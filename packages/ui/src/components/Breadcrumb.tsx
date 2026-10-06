// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { ChevronRight } from "lucide-react";
import { Fragment, type ReactNode } from "react";

export interface Crumb {
  href?: string;
  label: ReactNode;
}

/** The path to the current page. The last crumb is the page itself and isn't a link. */
export const Breadcrumb = ({ items }: { items: Crumb[] }) => {
  const { t } = useTranslation("common");
  return (
    <nav aria-label={t("breadcrumb.aria")}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <Fragment key={index}>
              <li>
                {item.href && !last ? (
                  <a className="text-muted hover:text-ink" href={item.href}>
                    {item.label}
                  </a>
                ) : (
                  <span aria-current={last ? "page" : undefined} className={last ? "text-ink" : ""}>
                    {item.label}
                  </span>
                )}
              </li>
              {last ? null : (
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
