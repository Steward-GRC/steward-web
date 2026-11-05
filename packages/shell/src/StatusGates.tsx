// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { GlobalSettings } from "@steward-web/api-client";

import { canOpenAdmin, type Identity } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { GateBrand, GateCard, GatePage, Loader } from "@steward-web/ui";
import { Clock, Lock, Server } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { useFetcher, useNavigate } from "react-router";

import { type InstanceState, type InstanceStatus, STATUS_PATH } from "./status";

/** A gate the root draws in place of every page. */
export type StatusGate = "adminsOnly" | "maintenance";

/**
 * Which status gate, if any, replaces the page:
 *
 * - **Maintenance lockdown (G11)** while a site admin has maintenance on. The staff app closes
 *   for everyone (site admins get the way to the admin portal). The admin console stays open
 *   to site admins, and to sign-in, so they can lift it; anyone else signed in there is locked
 *   out too.
 * - **Admins only (G12)** for someone signed in to the admin console with no way into it.
 *
 * Settings that couldn't be read never lock anything.
 */
export const statusGateFor = ({
  app,
  identity,
  settings,
}: {
  app: "admin" | "staff";
  identity: Identity;
  settings: GlobalSettings | null | undefined;
}): StatusGate | undefined => {
  const signedIn = identity.id !== "";
  if (settings?.maintenance.enabled) {
    if (app === "staff") return "maintenance";
    if (signedIn && !identity.isSiteAdmin) return "maintenance";
  }
  if (app === "admin" && signedIn && !canOpenAdmin(identity)) return "adminsOnly";
  return undefined;
};

/** Asks the app's status route every `every` ms (never for 0) and hands each answer on. */
const useStatusPoll = (every: number, onStatus: (status: InstanceStatus) => void) => {
  const fetcher = useFetcher<InstanceStatus>();
  const handled = useRef<unknown>(undefined);
  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;
  const { load } = fetcher;

  useEffect(() => {
    if (every <= 0) return;
    const timer = setInterval(() => void load(STATUS_PATH), every);
    return () => clearInterval(timer);
  }, [every, load]);

  useEffect(() => {
    const status = fetcher.data;
    if (fetcher.state !== "idle" || !status || handled.current === status) return;
    handled.current = status;
    onStatusRef.current(status);
  }, [fetcher.data, fetcher.state]);
};

/** A small status card (G1, G2, G12): Steward, a visual, the title and the line under it. */
const StatusCard = ({
  children,
  className,
  testId,
  title,
  visual,
}: {
  children?: ReactNode;
  className?: string;
  testId?: string;
  title?: string;
  visual: ReactNode;
}) => {
  const headingId = useId();
  return (
    <GatePage>
      <GateCard
        aria-labelledby={title ? headingId : undefined}
        className={`items-center text-center ${className ?? ""}`}
        data-testid={testId}
      >
        <GateBrand />
        {visual}
        {title ? (
          <h1 className="text-[17px] leading-6 font-bold" id={headingId}>
            {title}
          </h1>
        ) : null}
        {children}
      </GateCard>
    </GatePage>
  );
};

/** The 44 px round icon G2 and G12 carry. */
const RoundIcon = ({ children, className }: { children: ReactNode; className: string }) => (
  <span
    aria-hidden="true"
    className={`flex size-11 items-center justify-center rounded-full text-xl ${className}`}
  >
    {children}
  </span>
);

/** G1: the looping loading mark while the app asks whether this Steward is set up. */
export const CheckingGate = () => {
  const { t } = useTranslation("shell");
  return (
    <StatusCard
      className="stw-appear-late"
      testId="gate-card"
      visual={<Loader label={t("gates.checking")} size={56} />}
    />
  );
};

/** G2: first-run setup hasn't made the root administrator yet. No form. */
export const NotSetUpGate = () => {
  const { t } = useTranslation("shell");
  return (
    <StatusCard
      title={t("gates.notSetUp.title")}
      visual={
        <RoundIcon className="bg-info-soft text-info">
          <Clock className="size-[1.15em]" />
        </RoundIcon>
      }
    >
      <p className="text-sm leading-normal text-muted">{t("gates.notSetUp.body")}</p>
    </StatusCard>
  );
};

/**
 * G1 and G2 on one page: G1 while the instance can't be reached, G2 while it isn't set up,
 * checking again every few seconds and switching to sign-in by itself once it is.
 */
export const InstanceGate = ({
  checkEvery = 5000,
  instance,
  next,
  poll = true,
}: {
  checkEvery?: number;
  instance: InstanceState;
  /** Where sign-in goes once the instance is ready. */
  next: string;
  /** Check again by itself; off only for a dev preview holding the gate on screen. */
  poll?: boolean;
}) => {
  const navigate = useNavigate();
  const [shown, setShown] = useState<InstanceState>(instance);
  useStatusPoll(poll ? checkEvery : 0, (status) => {
    if (status.instance === "ready") {
      void navigate(`/sign-in?next=${encodeURIComponent(next)}`, { replace: true });
      return;
    }
    setShown(status.instance);
  });
  return shown === "needsSetup" ? <NotSetUpGate /> : <CheckingGate />;
};

/**
 * G11: the maintenance lockdown. A calm full page on the normal background, not hazard
 * stripes: the looping loading mark, "Maintenance", the heading, the admin's message, and
 * "This page will reconnect automatically." with a plum dot. It checks every few seconds and
 * reloads the page once maintenance is over. Site admins get "Go to admin portal →", which
 * stays open to them so they can lift it.
 */
export const MaintenanceGate = ({
  adminUrl,
  checkEvery = 10_000,
  message,
  onReconnect = () => globalThis.location.reload(),
}: {
  /** Only for a site admin: where the admin console is. */
  adminUrl?: string;
  checkEvery?: number;
  message: string;
  onReconnect?: () => void;
}) => {
  const { t } = useTranslation("shell");
  const reconnected = useRef(false);
  useStatusPoll(checkEvery, (status) => {
    if (status.maintenance || reconnected.current) return;
    reconnected.current = true;
    onReconnect();
  });
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-[14px] bg-background px-4 py-10 text-center text-base text-ink"
      data-testid="maintenance-gate"
    >
      <Loader decorative size={72} />
      <span className="text-xs font-semibold tracking-[.08em] text-muted uppercase">
        {t("gates.maintenance.kicker")}
      </span>
      <h1 className="font-serif text-[28px] leading-9 font-semibold">
        {t("gates.maintenance.title")}
      </h1>
      <p className="max-w-[480px] text-md leading-[1.55] text-muted">
        {message.trim() || t("gates.maintenance.body")}
      </p>
      <span className="flex items-center gap-2 text-muted" role="status">
        <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
        {t("gates.maintenance.reconnect")}
      </span>
      {adminUrl ? (
        <a
          className="flex items-center gap-1.5 font-semibold text-primary hover:text-primary-hover"
          href={adminUrl}
        >
          <Server aria-hidden="true" className="size-[1.15em]" />
          {t("gates.maintenance.admin")}
        </a>
      ) : null}
    </div>
  );
};

/** G12: someone signed in to the admin console who has no way into it. */
export const AdminsOnlyGate = ({ name, staffUrl }: { name: string; staffUrl: string }) => {
  const { t } = useTranslation("shell");
  return (
    <StatusCard
      title={t("gates.adminsOnly.title")}
      visual={
        <RoundIcon className="bg-sunken text-muted">
          <Lock className="size-[1.15em]" />
        </RoundIcon>
      }
    >
      <p className="text-sm leading-normal text-muted">
        {t("gates.adminsOnly.body")} {t("gates.adminsOnly.signedInAs.before")}
        <b className="font-bold text-ink">{name}</b>
        {t("gates.adminsOnly.signedInAs.after")}
      </p>
      <a className="text-sm font-semibold text-primary hover:text-primary-hover" href={staffUrl}>
        {t("gates.adminsOnly.back")}
      </a>
    </StatusCard>
  );
};
