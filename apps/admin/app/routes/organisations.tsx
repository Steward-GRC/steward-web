// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { SpCertificate } from "@steward-web/api-client";

import { formatDate, useTranslation } from "@steward-web/i18n";
import { refusalOf, useRegisterCreateActions } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  EmptyState,
  type Failure,
  ResponsiveTable,
} from "@steward-web/ui";
import { useId, useState } from "react";
import { data, Link, useFetcher } from "react-router";

import type { Route } from "./+types/organisations";

import {
  forceRotateSpCertificate,
  getSpCertificate,
  listOrganizations,
} from "../organisations/organisations.server";

/** The table's own search, sort and page changes don't load the page again. */
export { shouldRevalidateTable as shouldRevalidate } from "@steward-web/ui";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const [organisations, spCertificate] = await Promise.all([
    listOrganizations(request),
    getSpCertificate(request),
  ]);
  return { organisations, spCertificate };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  if (intent !== "rotate-certificate") throw data("unrecognized intent", { status: 400 });
  try {
    await forceRotateSpCertificate(request);
    return { intent, ok: true } as const;
  } catch (error) {
    if (error instanceof Response) throw error;
    return data({ failure: refusalOf(error), intent, ok: false } as const, { status: 400 });
  }
};

type Result = { failure: Failure; ok: false } | { ok: true };

/** A text button that copies a value and says "Copied" for a moment. */
const CopyButton = ({ label, value }: { label: string; value: string }) => {
  const { t } = useTranslation("admin");
  const [copied, setCopied] = useState(false);
  return (
    <Button
      onClick={() =>
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
      }
      size="sm"
      variant="secondary"
    >
      {copied ? t("organizations.cert.copied") : label}
    </Button>
  );
};

/** The SP certificate panel (A23): status, serial and expiry, the two copies and D28. */
const SpCertificateCard = ({ certificate }: { certificate: SpCertificate }) => {
  const { t } = useTranslation("admin");
  const rotate = useFetcher<Result>();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const failure =
    rotate.state === "idle" && rotate.data && !rotate.data.ok ? rotate.data.failure : undefined;
  return (
    <Card aria-labelledby={titleId} className="flex flex-col gap-2.5 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <b id={titleId}>{t("organizations.cert.title")}</b>
        <Badge tone={certificate.active ? "ok" : "neutral"}>
          {certificate.active ? t("organizations.cert.active") : t("organizations.cert.inactive")}
        </Badge>
      </div>
      <p className="text-sm text-muted">{t("organizations.cert.description")}</p>
      <p className="flex flex-wrap gap-x-4 text-sm">
        <span className="font-mono">
          {t("organizations.cert.serial", { serial: certificate.serial })}
        </span>
        <span className="text-muted">
          {t("organizations.cert.expires", { date: formatDate(certificate.notAfter) })}
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        <CopyButton label={t("organizations.cert.copyCertificate")} value={certificate.certPem} />
        <CopyButton
          label={t("organizations.cert.copyMetadata")}
          value={certificate.spMetadataXml}
        />
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary">
              {t("organizations.cert.rotate")}
            </Button>
          </DialogTrigger>
          <DialogContent
            description={t("organizations.cert.rotateDescription")}
            title={t("organizations.cert.rotateTitle")}
            tone="danger"
          >
            <rotate.Form method="post" onSubmit={() => setOpen(false)}>
              <input name="intent" type="hidden" value="rotate-certificate" />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">{t("organizations.cert.cancel")}</Button>
                </DialogClose>
                <Button type="submit" variant="danger">
                  {t("organizations.cert.rotateConfirm")}
                </Button>
              </DialogFooter>
            </rotate.Form>
          </DialogContent>
        </Dialog>
      </div>
      {failure ? (
        <Banner failure={failure} title={t("organizations.cert.failed")} tone="danger" />
      ) : null}
    </Card>
  );
};

/**
 * Organizations (A23): each domain's SSO connection with its two gates (Verified, Tested) and
 * whether it's Active, then the platform's SP certificate.
 */
export default function Organizations({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  useRegisterCreateActions("admin", ["organisation"]);
  const { organisations, spCertificate } = loaderData;

  return (
    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
      <header className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] leading-[1.3] font-semibold">{t("organizations.title")}</h1>
          <p className="text-base text-muted">{t("organizations.subtitle")}</p>
        </div>
        <Button asChild>
          <Link to="/organisations/new">{t("organizations.new")}</Link>
        </Button>
      </header>

      <ResponsiveTable
        columns={[
          {
            card: "title",
            cell: (org) => (
              <Link
                className="font-mono text-sm text-primary hover:underline"
                to={`/organisations/${encodeURIComponent(org.domain)}`}
              >
                {org.domain}
              </Link>
            ),
            header: t("organizations.columns.domain"),
            key: "domain",
            value: (org) => org.domain,
          },
          {
            card: "meta",
            cell: (org) => org.orgName,
            header: t("organizations.columns.organization"),
            key: "organization",
            value: (org) => org.orgName,
          },
          {
            card: "status",
            cell: (org) => <Badge tone="neutral">{org.protocol.toUpperCase()}</Badge>,
            header: t("organizations.columns.protocol"),
            key: "protocol",
            value: (org) => org.protocol,
          },
          {
            card: "status",
            cell: (org) => (
              <div className="flex flex-wrap items-center gap-1">
                <Badge tone={org.verified ? "ok" : "neutral"}>
                  {org.verified
                    ? t("organizations.badges.verified")
                    : t("organizations.badges.notVerified")}
                </Badge>
                <Badge tone={org.testPassed ? "ok" : "neutral"}>
                  {org.testPassed
                    ? t("organizations.badges.tested")
                    : t("organizations.badges.notTested")}
                </Badge>
                <Badge tone={org.enabled ? "primary" : "neutral"}>
                  {org.enabled
                    ? t("organizations.badges.active")
                    : t("organizations.badges.inactive")}
                </Badge>
              </div>
            ),
            header: t("organizations.columns.status"),
            key: "status",
          },
        ]}
        empty={
          <EmptyState
            description={t("organizations.empty.description")}
            title={t("organizations.empty.title")}
          />
        }
        label={t("organizations.title")}
        rowKey={(org) => org.domain}
        rows={organisations}
        search={{
          label: t("organizations.search"),
          placeholder: t("organizations.search"),
          text: (org) => `${org.domain} ${org.orgName}`,
        }}
      />

      <SpCertificateCard certificate={spCertificate} />
    </div>
  );
}
