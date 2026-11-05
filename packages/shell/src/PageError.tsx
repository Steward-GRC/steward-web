// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDateTime, useTranslation } from "@steward-web/i18n";
import { Button, type Failure } from "@steward-web/ui";
import { useId, useState } from "react";
import { Link, useLocation } from "react-router";

import { buildInfo, useCopyDiagnostics } from "./CopyDiagnostics";

/** The browser's everyday name for the error report: "Firefox", "Edge", "Chrome", "Safari". */
export const browserName = (userAgent: string): string => {
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Chrome\//.test(userAgent)) return "Chrome";
  if (/Safari\//.test(userAgent)) return "Safari";
  return "Browser";
};

/**
 * The page error (G17; decision 6-states.s4): "Something went wrong on this page", the Error
 * report block (reference and page, then Steward's version, the browser and the time), then
 * Copy for support, Retry and Back to policies. "Copied" shows in the report's header.
 */
export const PageError = ({ failure }: { failure?: Failure }) => {
  const { t } = useTranslation("errors");
  const location = useLocation();
  const titleId = useId();
  const reportId = useId();
  const { busy, copied, copy, fallback } = useCopyDiagnostics(failure);
  const [at] = useState(() => new Date());
  const reference = failure?.requestId ?? failure?.traceId;
  const where = [reference ? t("page.reference", { reference }) : null, location.pathname]
    .filter(Boolean)
    .join(" · ");
  const build = [
    t("page.steward", { version: buildInfo().version }),
    browserName(globalThis.navigator?.userAgent ?? ""),
    formatDateTime(at),
  ].join(" · ");

  return (
    <section
      aria-labelledby={titleId}
      className="mx-auto my-10 flex w-[calc(100%-32px)] max-w-[520px] flex-col gap-3 rounded-lg border border-[rgb(0_0_0/.12)] bg-background p-7 text-base text-ink"
    >
      <h1 className="text-[22px] leading-[1.3] font-semibold" id={titleId}>
        {t("page.title")}
      </h1>
      <p className="leading-normal text-muted">{t("page.description")}</p>
      <section
        aria-labelledby={reportId}
        className="overflow-hidden rounded-[8px] border border-border bg-surface"
      >
        <div className="flex justify-between border-b border-border bg-sunken px-3 py-2 text-xs font-semibold">
          <h2 id={reportId}>{t("page.report")}</h2>
          <span aria-live="polite" className="text-ok">
            {copied ? t("page.copied") : null}
          </span>
        </div>
        <p className="p-3 font-mono text-xs leading-normal text-muted">
          <span className="block">{where}</span>
          <span className="block">{build}</span>
        </p>
      </section>
      <div className="flex flex-wrap gap-2">
        <Button
          busy={busy}
          className="h-[38px] px-3.5"
          onClick={() => void copy()}
          variant="secondary"
        >
          {t("page.copy")}
        </Button>
        <Button className="h-[38px] px-3.5" onClick={() => globalThis.location.reload()}>
          {t("page.retry")}
        </Button>
        <Link
          className="flex h-[38px] items-center px-1.5 text-base font-semibold text-primary no-underline hover:text-primary-hover"
          to="/policies"
        >
          {t("page.back")}
        </Link>
      </div>
      {fallback}
    </section>
  );
};
