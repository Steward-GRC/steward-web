// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { EmptyState, ListPage } from "@steward-web/ui";

import type { Route } from "./+types/magic-links";

import { type MagicLinkRow, MagicLinksTable } from "../magicLinks/MagicLinksTable";

/** The table's own search, sort and page changes don't load the page again. */
export { shouldRevalidateTable as shouldRevalidate } from "@steward-web/ui";

/**
 * The gateway can make and revoke a link (`createMagicLink`, `revokeMagicLink`) but can't list
 * the links already issued or remove one (steward-gateway#71). Until it can, `links` is null and
 * the page says the list isn't available; the table is wired for the day it is.
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  return { links: null as null | readonly MagicLinkRow[] };
};

/** Magic links (A12): every read-only share link issued across the org. */
export default function MagicLinks({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const { links } = loaderData;
  return (
    <ListPage subtitle={t("magicLinks.subtitle")} title={t("magicLinks.title")}>
      {links ? (
        <MagicLinksTable links={links} onRemove={() => {}} onRevoke={() => {}} />
      ) : (
        <EmptyState
          description={t("magicLinks.unavailable.description")}
          title={t("magicLinks.unavailable.title")}
        />
      )}
    </ListPage>
  );
}
