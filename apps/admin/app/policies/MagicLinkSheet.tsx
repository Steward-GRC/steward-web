// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDate, useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  cn,
  Dialog,
  notify,
  QrCode,
  SideSheetBody,
  SideSheetContent,
} from "@steward-web/ui";
import { type PolicyDetail } from "@steward-web/ui/domain";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";

import type { IssuedLink } from "./governance";

import { refusalIn, useGovernanceFetcher, useNouns } from "./useGovernance";

interface SheetLink extends IssuedLink {
  createdAt: string;
  revoked: boolean;
}

/** The link as the frame prints it: no scheme ("policies.example.org/s/7c1e04b2"). */
const shown = (url: string) => url.replace(/^https?:\/\//, "");

/**
 * D31: the magic link manager, a side sheet. "Create for v{version}" issues a read-only link to
 * the published version; each link shows its QR code, the link in mono, Copy, Revoke and
 * Re-issue, and "Active · by {name} · {date}". The gateway can't list links issued before
 * (steward-gateway#71), so the sheet keeps the ones made while the reader is open and says so.
 */
export const MagicLinkSheet = ({
  detail,
  onOpenChange,
  open,
  viewerName,
}: {
  detail: PolicyDetail;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  viewerName: string;
}) => {
  const { t } = useTranslation("admin");
  const { noun } = useNouns(detail);
  const fetcher = useGovernanceFetcher();
  const [links, setLinks] = useState<readonly SheetLink[]>([]);
  const failure = refusalIn(fetcher);
  const answer = fetcher.state === "idle" ? fetcher.data : undefined;

  useEffect(() => {
    if (!answer?.ok) return;
    const now = new Date().toISOString();
    switch (answer.intent) {
      case "createMagicLink": {
        const { expiresAt, token, url } = answer;
        setLinks((current) =>
          current.some((link) => link.token === token)
            ? current
            : [{ createdAt: now, expiresAt, revoked: false, token, url }, ...current],
        );
        break;
      }
      case "reissueMagicLink": {
        const { expiresAt, replaced, token, url } = answer;
        setLinks((current) =>
          current.some((link) => link.token === token)
            ? current
            : [
                { createdAt: now, expiresAt, revoked: false, token, url },
                ...current.filter((link) => link.token !== replaced),
              ],
        );
        break;
      }
      case "revokeMagicLink": {
        const { token } = answer;
        setLinks((current) =>
          current.map((link) => (link.token === token ? { ...link, revoked: true } : link)),
        );
        break;
      }
      default: {
        break;
      }
    }
  }, [answer]);

  const busy = fetcher.state !== "idle";
  const act = (intent: string, token?: string) =>
    void fetcher.submit({ intent, ...(token ? { token } : {}) }, { method: "post" });

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    notify.success(t("governance.magicLinks.copied"));
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <SideSheetContent
        busy={busy}
        description={t("governance.magicLinks.subtitle", {
          number: detail.number,
          title: detail.title,
        })}
        title={t("governance.magicLinks.title")}
      >
        <SideSheetBody>
          {links.map((link) => (
            <div className="flex items-center gap-3.5" key={link.token}>
              <QrCode
                className={cn("flex-none", link.revoked && "opacity-40")}
                label={t("governance.magicLinks.qr", { version: detail.version })}
                size={84}
                value={link.url}
              />
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="font-mono text-xs font-semibold">
                  {t("governance.magicLinks.version", { version: detail.version })}
                </span>
                <span className="font-mono text-xs break-all text-muted">{shown(link.url)}</span>
                {link.revoked ? null : (
                  <span className="flex gap-2.5 text-[13px] font-semibold text-primary">
                    <button
                      className="flex items-center gap-1 hover:text-primary-hover"
                      onClick={() => void copy(link.url)}
                      type="button"
                    >
                      <Copy aria-hidden="true" className="size-3.5" />
                      {t("governance.magicLinks.copy")}
                    </button>
                    <button
                      className="text-danger hover:underline disabled:opacity-50"
                      disabled={busy}
                      onClick={() => act("revokeMagicLink", link.token)}
                      type="button"
                    >
                      {t("governance.magicLinks.revoke")}
                    </button>
                    <button
                      className="hover:text-primary-hover disabled:opacity-50"
                      disabled={busy}
                      onClick={() => act("reissueMagicLink", link.token)}
                      type="button"
                    >
                      {t("governance.magicLinks.reissue")}
                    </button>
                  </span>
                )}
                <span
                  className={cn("text-xs font-semibold", link.revoked ? "text-muted" : "text-ok")}
                >
                  {t(
                    link.revoked ? "governance.magicLinks.revoked" : "governance.magicLinks.active",
                    {
                      date: formatDate(link.createdAt),
                      name: viewerName,
                    },
                  )}
                </span>
              </div>
            </div>
          ))}
          {detail.currentVersionId ? (
            <Button busy={busy} className="h-10 w-full" onClick={() => act("createMagicLink")}>
              {t("governance.magicLinks.create", { version: detail.version })}
            </Button>
          ) : (
            <p className="text-sm text-muted">{t("governance.magicLinks.unpublished", { noun })}</p>
          )}
          {failure ? (
            <Banner failure={failure} title={t("governance.failed")} tone="danger" />
          ) : null}
          <p className="text-xs leading-normal text-muted">{t("governance.magicLinks.earlier")}</p>
        </SideSheetBody>
      </SideSheetContent>
    </Dialog>
  );
};
