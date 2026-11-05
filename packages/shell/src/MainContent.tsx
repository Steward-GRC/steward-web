// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { type ReactNode, useEffect, useRef } from "react";
import { useLocation } from "react-router";

/** The id the skip link points at. */
export const MAIN_ID = "main";

/**
 * "Skip to main content" (WCAG 2.4.1): the first thing a keyboard reaches on every shell page,
 * hidden until it's focused, leading past the header and navigation to the page itself.
 */
export const SkipLink = () => {
  const { t } = useTranslation("shell");
  return (
    <a
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[var(--z-toast)] focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:font-semibold focus:text-primary focus:shadow-[var(--shadow-3)]"
      href={`#${MAIN_ID}`}
    >
      {t("skipToMain")}
    </a>
  );
};

/**
 * The page's main landmark, which the skip link leads to. When a link changes the page, focus
 * moves here, so a keyboard or screen-reader user starts at the new page rather than back at
 * the link they used (WCAG 2.4.3). The first page loads with focus where the browser puts it.
 */
export const MainContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    main.current?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <main className={className} id={MAIN_ID} ref={main} tabIndex={-1}>
      {children}
    </main>
  );
};
