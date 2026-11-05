// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { PageSkeleton } from "@steward-web/ui";
import { type ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigation } from "react-router";

/**
 * The route-level pending state (6-states.s1): while the next page's data loads, the page
 * area shows the skeleton with "Loading…" for screen readers. It waits `delay` ms first, so a
 * quick load never flashes it, and a reload of the same page (a form's revalidation) keeps the
 * page as it is.
 */
export const RoutePending = ({
  children,
  delay = 300,
}: {
  children: ReactNode;
  delay?: number;
}) => {
  const { t } = useTranslation("common");
  const navigation = useNavigation();
  const location = useLocation();
  const leaving =
    navigation.state === "loading" &&
    navigation.location !== undefined &&
    navigation.location.pathname !== location.pathname;
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!leaving) {
      setShown(false);
      return;
    }
    const timer = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(timer);
  }, [delay, leaving]);

  if (leaving && shown) {
    return (
      <div className="p-6">
        <PageSkeleton label={t("status.loading")} />
      </div>
    );
  }
  return <>{children}</>;
};
