import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { EmptyState } from "@steward-web/ui";
import { Bell } from "lucide-react";
import { Link } from "react-router";

import type { Route } from "./+types/inbox";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  // The gateway can't list in-app notices yet (steward-gateway#74); the panel that shows them
  // (../inbox/InboxPanel) is built and waits for it.
  return null;
};

/** The inbox (U36): the header bell's destination. */
export default function Inbox() {
  const { t } = useTranslation("shell");
  return (
    <div className="flex flex-col gap-3.5 px-4 py-6 text-base text-ink md:px-9">
      <h1 className="text-[26px] font-semibold md:text-[30px] md:leading-[38px]">
        {t("inbox.title")}
      </h1>
      <EmptyState
        action={
          <Link className="text-[13px] text-primary hover:underline" to="/profile/notifications">
            {t("inbox.settings")}
          </Link>
        }
        description={t("inbox.unavailable.body")}
        framed
        icon={<Bell className="size-[22px]" />}
      />
    </div>
  );
}
