// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { DomainVerification } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { Banner, Button, Spinner } from "@steward-web/ui";
import { useEffect, useId, useState } from "react";
import { useFetcher } from "react-router";

import { CARD, failureOf, type OrgActionResult } from "./orgActionResult";

/** How often step 2 checks the DNS record on its own. */
const CHECK_EVERY_MS = 10_000;

/** One read-only DNS value with its Copy button, as A24 draws it. */
const RecordField = ({
  copyLabel,
  label,
  value,
}: {
  copyLabel: string;
  label: string;
  value: string;
}) => {
  const { t } = useTranslation("admin");
  const id = useId();
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted" htmlFor={id}>
        {label}
      </label>
      <span className="flex h-[38px] items-center gap-2 rounded-md border border-border bg-sunken px-2.5">
        <input
          className="min-w-0 flex-1 bg-transparent font-mono text-sm text-ink outline-none"
          id={id}
          readOnly
          value={value}
        />
        <button
          aria-label={copyLabel}
          className="text-xs font-semibold text-primary"
          onClick={() =>
            void navigator.clipboard?.writeText(value).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            })
          }
          type="button"
        >
          {copied ? t("organizations.setup.dns.copied") : t("organizations.setup.dns.copy")}
        </button>
      </span>
    </div>
  );
};

/**
 * Step 2, domain verification (A24): the DNS TXT record's name and value to copy, Verify, an
 * automatic check every 10 seconds while the record isn't found yet, and Rotate token.
 */
export const DnsRecordCard = ({
  verification,
  verified,
}: {
  verification: DomainVerification | null;
  verified: boolean;
}) => {
  const { t } = useTranslation("admin");
  const titleId = useId();
  const verify = useFetcher<OrgActionResult>();
  const rotate = useFetcher<OrgActionResult>();
  const { submit } = verify;
  // A record not found yet is expected while the check runs on its own; only a Verify the
  // person pressed reports its refusal.
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (verified) return;
    const timer = globalThis.setInterval(() => {
      setManual(false);
      void submit({ intent: "verify-domain" }, { method: "post" });
    }, CHECK_EVERY_MS);
    return () => globalThis.clearInterval(timer);
  }, [submit, verified]);

  const failure = failureOf(rotate) ?? (manual ? failureOf(verify) : undefined);
  return (
    <section aria-labelledby={titleId} className={`${CARD} flex flex-col gap-2.5`}>
      <b id={titleId}>{t("organizations.setup.dns.title")}</b>
      {verification ? (
        <>
          <RecordField
            copyLabel={t("organizations.setup.dns.copyName")}
            label={t("organizations.setup.dns.name")}
            value={verification.dnsRecordName}
          />
          <RecordField
            copyLabel={t("organizations.setup.dns.copyValue")}
            label={t("organizations.setup.dns.value")}
            value={verification.dnsRecordValue}
          />
        </>
      ) : null}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          busy={verify.state !== "idle"}
          onClick={() => {
            setManual(true);
            void submit({ intent: "verify-domain" }, { method: "post" });
          }}
        >
          {t("organizations.setup.dns.verify")}
        </Button>
        {verified ? null : (
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <Spinner className="size-3" />
            {t("organizations.setup.dns.checking")}
          </span>
        )}
        <button
          className="ml-auto text-sm font-semibold text-primary hover:underline"
          onClick={() => void rotate.submit({ intent: "rotate-verification" }, { method: "post" })}
          type="button"
        >
          {t("organizations.setup.dns.rotate")}
        </button>
      </div>
      {failure ? (
        <Banner failure={failure} title={t("organizations.setup.dns.failed")} tone="danger" />
      ) : null}
    </section>
  );
};
