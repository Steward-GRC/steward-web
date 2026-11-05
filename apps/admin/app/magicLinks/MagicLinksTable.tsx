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

// The frame's columns (A12): Policy, Version, Link, Status, Created by, and the action.
const GRID = "md:grid md:grid-cols-[1.4fr_70px_1fr_90px_1fr_110px] md:items-center md:gap-x-2";

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

  if (links.length === 0) {
    return (
      <EmptyState
        description={t("magicLinks.empty.description")}
        title={t("magicLinks.empty.title")}
      />
    );
  }

  return (
    <>
      <div
        className="overflow-hidden rounded-[10px] border border-border bg-surface text-sm"
        role="table"
      >
        <div
          className={cn(
            GRID,
            "hidden border-b border-border-strong bg-sunken px-3 py-[9px] font-semibold text-muted",
          )}
          role="row"
        >
          {(["policy", "version", "link", "status", "createdBy", "actions"] as const).map(
            (column) => (
              <span
                className={column === "actions" ? "sr-only" : undefined}
                key={column}
                role="columnheader"
              >
                {t(`magicLinks.columns.${column}`)}
              </span>
            ),
          )}
        </div>
        {links.map((link) => {
          const live = link.status === "active";
          return (
            <div
              className={cn(
                GRID,
                "flex flex-col gap-1 border-b border-border px-3 py-2.5 last:border-b-0",
                !live && "text-muted",
              )}
              key={link.id}
              role="row"
            >
              <span role="cell">{link.policyTitle}</span>
              <span className="font-mono" role="cell">
                {link.version}
              </span>
              <span className="flex items-center gap-1 font-mono text-xs" role="cell">
                <span className={cn(live && "text-primary")}>{shortLink(link.url)}</span>
                {live ? (
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
              <span className={cn("font-semibold", live && "text-ok")} role="cell">
                {t(`magicLinks.status.${link.status}`)}
              </span>
              <span role="cell">
                {t("magicLinks.createdBy", {
                  date: formatDayMonth(link.createdAt),
                  name: link.createdBy,
                })}
              </span>
              <span role="cell">
                {live ? (
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
                )}
              </span>
            </div>
          );
        })}
      </div>
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
