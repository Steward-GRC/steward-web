// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Organization } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { Banner, Button } from "@steward-web/ui";
import { useEffect, useId, useRef, useState } from "react";
import { useFetcher, useHref, useRevalidator } from "react-router";

import { CARD, failureOf, type OrgActionResult } from "./orgActionResult";
import { ssoTestLinkPath } from "./ssoTestLink";

/**
 * Step 3, the IdP test (A24): "Run IdP test" in a popup, whose result comes back here, or "Copy
 * remote test link" for someone at the organization to run it (G18). The last result shows as
 * "IdP test passed" or "IdP test failed".
 */
export const IdpTestCard = ({ org }: { org: Organization }) => {
  const { t } = useTranslation("admin");
  const titleId = useId();
  const revalidator = useRevalidator();
  const copyLink = useFetcher<OrgActionResult>();
  const [linkCopied, setLinkCopied] = useState(false);
  const [lastResult, setLastResult] = useState<"failed" | "passed" | null>(null);

  // The minted link is copied once it lands; the clipboard write is the effect's only job.
  const minted =
    copyLink.state === "idle" && copyLink.data?.ok && "link" in copyLink.data
      ? copyLink.data.link?.url
      : undefined;
  useEffect(() => {
    if (!minted) return;
    void navigator.clipboard?.writeText(minted).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [minted]);

  // "Run IdP test" opens /resources/sso-test-link in a popup: the gateway's callback posts the
  // result back to this window and closes it; a popup closed without a message still reloads.
  const [testPending, setTestPending] = useState(false);
  const popupRef = useRef<null | Window>(null);
  const { revalidate } = revalidator;
  useEffect(() => {
    if (!testPending) return;
    const popup = popupRef.current;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== globalThis.location.origin) return;
      const message = event.data as { success?: boolean; type?: string } | null;
      if (message?.type !== "idp-test-result") return;
      try {
        popup?.close();
      } catch {
        // Already closed, or cross-origin by the time this runs.
      }
      setLastResult(message.success ? "passed" : "failed");
      setTestPending(false);
      void revalidate();
    };
    globalThis.addEventListener("message", onMessage);
    const closedPoll = globalThis.setInterval(() => {
      if (popup?.closed) {
        setTestPending(false);
        void revalidate();
      }
    }, 500);
    return () => {
      globalThis.removeEventListener("message", onMessage);
      globalThis.clearInterval(closedPoll);
    };
  }, [revalidate, testPending]);

  // window.open bypasses the router, so the basename is added to the test link by hand.
  const basename = useHref("/");
  const testUrl = ssoTestLinkPath(basename, org);
  const result = lastResult ?? (org.testPassed ? "passed" : null);
  const failure = failureOf(copyLink);

  return (
    <section aria-labelledby={titleId} className={`${CARD} flex flex-col gap-2.5`}>
      <b id={titleId}>{t("organizations.setup.test.title")}</b>
      {result === "passed" ? (
        <Banner title={t("organizations.setup.test.passed")} tone="ok" />
      ) : result === "failed" ? (
        <Banner title={t("organizations.setup.test.failed")} tone="danger" />
      ) : null}
      {org.verified ? (
        <>
          <p className="text-sm text-muted">{t("organizations.setup.test.description")}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              disabled={testPending}
              onClick={() => {
                const popup = globalThis.open(testUrl, "idp-test", "width=520,height=680");
                if (!popup) {
                  globalThis.location.assign(testUrl);
                  return;
                }
                popupRef.current = popup;
                setTestPending(true);
              }}
            >
              {testPending
                ? t("organizations.setup.test.running")
                : org.testPassed
                  ? t("organizations.setup.test.again")
                  : t("organizations.setup.test.run")}
            </Button>
            <Button
              disabled={copyLink.state !== "idle"}
              onClick={() => void copyLink.submit({ intent: "mint-test-link" }, { method: "post" })}
              variant="secondary"
            >
              {linkCopied
                ? t("organizations.setup.test.copied")
                : copyLink.state === "idle"
                  ? t("organizations.setup.test.copyLink")
                  : t("organizations.setup.test.creating")}
            </Button>
          </div>
          <p className="text-xs text-muted">
            {t("organizations.setup.test.copyLinkHint", { domain: org.domain })}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted">{t("organizations.setup.test.needsDomain")}</p>
      )}
      {failure ? (
        <Banner failure={failure} title={t("organizations.setup.test.linkFailed")} tone="danger" />
      ) : null}
    </section>
  );
};
