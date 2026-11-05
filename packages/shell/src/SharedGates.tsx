import type { SharedPolicy, SsoTestOutcome } from "@steward-web/auth";

// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDate, useTranslation } from "@steward-web/i18n";
import { GatePage, initialsOf, Mark } from "@steward-web/ui";
import { Building2, CircleCheck, Clock, Eye, Link2Off, XCircle } from "lucide-react";
import { useId } from "react";
import { Form } from "react-router";

import { RoundIcon, StatusCard } from "./StatusGates";

/**
 * G16: one pinned policy version opened from a shared link, without signing in. The
 * organisation and a "Read-only shared copy" marker across the top, the document in the reading
 * style at full width (decision 2-layout-and-navigation.s9), and who shared it at the foot.
 */
export const SharedPolicyReader = ({
  organisation,
  policy,
}: {
  organisation: null | string | undefined;
  policy: SharedPolicy;
}) => {
  const { t } = useTranslation("shell");
  return (
    <div className="flex flex-1 flex-col bg-background text-base text-ink">
      <header className="flex h-[52px] items-center gap-2.5 border-b border-border-strong bg-surface px-[18px]">
        {organisation ? (
          <>
            <span
              aria-hidden="true"
              className="flex h-[26px] w-10 items-center justify-center rounded-[5px] bg-sunken text-[11px] font-semibold text-muted"
            >
              {initialsOf(organisation)}
            </span>
            <b className="font-bold">{organisation}</b>
          </>
        ) : null}
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-info-soft px-2.5 py-1 text-xs font-semibold text-info">
          <Eye aria-hidden="true" className="size-[1.15em]" />
          {t("shared.marker")}
        </span>
      </header>
      <div className="flex flex-1 flex-col gap-2 px-4 py-[26px] sm:px-11">
        <span className="text-xs font-medium text-muted">{policy.category}</span>
        <h1 className="font-serif text-[30px] leading-tight font-semibold">{policy.title}</h1>
        <span className="font-mono text-[13px] text-muted">
          {t("shared.meta", {
            expires: formatDate(policy.expiresAt),
            number: policy.number,
            version: policy.version,
          })}
        </span>
        <div className="doc mt-2">
          {policy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-1.5 font-serif text-[23px] font-semibold">{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
      <footer className="flex items-center justify-between border-t border-border bg-surface px-[18px] py-3 text-xs text-muted">
        <span>{t("shared.footer", { name: policy.sharedBy })}</span>
        <span className="flex items-center gap-1.5">
          <Mark size={16} />
          {t("brand.name")}
        </span>
      </footer>
    </div>
  );
};

/** G16's side cards: 12 px corners, 20 px padding, on the page's own background. */
const SideCard = ({
  children,
  gap = "gap-1.5",
  title,
}: {
  children: React.ReactNode;
  gap?: string;
  title: string;
}) => {
  const headingId = useId();
  return (
    <GatePage className="bg-background">
      <section
        aria-labelledby={headingId}
        className={`flex w-full max-w-[400px] flex-col rounded-xl border border-border bg-surface p-5 ${gap}`}
      >
        <h1 className="text-md font-bold" id={headingId}>
          {title}
        </h1>
        {children}
      </section>
    </GatePage>
  );
};

/** G16: a revoked link, or one past its expiry date. */
export const SharedLinkRefused = ({
  expiredAt,
  reason,
}: {
  expiredAt?: string;
  reason: "expired" | "revoked";
}) => {
  const { t } = useTranslation("shell");
  return (
    <SideCard
      title={
        reason === "revoked"
          ? t("shared.revoked.title")
          : t("shared.expired.title", { date: formatDate(expiredAt) })
      }
    >
      <p className="leading-normal text-muted">{t("shared.revoked.body")}</p>
    </SideCard>
  );
};

/** G16: a sensitive policy asks for the reader's email before it shows. */
export const SharedEmailPrompt = () => {
  const { t } = useTranslation("shell");
  return (
    <SideCard gap="gap-2.5" title={t("shared.email.title")}>
      <p className="leading-normal text-muted">{t("shared.email.body")}</p>
      <Form className="flex flex-col gap-2.5" method="post">
        <input
          aria-label={t("shared.email.label")}
          autoComplete="email"
          className="h-[42px] w-full rounded-md border border-control bg-surface px-2.5 text-ink placeholder:text-muted focus-visible:border-primary"
          name="email"
          placeholder="name@example.org"
          required
          type="email"
        />
        <button
          className="flex h-[42px] items-center justify-center rounded-md bg-primary font-semibold text-on-primary hover:bg-primary-hover"
          type="submit"
        >
          {t("shared.email.submit")}
        </button>
      </Form>
    </SideCard>
  );
};

/** Until steward-gateway can look a shared link up without a session, G16 says so. */
export const SharedUnavailable = () => {
  const { t } = useTranslation("shell");
  return (
    <StatusCard
      title={t("shared.unavailable.title")}
      visual={
        <RoundIcon className="bg-sunken text-muted">
          <Link2Off className="size-[1.15em]" />
        </RoundIcon>
      }
    >
      <p className="text-sm leading-normal text-muted">{t("shared.unavailable.body")}</p>
    </StatusCard>
  );
};

/** G18: the landing page for someone at another organisation asked to test their sign-in. */
export const SsoTestLanding = ({
  domain,
  organisation,
  requester,
  token,
  validHours,
}: {
  domain: string;
  organisation: string;
  requester: string;
  token: string;
  validHours: number;
}) => {
  const { t } = useTranslation("shell");
  return (
    <StatusCard
      title={t("ssoTest.landing.title", { domain })}
      visual={
        <RoundIcon className="bg-primary-soft text-on-primary-soft">
          <Building2 className="size-[1.15em]" />
        </RoundIcon>
      }
    >
      <p className="text-sm leading-normal text-muted">
        {t("ssoTest.landing.body", { count: validHours, organisation, requester })}
      </p>
      {/* The gateway's SSO start, on this app's origin (#54), runs the test from the link. */}
      <a
        className="flex h-[42px] items-center justify-center self-stretch rounded-md bg-primary font-semibold text-on-primary hover:bg-primary-hover hover:text-on-primary"
        href={`/auth/sso/start?${new URLSearchParams({ testToken: token })}`}
      >
        {t("ssoTest.landing.start")}
      </a>
    </StatusCard>
  );
};

/** Until steward-gateway can look a test link up without a session, G18 says so. */
export const SsoTestUnavailable = () => {
  const { t } = useTranslation("shell");
  return (
    <StatusCard
      title={t("ssoTest.unavailable.title")}
      visual={
        <RoundIcon className="bg-sunken text-muted">
          <Building2 className="size-[1.15em]" />
        </RoundIcon>
      }
    >
      <p className="text-sm leading-normal text-muted">{t("ssoTest.unavailable.body")}</p>
    </StatusCard>
  );
};

/** The test failure reasons G18r can put into words. */
const KNOWN_REASONS = new Set(["sso_no_email"]);

/** G18r: the remote SSO test passed, failed (with why), or its link expired. */
export const SsoTestResult = ({
  outcome,
  reason,
}: {
  outcome: SsoTestOutcome;
  reason?: string;
}) => {
  const { t } = useTranslation("shell");
  if (outcome === "passed") {
    return (
      <StatusCard
        title={t("ssoTest.result.passed")}
        visual={
          <RoundIcon className="bg-ok-soft text-ok">
            <CircleCheck className="size-[1.15em]" />
          </RoundIcon>
        }
      />
    );
  }
  if (outcome === "expired") {
    return (
      <StatusCard
        title={t("ssoTest.result.expired")}
        visual={
          <RoundIcon className="bg-sunken text-muted">
            <Clock className="size-[1.15em]" />
          </RoundIcon>
        }
      >
        <p className="text-sm leading-normal text-muted">{t("ssoTest.result.expiredBody")}</p>
      </StatusCard>
    );
  }
  return (
    <StatusCard
      title={t("ssoTest.result.failed")}
      visual={
        <RoundIcon className="bg-danger-soft text-danger">
          <XCircle className="size-[1.15em]" />
        </RoundIcon>
      }
    >
      {reason && KNOWN_REASONS.has(reason) ? (
        <p className="text-sm leading-normal text-muted">{t(`ssoTest.reason.${reason}`)}</p>
      ) : (
        <>
          <p className="text-sm leading-normal text-muted">{t("ssoTest.reason.other")}</p>
          {reason ? <code className="font-mono text-xs text-muted">{reason}</code> : null}
        </>
      )}
    </StatusCard>
  );
};
