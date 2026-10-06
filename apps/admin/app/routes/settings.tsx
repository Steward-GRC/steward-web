// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { refusalOf } from "@steward-web/shell";
import {
  Banner,
  Button,
  Card,
  CardBody,
  Field,
  Input,
  PageHeader,
  Select,
  Switch,
} from "@steward-web/ui";
import { data, useFetcher } from "react-router";

import type { Route } from "./+types/settings";

import {
  getEmailServiceConfig,
  getGlobalSettings,
  saveEmailServiceConfig,
  saveGlobalSettings,
} from "../settings/settings.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const [globalSettings, emailServiceConfig] = await Promise.all([
    getGlobalSettings(request),
    getEmailServiceConfig(request),
  ]);
  return { emailServiceConfig, globalSettings };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const intent = form.get("intent");

  try {
    switch (intent) {
      case "save-email": {
        const apiKey = String(form.get("apiKey") ?? "");
        const saved = await saveEmailServiceConfig(request, {
          apiKey: apiKey === "" ? undefined : apiKey,
          domain: String(form.get("domain") ?? "").trim(),
          enabled: form.get("enabled") === "true",
          fromAddress: String(form.get("fromAddress") ?? "").trim(),
          provider: String(form.get("provider") ?? "").trim(),
          region: String(form.get("region") ?? "").trim(),
        });
        return data({ intent, ok: true, saved } as const);
      }
      case "save-global": {
        const saved = await saveGlobalSettings(request, {
          announcement: {
            enabled: form.get("announcementEnabled") === "true",
            level: String(form.get("announcementLevel") ?? "info"),
            message: String(form.get("announcementMessage") ?? "").trim(),
          },
          maintenance: {
            enabled: form.get("maintenanceEnabled") === "true",
            message: String(form.get("maintenanceMessage") ?? "").trim(),
          },
        });
        return data({ intent, ok: true, saved } as const);
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
  } catch (error) {
    return data({ error: refusalOf(error), intent: String(intent), ok: false } as const, {
      status: 400,
    });
  }
};

export default function Settings({ loaderData }: Route.ComponentProps) {
  const { emailServiceConfig, globalSettings } = loaderData;
  const globalFetcher = useFetcher<typeof action>();
  const emailFetcher = useFetcher<typeof action>();

  const globalFailure =
    globalFetcher.data && !globalFetcher.data.ok && globalFetcher.data.intent === "save-global"
      ? globalFetcher.data.error
      : undefined;
  const emailFailure =
    emailFetcher.data && !emailFetcher.data.ok && emailFetcher.data.intent === "save-email"
      ? emailFetcher.data.error
      : undefined;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6 p-6">
      <PageHeader eyebrow="System" title="Settings" />

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-ink">Announcement &amp; maintenance</h2>
          <globalFetcher.Form className="flex flex-col gap-4" method="post">
            <input name="intent" type="hidden" value="save-global" />

            <Field label="Show an announcement banner">
              <Switch
                defaultChecked={globalSettings.announcement.enabled}
                name="announcementEnabled"
                value="true"
              />
            </Field>
            <Field label="Level">
              <Select
                defaultValue={globalSettings.announcement.level}
                name="announcementLevel"
                options={[
                  { label: "Info", value: "info" },
                  { label: "Warning", value: "warning" },
                ]}
              />
            </Field>
            <Field label="Message">
              <Input
                defaultValue={globalSettings.announcement.message}
                name="announcementMessage"
              />
            </Field>

            <Field label="Show a maintenance notice">
              <Switch
                defaultChecked={globalSettings.maintenance.enabled}
                name="maintenanceEnabled"
                value="true"
              />
            </Field>
            <Field label="Maintenance message">
              <Input defaultValue={globalSettings.maintenance.message} name="maintenanceMessage" />
            </Field>

            {globalFailure ? (
              <Banner failure={globalFailure} title="Couldn't save these banners" tone="danger" />
            ) : null}

            <Button className="self-start" disabled={globalFetcher.state !== "idle"} type="submit">
              {globalFetcher.state === "idle" ? "Save" : "Saving…"}
            </Button>
          </globalFetcher.Form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-ink">Outbound email</h2>
          <p className="text-sm text-muted">
            {emailServiceConfig.apiKeySet
              ? "A sending key is stored. It can only be replaced, never read back."
              : "No sending key is stored yet."}
          </p>
          <emailFetcher.Form className="flex flex-col gap-4" method="post">
            <input name="intent" type="hidden" value="save-email" />

            <Field label="Enabled">
              <Switch defaultChecked={emailServiceConfig.enabled} name="enabled" value="true" />
            </Field>
            <Field label="Provider">
              <Input defaultValue={emailServiceConfig.provider} name="provider" />
            </Field>
            <Field label="Domain">
              <Input defaultValue={emailServiceConfig.domain} name="domain" />
            </Field>
            <Field label="Region">
              <Input defaultValue={emailServiceConfig.region} name="region" />
            </Field>
            <Field label="From address">
              <Input
                defaultValue={emailServiceConfig.fromAddress}
                name="fromAddress"
                type="email"
              />
            </Field>
            <Field hint="Leave blank to keep the stored key unchanged." label="Sending key">
              <Input name="apiKey" placeholder="Replace the stored key…" type="password" />
            </Field>

            {emailFailure ? (
              <Banner
                failure={emailFailure}
                title="Couldn't save this configuration"
                tone="danger"
              />
            ) : null}

            <Button className="self-start" disabled={emailFetcher.state !== "idle"} type="submit">
              {emailFetcher.state === "idle" ? "Save" : "Saving…"}
            </Button>
          </emailFetcher.Form>
        </CardBody>
      </Card>
    </div>
  );
}
