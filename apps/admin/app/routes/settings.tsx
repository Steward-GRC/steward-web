// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { HardResetResult, WorkCalendarInput } from "@steward-web/api-client";

import { GatewayError } from "@steward-web/api-client";
import { identityFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf, SiteBanners } from "@steward-web/shell";
import {
  Banner,
  Button,
  type Failure,
  Field,
  Input,
  Select,
  Switch,
  Textarea,
} from "@steward-web/ui";
import { useId, useState } from "react";
import { data, useFetcher } from "react-router";

import type { Route } from "./+types/settings";

import { complianceErrorCode, HARD_RESET_PHRASE } from "../settings/complianceErrors";
import { ComplianceModuleCard } from "../settings/ComplianceModuleCard";
import { HardResetCard } from "../settings/HardResetCard";
import {
  approveComplianceHardReset,
  cancelComplianceHardReset,
  executeComplianceHardReset,
  getAiSettings,
  getAppliance,
  getComplianceSettings,
  getEmailServiceConfig,
  getGlobalSettings,
  getHardReset,
  requestComplianceHardReset,
  saveEmailServiceConfig,
  saveGlobalSettings,
  saveWorkCalendar,
  setAiEnabled,
  setAiToken,
  setAiTopK,
  setComplianceModule,
} from "../settings/settings.server";
import { SettingsCard } from "../settings/SettingsCard";
import { calendarSummary, parseWorkCalendar } from "../settings/workCalendar";
import { WorkCalendarForm } from "../settings/WorkCalendarForm";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const identity = await identityFromRequest(request);
  const [globalSettings, emailServiceConfig, ai, appliance, compliance, hardReset] =
    await Promise.all([
      getGlobalSettings(request),
      getEmailServiceConfig(request),
      // The AI cards show only when the AI module answers.
      getAiSettings(request).catch(() => null),
      getAppliance(request),
      // The Compliance card shows only to those who may manage it and only when it answers.
      getComplianceSettings(request).catch(() => null),
      // The hard reset card is for site admins; a refusal or an outage hides it, not the page.
      identity.isSiteAdmin ? getHardReset(request).catch(() => null) : Promise.resolve(null),
    ]);
  return { ai, appliance, compliance, emailServiceConfig, globalSettings, hardReset };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const field = (name: string) => String(form.get(name) ?? "").trim();

  try {
    switch (intent) {
      case "ai-clear-token": {
        await setAiToken(request, "");
        break;
      }
      case "ai-enabled": {
        await setAiEnabled(request, field("enabled") === "true");
        break;
      }
      case "ai-token": {
        await setAiToken(request, field("token"));
        break;
      }
      case "ai-top-k": {
        await setAiTopK(request, Number(field("topK")) || 0);
        break;
      }
      case "compliance-module": {
        await setComplianceModule(request, field("enabled") === "true");
        break;
      }
      case "email-clear-key":
      case "save-email": {
        const apiKey = String(form.get("apiKey") ?? "");
        await saveEmailServiceConfig(request, {
          // Blank keeps the stored key; "" through Clear key removes it.
          apiKey: intent === "email-clear-key" ? "" : apiKey === "" ? undefined : apiKey,
          domain: field("domain"),
          enabled: field("enabled") === "true",
          fromAddress: field("fromAddress"),
          provider: field("provider"),
          region: field("region"),
        });
        break;
      }
      case "hard-reset-approve": {
        await approveComplianceHardReset(request, field("requestId"));
        break;
      }
      case "hard-reset-cancel": {
        await cancelComplianceHardReset(request, field("requestId"));
        break;
      }
      case "hard-reset-execute": {
        // The screen asks for both; a request that skips them is turned back here too.
        if (field("exportAcknowledged") !== "true") {
          return data({ intent, invalid: true, ok: false } as const, { status: 400 });
        }
        const confirmation = String(form.get("confirmation") ?? "");
        if (confirmation !== HARD_RESET_PHRASE) {
          return data(
            {
              complianceError: "HARD_RESET_CONFIRMATION",
              failure: {},
              intent,
              ok: false,
            } as const,
            { status: 400 },
          );
        }
        const result = await executeComplianceHardReset(request, field("requestId"), confirmation);
        return { intent, ok: true, result } as const;
      }
      case "hard-reset-request": {
        const reason = field("reason");
        if (reason === "")
          return data({ intent, invalid: true, ok: false } as const, { status: 400 });
        await requestComplianceHardReset(request, reason);
        break;
      }
      case "save-global": {
        await saveGlobalSettings(request, {
          announcement: {
            enabled: field("announcementEnabled") === "true",
            level: field("announcementLevel") || "info",
            message: field("announcementMessage"),
          },
          maintenance: {
            enabled: field("maintenanceEnabled") === "true",
            message: field("maintenanceMessage"),
          },
        });
        break;
      }
      case "save-work-calendar": {
        const calendar = parseWorkCalendar(String(form.get("workCalendar") ?? ""));
        if (!calendar) {
          return data({ intent, invalid: true, ok: false } as const, { status: 400 });
        }
        await saveWorkCalendar(request, calendar);
        break;
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
    return { intent, ok: true } as const;
  } catch (error) {
    if (error instanceof Response) throw error;
    // The gateway words what is wrong with a calendar (an unknown zone, a repeated date) in
    // terms of the calendar's own fields, so it is shown as it comes (INVALID_WORK_CALENDAR).
    if (error instanceof GatewayError && error.code === "INVALID_WORK_CALENDAR") {
      return data(
        { calendarError: error.message, failure: refusalOf(error), intent, ok: false } as const,
        { status: 400 },
      );
    }
    // Reporting's own refusals (the module is off, a hard reset step) are worded on screen from
    // the code; the server's text is never shown.
    const complianceError = complianceErrorCode(
      error instanceof GatewayError ? error.code : undefined,
    );
    if (complianceError) {
      return data({ complianceError, failure: refusalOf(error), intent, ok: false } as const, {
        status: 400,
      });
    }
    return data({ failure: refusalOf(error), intent, ok: false } as const, { status: 400 });
  }
};

type Result =
  | {
      calendarError?: string;
      complianceError?: string;
      failure: Failure;
      intent: string;
      ok: false;
    }
  | { intent: string; invalid: true; ok: false }
  | { intent: string; ok: true; result?: HardResetResult };

const failureOf = (fetcher: { data?: Result; state: string }) =>
  fetcher.state === "idle" && fetcher.data && !fetcher.data.ok && "failure" in fetcher.data
    ? fetcher.data.failure
    : undefined;

/** The gateway's own words for a refused work calendar, shown inside its card. */
const calendarErrorOf = (fetcher: { data?: Result; state: string }) =>
  fetcher.state === "idle" && fetcher.data && !fetcher.data.ok && "calendarError" in fetcher.data
    ? fetcher.data.calendarError
    : undefined;

/** The known compliance refusal code of a settled fetcher's last answer. */
const complianceErrorOf = (fetcher: { data?: Result; state: string }) =>
  fetcher.state === "idle" && fetcher.data && !fetcher.data.ok && "complianceError" in fetcher.data
    ? fetcher.data.complianceError
    : undefined;

const savedOf = (fetcher: { data?: Result; state: string }) =>
  fetcher.state === "idle" && fetcher.data?.ok === true;

/** D36: the inline "are you sure" row before a token or key is cleared. */
const ClearConfirm = ({
  confirm,
  onCancel,
  onConfirm,
  text,
}: {
  confirm: string;
  onCancel: () => void;
  onConfirm: () => void;
  text: string;
}) => {
  const { t } = useTranslation("admin");
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-lg bg-surface px-3.5 py-3 text-sm shadow-[inset_0_0_0_1px_var(--danger)]">
      <span className="min-w-0 flex-1">{text}</span>
      <button className="font-semibold text-muted hover:text-ink" onClick={onCancel} type="button">
        {t("settings.cancel")}
      </button>
      <Button className="h-8 px-3" onClick={onConfirm} variant="danger">
        {confirm}
      </Button>
    </div>
  );
};

/**
 * Settings (A28): seven cards, each a heading with its status pill: the AI provider token, AI
 * features, AI retrieval, outbound email, the working days calendar, the global announcement
 * with its live preview, and the maintenance notice. Full width, as every admin page is. Below
 * them sit the Compliance module switch and the hard reset, for the people who may use them.
 */
export default function Settings({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const { ai, appliance, compliance, emailServiceConfig, globalSettings, hardReset } = loaderData;
  // An appliance configures AI on its own box; here the cards only show what is set (#113).
  const locked = appliance !== null && appliance !== undefined;
  const token = useFetcher<Result>();
  const enabled = useFetcher<Result>();
  const retrieval = useFetcher<Result>();
  const email = useFetcher<Result>();
  const banners = useFetcher<Result>();
  const calendar = useFetcher<Result>();
  const switchModule = useFetcher<Result>();
  const reset = useFetcher<Result>();
  const [clearingToken, setClearingToken] = useState(false);
  const [clearingKey, setClearingKey] = useState(false);
  const [announcement, setAnnouncement] = useState(globalSettings.announcement);
  const [maintenance, setMaintenance] = useState(globalSettings.maintenance);
  const previewId = useId();

  const pendingEnabled = enabled.formData?.get("enabled");
  const aiOn =
    typeof pendingEnabled === "string" ? pendingEnabled === "true" : (ai?.enabled ?? false);
  const saveBanners = () =>
    void banners.submit(
      {
        announcementEnabled: String(announcement.enabled),
        announcementLevel: announcement.level,
        announcementMessage: announcement.message,
        intent: "save-global",
        maintenanceEnabled: String(maintenance.enabled),
        maintenanceMessage: maintenance.message,
      },
      { method: "post" },
    );
  const saveCalendar = (workCalendar: WorkCalendarInput) =>
    void calendar.submit(
      { intent: "save-work-calendar", workCalendar: JSON.stringify(workCalendar) },
      { method: "post" },
    );
  const summary = calendarSummary(globalSettings.workCalendar, (day) =>
    t(`settings.workCalendar.short.${day}`),
  );
  const calendarError = calendarErrorOf(calendar);
  const failure = [token, enabled, retrieval, email, banners, calendar]
    .map((fetcher) => (fetcher === calendar && calendarError ? undefined : failureOf(fetcher)))
    .find(Boolean);

  const post = (fetcher: typeof reset, fields: Record<string, string>) =>
    void fetcher.submit(fields, { method: "post" });
  const resetResult =
    reset.state === "idle" && reset.data?.ok === true ? reset.data.result : undefined;

  return (
    <div className="flex w-full flex-col gap-3 p-4 md:p-6">
      <h1 className="text-[26px] leading-[1.3] font-semibold">{t("settings.title")}</h1>
      {failure ? <Banner failure={failure} title={t("settings.failed")} tone="danger" /> : null}

      {ai && locked ? (
        <Banner title={t("settings.appliance.title", { name: appliance })} tone="info">
          {t("settings.appliance.description")}
        </Banner>
      ) : null}

      {ai ? (
        <>
          <SettingsCard
            description={t("settings.token.description")}
            pill={ai.credentialSet ? t("settings.pills.set") : t("settings.pills.notSet")}
            title={t("settings.token.title")}
            tone={ai.credentialSet ? "ok" : "neutral"}
          >
            {ai.credentialSet ? (
              <p className="font-mono text-sm">
                {t("settings.token.stored", { last4: ai.credentialLast4 })}
              </p>
            ) : null}
            <token.Form className="flex flex-wrap items-end gap-2" method="post">
              <input name="intent" type="hidden" value="ai-token" />
              <Field className="min-w-[220px] flex-1" label={t("settings.token.label")}>
                <Input autoComplete="off" disabled={locked} name="token" required type="password" />
              </Field>
              <Button
                busy={token.state !== "idle"}
                disabled={locked}
                type="submit"
                variant="secondary"
              >
                {t("settings.token.replace")}
              </Button>
              {ai.credentialSet ? (
                <Button
                  disabled={locked}
                  onClick={() => setClearingToken(true)}
                  variant="secondary"
                >
                  {t("settings.token.clear")}
                </Button>
              ) : null}
            </token.Form>
            {clearingToken ? (
              <ClearConfirm
                confirm={t("settings.token.clear")}
                onCancel={() => setClearingToken(false)}
                onConfirm={() => {
                  setClearingToken(false);
                  void token.submit({ intent: "ai-clear-token" }, { method: "post" });
                }}
                text={t("settings.token.confirm")}
              />
            ) : null}
          </SettingsCard>

          <SettingsCard
            description={t("settings.ai.description", { model: ai.model })}
            pill={aiOn ? t("settings.pills.on") : t("settings.pills.off")}
            title={t("settings.ai.title")}
            tone={aiOn ? "ok" : "neutral"}
          >
            <label className="flex items-center gap-3 text-sm">
              <Switch
                aria-label={t("settings.ai.switch")}
                checked={aiOn}
                disabled={locked}
                onCheckedChange={(checked) =>
                  void enabled.submit(
                    { enabled: String(checked), intent: "ai-enabled" },
                    { method: "post" },
                  )
                }
              />
              {t("settings.ai.switch")}
            </label>
          </SettingsCard>

          <SettingsCard
            description={t("settings.retrieval.description")}
            pill={t("settings.pills.results", { count: ai.topK })}
            title={t("settings.retrieval.title")}
            tone="ok"
          >
            <retrieval.Form className="flex flex-wrap items-end gap-2" method="post">
              <input name="intent" type="hidden" value="ai-top-k" />
              <Field label={t("settings.retrieval.label")}>
                <Input
                  className="w-28"
                  defaultValue={ai.topK}
                  disabled={locked}
                  min={0}
                  name="topK"
                  type="number"
                />
              </Field>
              <Button
                busy={retrieval.state !== "idle"}
                disabled={locked}
                type="submit"
                variant="secondary"
              >
                {t("settings.save")}
              </Button>
              {savedOf(retrieval) ? (
                <span className="font-semibold text-ok">{t("settings.saved")}</span>
              ) : null}
            </retrieval.Form>
          </SettingsCard>
        </>
      ) : null}

      <SettingsCard
        description={t("settings.email.description")}
        pill={emailServiceConfig.enabled ? t("settings.pills.on") : t("settings.pills.smtp")}
        title={t("settings.email.title")}
        tone={emailServiceConfig.enabled ? "ok" : "warn"}
      >
        <email.Form className="grid gap-3 md:grid-cols-2" method="post">
          <input name="intent" type="hidden" value="save-email" />
          <label className="flex items-center gap-3 text-sm md:col-span-2">
            <Switch defaultChecked={emailServiceConfig.enabled} name="enabled" value="true" />
            {t("settings.email.switch")}
          </label>
          <Field
            hint={emailServiceConfig.apiKeySet ? t("settings.email.keyStored") : undefined}
            label={t("settings.email.key")}
          >
            <Input autoComplete="off" name="apiKey" type="password" />
          </Field>
          <Field label={t("settings.email.provider")}>
            <Input defaultValue={emailServiceConfig.provider} name="provider" />
          </Field>
          <Field label={t("settings.email.domain")}>
            <Input defaultValue={emailServiceConfig.domain} name="domain" />
          </Field>
          <Field label={t("settings.email.region")}>
            <Input defaultValue={emailServiceConfig.region} name="region" />
          </Field>
          <Field label={t("settings.email.from")}>
            <Input defaultValue={emailServiceConfig.fromAddress} name="fromAddress" type="email" />
          </Field>
          <div className="flex items-center justify-end gap-2 md:col-span-2">
            {savedOf(email) ? (
              <span className="font-semibold text-ok">{t("settings.saved")}</span>
            ) : null}
            {emailServiceConfig.apiKeySet ? (
              <Button onClick={() => setClearingKey(true)} variant="secondary">
                {t("settings.email.clear")}
              </Button>
            ) : null}
            <Button busy={email.state !== "idle"} type="submit">
              {t("settings.save")}
            </Button>
          </div>
        </email.Form>
        {clearingKey ? (
          <ClearConfirm
            confirm={t("settings.email.clear")}
            onCancel={() => setClearingKey(false)}
            onConfirm={() => {
              setClearingKey(false);
              void email.submit(
                {
                  domain: emailServiceConfig.domain,
                  enabled: String(emailServiceConfig.enabled),
                  fromAddress: emailServiceConfig.fromAddress,
                  intent: "email-clear-key",
                  provider: emailServiceConfig.provider,
                  region: emailServiceConfig.region,
                },
                { method: "post" },
              );
            }}
            text={t("settings.email.confirm")}
          />
        ) : null}
      </SettingsCard>

      <SettingsCard
        description={t("settings.workCalendar.description")}
        pill={t("settings.workCalendar.pill", {
          days: summary.days,
          timezone: globalSettings.workCalendar.timezone,
        })}
        title={t("settings.workCalendar.title")}
        tone="ok"
      >
        <WorkCalendarForm
          busy={calendar.state !== "idle"}
          calendar={globalSettings.workCalendar}
          key={JSON.stringify(globalSettings.workCalendar)}
          onSave={saveCalendar}
          saved={savedOf(calendar)}
          serverError={calendarError}
        />
      </SettingsCard>

      <SettingsCard
        description={t("settings.announcement.description")}
        pill={
          announcement.enabled
            ? t("settings.pills.announcement", {
                level: t(`settings.levels.${announcement.level}`, {
                  defaultValue: announcement.level,
                }),
              })
            : t("settings.pills.off")
        }
        title={t("settings.announcement.title")}
        tone={announcement.enabled ? "ok" : "neutral"}
      >
        <label className="flex items-center gap-3 text-sm">
          <Switch
            checked={announcement.enabled}
            onCheckedChange={(checked) => setAnnouncement({ ...announcement, enabled: checked })}
          />
          {t("settings.announcement.switch")}
        </label>
        <div className="grid gap-3 md:grid-cols-[1fr_200px]">
          <Field label={t("settings.announcement.message")}>
            <Textarea
              onChange={(event) =>
                setAnnouncement({ ...announcement, message: event.target.value })
              }
              rows={2}
              value={announcement.message}
            />
          </Field>
          <Field label={t("settings.announcement.level")}>
            <Select
              onValueChange={(level) => setAnnouncement({ ...announcement, level })}
              options={(["info", "warning"] as const).map((level) => ({
                label: t(`settings.levels.${level}`),
                value: level,
              }))}
              value={announcement.level}
            />
          </Field>
        </div>
        <section aria-labelledby={previewId} className="flex flex-col gap-1.5">
          <b className="text-sm" id={previewId}>
            {t("settings.announcement.preview")}
          </b>
          <div className="overflow-hidden rounded-md">
            <SiteBanners
              settings={{
                announcement: { ...announcement, enabled: true },
                maintenance: { enabled: false, message: "" },
                workCalendar: globalSettings.workCalendar,
              }}
            />
          </div>
        </section>
        <div className="flex items-center justify-end gap-2">
          {savedOf(banners) ? (
            <span className="font-semibold text-ok">{t("settings.saved")}</span>
          ) : null}
          <Button busy={banners.state !== "idle"} onClick={saveBanners}>
            {t("settings.save")}
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard
        description={t("settings.maintenance.description")}
        pill={maintenance.enabled ? t("settings.pills.on") : t("settings.pills.off")}
        title={t("settings.maintenance.title")}
        tone={maintenance.enabled ? "warn" : "neutral"}
      >
        <label className="flex items-center gap-3 text-sm">
          <Switch
            checked={maintenance.enabled}
            onCheckedChange={(checked) => setMaintenance({ ...maintenance, enabled: checked })}
          />
          {t("settings.maintenance.switch")}
        </label>
        <Field label={t("settings.maintenance.message")}>
          <Textarea
            onChange={(event) => setMaintenance({ ...maintenance, message: event.target.value })}
            rows={2}
            value={maintenance.message}
          />
        </Field>
        <div className="flex items-center justify-end gap-2">
          {savedOf(banners) ? (
            <span className="font-semibold text-ok">{t("settings.saved")}</span>
          ) : null}
          <Button busy={banners.state !== "idle"} onClick={saveBanners}>
            {t("settings.save")}
          </Button>
        </div>
      </SettingsCard>

      {compliance ? (
        <ComplianceModuleCard
          busy={switchModule.state !== "idle"}
          enabled={compliance.moduleEnabled}
          errorCode={complianceErrorOf(switchModule)}
          failure={complianceErrorOf(switchModule) ? undefined : failureOf(switchModule)}
          onChange={(enabled) =>
            post(switchModule, { enabled: String(enabled), intent: "compliance-module" })
          }
        />
      ) : null}

      {hardReset ? (
        <HardResetCard
          busy={reset.state !== "idle"}
          errorCode={complianceErrorOf(reset)}
          failure={complianceErrorOf(reset) ? undefined : failureOf(reset)}
          moduleEnabled={compliance ? compliance.moduleEnabled : null}
          names={hardReset.names}
          onApprove={(requestId) => post(reset, { intent: "hard-reset-approve", requestId })}
          onCancel={(requestId) => post(reset, { intent: "hard-reset-cancel", requestId })}
          onExecute={(requestId, confirmation) =>
            post(reset, {
              confirmation,
              exportAcknowledged: "true",
              intent: "hard-reset-execute",
              requestId,
            })
          }
          onRequest={(reason) => post(reset, { intent: "hard-reset-request", reason })}
          requests={hardReset.requests}
          result={resetResult}
          viewer={hardReset.viewer}
        />
      ) : null}
    </div>
  );
}
