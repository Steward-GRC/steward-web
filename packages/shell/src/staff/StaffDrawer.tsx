// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Dialog, DialogClose, DialogTrigger, Lockup, SheetContent } from "@steward-web/ui";
import { Menu as MenuIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

import type { NavSection } from "./staffNav";

import { SearchField } from "../SearchField";
import { NavSections } from "./StaffSidebar";

const barLink = "flex h-11 items-center px-2.5 text-ink hover:text-ink";

/**
 * The phone menu (H3, H3o): below 1024 px a 44 px "Open menu" button opens a 318 px sheet
 * with the brand, search, the sidebar's sections and, along the foot, Browse by category,
 * Feedback and Docs. It closes on navigation.
 */
export const StaffDrawer = ({
  adminUrl,
  docsUrl,
  feedbackUrl,
  sections,
}: {
  /** Shown along the foot for admins. */
  adminUrl?: string;
  docsUrl: string;
  feedbackUrl: string;
  sections: NavSection[];
}) => {
  const { t } = useTranslation("shell");
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a navigation closes the drawer
    setOpen(false);
  }, [location.key]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <button
          aria-label={t("header.openMenu")}
          className="flex size-11 flex-none items-center justify-center rounded-md text-ink hover:bg-sunken lg:hidden"
          type="button"
        >
          <MenuIcon aria-hidden="true" className="size-[23px]" />
        </button>
      </DialogTrigger>
      <SheetContent className="w-[318px] max-w-[calc(100vw-48px)]" title={t("header.menuTitle")}>
        <div className="flex h-[57px] flex-none items-center gap-2 border-b border-border pr-1.5 pl-4">
          <Link className="text-ink" to="/">
            <Lockup fontSize={19} size={24} />
          </Link>
          <DialogClose
            aria-label={t("header.closeMenu")}
            className="ml-auto flex size-11 items-center justify-center rounded-md hover:bg-sunken"
          >
            <X aria-hidden="true" className="size-[23px]" />
          </DialogClose>
        </div>
        <div className="px-3.5 py-3">
          <SearchField className="h-[46px] bg-transparent px-3 text-base" shortcut={false} />
        </div>
        <nav
          aria-label={t("nav.label")}
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2.5 py-1 text-[15px]"
        >
          <NavSections drawer sections={sections} />
        </nav>
        <div className="flex flex-none gap-1 border-t border-border-strong px-2.5 py-1.5 text-[15px]">
          <Link className={barLink} to="/policies">
            {t("nav.sections.browse")}
          </Link>
          <span className="ml-auto" />
          {adminUrl ? (
            <a className={barLink} href={adminUrl}>
              {t("header.admin")}
            </a>
          ) : null}
          <Link className={barLink} to={feedbackUrl}>
            {t("header.feedback")}
          </Link>
          <a className={barLink} href={docsUrl} rel="noreferrer" target="_blank">
            {t("header.docs")}
          </a>
        </div>
      </SheetContent>
    </Dialog>
  );
};
