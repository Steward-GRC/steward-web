// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDayMonth, useTranslation } from "@steward-web/i18n";
import {
  Button,
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  EmptyState,
  ResponsiveTable,
} from "@steward-web/ui";
import { Copy } from "lucide-react";
import { useState } from "react";

/** One issued link, as A12 lists it. */
export interface MagicLinkRow {
  createdAt: string;
  createdBy: string;
  id: string;
  policyTitle: string;
  status: "active" | "expired" | "revoked";
  url: string;
  version: string;
}

/** "…/share/7c1e": the token's first four characters, enough to tell links apart. A link opens
 *  the staff app's shared reader (G16) at `/share/{token}`. */
const shortLink = (url: string) => {
  const match = /\/share\/([^/?#]+)/.exec(url);
  return match ? `…/share/${match[1]!.slice(0, 4)}` : url;
};

/**
 * The magic links table (A12): every read-only share link, with Copy, its status, who made it
 * and when, and Revoke for a live one or Remove (D34) once it's revoked or expired.
 */
export const MagicLinksTable = ({
  links,
  onRemove,
  onRevoke,
}: {
  links: readonly MagicLinkRow[];
  onRemove: (id: string) => void;
  onRevoke: (id: string) => void;
}) => {
  const { t } = useTranslation("admin");
  const [removing, setRemoving] = useState<MagicLinkRow | null>(null);

  const live = (link: MagicLinkRow) => link.status === "active";

  return (
    <>
      {/* The frame's columns (A12): Policy, a 70 px Version, Link, a 90 px Status, Created by,
          and a 110 px action. */}
      <ResponsiveTable
        className="text-sm"
        columns={[
          {
            card: "title",
            cell: (link) => link.policyTitle,
            header: t("magicLinks.columns.policy"),
            key: "policy",
            value: (link) => link.policyTitle,
          },
          {
            card: "meta",
            cell: (link) => link.version,
            className: "w-[70px] font-mono",
            header: t("magicLinks.columns.version"),
            key: "version",
            value: (link) => link.version,
          },
          {
            card: "meta",
            cell: (link) => (
              <span className="inline-flex items-center gap-1 font-mono text-xs">
                <span className={cn(live(link) && "text-primary")}>{shortLink(link.url)}</span>
                {live(link) ? (
                  <button
                    aria-label={t("magicLinks.copy", { policy: link.policyTitle })}
                    className="flex text-primary"
                    onClick={() => void navigator.clipboard?.writeText(link.url)}
                    type="button"
                  >
                    <Copy aria-hidden="true" className="size-3.5" />
                  </button>
                ) : null}
              </span>
            ),
            header: t("magicLinks.columns.link"),
            key: "link",
          },
          {
            card: "status",
            cell: (link) => (
              <span className={cn("font-semibold", live(link) && "text-ok")}>
                {t(`magicLinks.status.${link.status}`)}
              </span>
            ),
            className: "w-[90px]",
            header: t("magicLinks.columns.status"),
            key: "status",
            value: (link) => link.status,
          },
          {
            card: "meta",
            cell: (link) =>
              t("magicLinks.createdBy", {
                date: formatDayMonth(link.createdAt),
                name: link.createdBy,
              }),
            header: t("magicLinks.columns.createdBy"),
            key: "createdBy",
            value: (link) => link.createdAt,
          },
          {
            card: "action",
            cell: (link) =>
              live(link) ? (
                <button
                  aria-label={t("magicLinks.revokeLabel", { policy: link.policyTitle })}
                  className="font-semibold text-danger hover:underline"
                  onClick={() => onRevoke(link.id)}
                  type="button"
                >
                  {t("magicLinks.revoke")}
                </button>
              ) : (
                <button
                  aria-label={t("magicLinks.removeLabel", { policy: link.policyTitle })}
                  className="font-semibold text-ink hover:underline"
                  onClick={() => setRemoving(link)}
                  type="button"
                >
                  {t("magicLinks.remove")}
                </button>
              ),
            className: "w-[110px]",
            header: <span className="sr-only">{t("magicLinks.columns.actions")}</span>,
            key: "actions",
          },
        ]}
        empty={
          <EmptyState
            description={t("magicLinks.empty.description")}
            title={t("magicLinks.empty.title")}
          />
        }
        framed
        label={t("magicLinks.title")}
        rowClassName={(link) => (live(link) ? undefined : "text-muted")}
        rowKey={(link) => link.id}
        rows={links}
        search={{
          label: t("magicLinks.search"),
          placeholder: t("magicLinks.search"),
          text: (link) => `${link.policyTitle} ${link.version} ${link.createdBy}`,
        }}
      />
      <Dialog
        onOpenChange={(open) => (open ? undefined : setRemoving(null))}
        open={removing !== null}
      >
        <DialogContent
          description={t("magicLinks.removeDescription")}
          title={t("magicLinks.removeTitle")}
          tone="danger"
        >
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">{t("magicLinks.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (removing) onRemove(removing.id);
                setRemoving(null);
              }}
              variant="danger"
            >
              {t("magicLinks.removeConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
