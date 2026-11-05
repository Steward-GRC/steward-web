// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  Spinner,
} from "@steward-web/ui";
import { type PolicyDetail, Sensitivity } from "@steward-web/ui/domain";
import { Download } from "lucide-react";
import { useEffect, useRef } from "react";

import { refusalIn, useGovernanceFetcher } from "./useGovernance";

/** How long to wait between asks while the PDF is rendering. */
const POLL_MS = 1500;

/**
 * D16: "Export PDF". Opening it starts the render of the published version; while it renders
 * the dialog says so beside a spinner, then "Your PDF is ready to download." with Close and
 * Download PDF. A sensitive document's line says it's watermarked.
 */
export const ExportPdfDialog = ({ detail }: { detail: PolicyDetail }) => {
  const { t } = useTranslation("admin");
  const start = useGovernanceFetcher();
  const poll = useGovernanceFetcher();
  const started = useRef(false);
  const submitStart = start.submit;
  const submitPoll = poll.submit;

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void submitStart({ intent: "exportPdf" }, { method: "post" });
  }, [submitStart]);

  const jobId = start.data?.ok && start.data.intent === "exportPdf" ? start.data.jobId : undefined;
  const answer = poll.data?.ok && poll.data.intent === "pdfLink" ? poll.data : undefined;
  const signedUrl = answer && !answer.pending ? answer.signedUrl : undefined;
  const failure = refusalIn(start) ?? refusalIn(poll);

  // Ask straight away once the job exists, then again after a pause while it's still pending.
  const pending = answer?.pending === true;
  const pollIdle = poll.state === "idle";
  useEffect(() => {
    if (!jobId || !pollIdle || signedUrl || failure) return;
    const timer = setTimeout(
      () => void submitPoll({ intent: "pdfLink", jobId }, { method: "post" }),
      pending ? POLL_MS : 0,
    );
    return () => clearTimeout(timer);
  }, [failure, jobId, pending, pollIdle, signedUrl, submitPoll]);

  const sensitive = detail.sensitivity === Sensitivity.Sensitive;
  return (
    <DialogContent
      description={
        sensitive ? t("governance.exportPdf.sensitive", { title: detail.title }) : detail.title
      }
      title={t("governance.exportPdf.title")}
    >
      <DialogBody aria-live="polite">
        {failure ? (
          <Banner failure={failure} title={t("governance.exportPdf.failed")} tone="danger" />
        ) : signedUrl ? (
          <p className="rounded-[8px] bg-ok-soft p-3 font-semibold text-ok">
            {t("governance.exportPdf.ready")}
          </p>
        ) : (
          <p className="flex items-center gap-2.5 rounded-[8px] bg-sunken p-3">
            <Spinner className="size-3.5 text-primary" />
            {t("governance.exportPdf.rendering")}
          </p>
        )}
      </DialogBody>
      {signedUrl || failure ? (
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t("actions.close", { ns: "common" })}</Button>
          </DialogClose>
          {signedUrl ? (
            <Button asChild>
              <a download href={signedUrl} rel="noreferrer" target="_blank">
                <Download aria-hidden="true" className="size-4" />
                {t("governance.exportPdf.download")}
              </a>
            </Button>
          ) : null}
        </DialogFooter>
      ) : null}
    </DialogContent>
  );
};
