// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Category } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { cn, CountBadge, Tooltip } from "@steward-web/ui";
import { DocumentType, libraryCategoryPath } from "@steward-web/ui/domain";
import { ChevronRight, Folder, PanelLeft } from "lucide-react";
import { Fragment, type ReactNode, useState } from "react";
import { Link, useLocation } from "react-router";

import type { NavItem, NavSection } from "./staffNav";

/** Browse by category shares the rail's last run with Workflow (H1t). */
const BROWSE_RAIL_GROUP = 3;

/** "/" is only itself; any other item also covers the pages below it ("/policies/POL-1"). */
const isCurrent = (to: string, pathname: string) =>
  to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

const browseHref = (category: string, subcategory?: string) =>
  libraryCategoryPath(DocumentType.Policy, subcategory ? [category, subcategory] : [category]);

const Badge = ({ count }: { count: number }) => (
  <CountBadge aria-hidden="true" className="ml-auto rail:hidden">
    {count}
  </CountBadge>
);

/** Wraps an icon-only rail item in its tooltip (Icons: "icon-only buttons carry a tooltip"). */
const RailTip = ({ children, label, on }: { children: ReactNode; label: string; on: boolean }) =>
  on ? (
    <Tooltip content={label} side="right">
      {children}
    </Tooltip>
  ) : (
    children
  );

const SectionHeading = ({ children }: { children: ReactNode }) => (
  <h2 className="px-2.5 pb-1 text-2xs leading-[13px] font-semibold tracking-[.06em] text-muted uppercase rail:sr-only">
    {children}
  </h2>
);

const ItemLink = ({ drawer, item, rail }: { drawer?: boolean; item: NavItem; rail: boolean }) => {
  const { t } = useTranslation("shell");
  const { pathname } = useLocation();
  const current = isCurrent(item.to, pathname);
  const label = t(item.label);
  const Icon = item.icon;
  return (
    <RailTip label={label} on={rail}>
      <Link
        aria-current={current ? "page" : undefined}
        aria-label={item.badge ? t("nav.badge", { count: item.badge, label }) : undefined}
        className={cn(
          "flex items-center rounded-md px-2.5 text-ink transition-shadow duration-200 hover:bg-sunken hover:text-ink motion-reduce:transition-none",
          drawer ? "h-[42px] gap-3" : "h-8 gap-2.5",
          "rail:size-11 rail:justify-center rail:rounded-lg rail:px-0",
          current &&
            "bg-primary-soft font-semibold text-on-primary-soft shadow-[inset_4px_0_0_var(--accent)] hover:bg-primary-soft hover:text-on-primary-soft rail:shadow-[inset_0_0_0_1.5px_var(--primary)]",
        )}
        to={item.to}
      >
        <Icon aria-hidden="true" className="size-4 flex-none rail:size-[21px]" />
        <span className="truncate rail:sr-only">{label}</span>
        {item.badge ? <Badge count={item.badge} /> : null}
      </Link>
    </RailTip>
  );
};

/** The section list, shared by the sidebar and the phone drawer. */
export const NavSections = ({
  drawer,
  rail = false,
  sections,
}: {
  drawer?: boolean;
  rail?: boolean;
  sections: NavSection[];
}) => {
  const { t } = useTranslation("shell");
  return sections.map((section, index) => (
    <Fragment key={section.id}>
      {index > 0 && sections[index - 1]?.railGroup !== section.railGroup ? (
        <span aria-hidden="true" className="my-1 hidden h-px w-7 bg-border rail:block" />
      ) : null}
      <div className={cn("flex flex-col rail:contents", drawer ? "" : "gap-0.5")}>
        <SectionHeading>{t(section.label)}</SectionHeading>
        {section.items.map((item) => (
          <ItemLink drawer={drawer} item={item} key={item.id} rail={rail} />
        ))}
      </div>
    </Fragment>
  ));
};

const CategoryRow = ({ category }: { category: Category }) => {
  const { t } = useTranslation("shell");
  const [open, setOpen] = useState(false);
  const hasSubcategories = category.subcategories.length > 0;
  return (
    <>
      <div className="flex h-8 items-center gap-2 px-2.5">
        {hasSubcategories ? (
          <button
            aria-expanded={open}
            aria-label={t("nav.showSubcategories", { category: category.name })}
            className="-m-1 flex rounded-sm p-1 text-ink hover:bg-sunken"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            <ChevronRight
              aria-hidden="true"
              className={cn("size-4 transition-transform", open && "rotate-90")}
            />
          </button>
        ) : (
          <span aria-hidden="true" className="size-4 flex-none" />
        )}
        <Link
          className="flex min-w-0 flex-1 items-center gap-2 text-ink hover:text-ink hover:underline"
          to={browseHref(category.slug)}
        >
          <Folder aria-hidden="true" className="size-4 flex-none" />
          <span className="truncate">{category.name}</span>
        </Link>
      </div>
      {open
        ? category.subcategories.map((subcategory) => (
            <Link
              className="flex h-8 items-center truncate pr-2.5 pl-[58px] text-ink hover:text-ink hover:underline"
              key={subcategory.slug}
              to={browseHref(category.slug, subcategory.slug)}
            >
              {subcategory.name}
            </Link>
          ))
        : null}
    </>
  );
};

/**
 * The staff sidebar (H1): 248 px of content (269 px with its padding and rule, as the canvas
 * draws it) on the surface, sections of 32 px rows, the current page in
 * plum with a 3 px bar, count chips, Browse by category and Collapse at the foot. Between
 * 1024 and 1280 px, or when collapsed, it is the 64 px icon rail with tooltips (H1t). Below
 * 1024 px it gives way to the phone drawer (H3o).
 */
export const StaffSidebar = ({
  categories,
  collapsed,
  onCollapsedChange,
  rail,
  sections,
}: {
  categories: readonly Category[];
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  /** True whenever the rail shows (collapsed, or the 1024 px layout), for the tooltips. */
  rail: boolean;
  sections: NavSection[];
}) => {
  const { t } = useTranslation("shell");
  const browse = t("nav.sections.browse");
  return (
    <nav
      aria-label={t("nav.label")}
      className="sticky top-[var(--shell-top)] hidden h-[calc(100dvh-var(--shell-top))] w-[269px] flex-none flex-col gap-[14px] overflow-y-auto border-r border-border-strong bg-surface px-2.5 py-[14px] text-base lg:flex rail:w-[65px] rail:items-center rail:gap-1 rail:px-0 rail:py-3"
      data-rail={collapsed}
    >
      <NavSections rail={rail} sections={sections} />
      {categories.length > 0 ? (
        <>
          <div className="flex flex-col gap-0.5 rail:hidden">
            <SectionHeading>{browse}</SectionHeading>
            {categories.map((category) => (
              <CategoryRow category={category} key={category.id} />
            ))}
          </div>
          {sections.at(-1)?.railGroup === BROWSE_RAIL_GROUP ? null : (
            <span aria-hidden="true" className="my-1 hidden h-px w-7 bg-border rail:block" />
          )}
          <RailTip label={browse} on={rail}>
            <Link
              aria-label={browse}
              className="hidden size-11 items-center justify-center rounded-lg text-ink hover:bg-sunken hover:text-ink rail:flex"
              to="/policies"
            >
              <Folder aria-hidden="true" className="size-[21px]" />
            </Link>
          </RailTip>
        </>
      ) : null}
      <button
        aria-label={collapsed ? t("nav.expand") : undefined}
        className="mt-auto flex h-8 flex-none items-center gap-2.5 rounded-md px-2.5 text-sm text-muted hover:bg-sunken max-xl:hidden rail:size-11 rail:justify-center rail:px-0"
        onClick={() => onCollapsedChange(!collapsed)}
        type="button"
      >
        <PanelLeft aria-hidden="true" className="size-4" />
        {collapsed ? null : t("nav.collapse")}
      </button>
    </nav>
  );
};
