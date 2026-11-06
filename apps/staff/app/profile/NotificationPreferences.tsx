// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { NotificationPreferences as Preferences } from "@steward-web/api-client";

import { formatWeekday, useTranslation } from "@steward-web/i18n";
import { Badge, Card, cn, Switch } from "@steward-web/ui";
import { ChevronDown, ChevronRight, Lock } from "lucide-react";
import { useId, useState } from "react";
import { useFetcher } from "react-router";

import {
  type Cadence,
  cadenceOptions,
  type NotificationGroup,
  notificationGroups,
} from "./notificationGroups";

/** "steward_ack_reminder" as "Ack reminder", for a kind the UI has no label for yet. */
const spelledOut = (kind: string) => {
  const words = kind
    .replaceAll(/[_.-]+/g, " ")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** "08:00", for the digest line. */
const hour = (value: number) => `${String(value).padStart(2, "0")}:00`;

/** The segmented cadence control (U35): Immediate, Daily digest, Weekly digest, Off. */
const CadenceControl = ({
  delivery,
  label,
  mandatory,
  name,
  onChange,
  value,
}: {
  delivery?: string;
  label: string;
  mandatory: boolean;
  name: string;
  onChange: (value: Cadence) => void;
  value: Cadence;
}) => {
  const { t } = useTranslation("settings");
  return (
    <div
      aria-label={label}
      className="flex flex-wrap gap-0.5 rounded-md bg-sunken p-0.5 text-xs"
      role="radiogroup"
    >
      {cadenceOptions({ delivery, mandatory }).map((option) => (
        <label
          className={cn(
            "rounded-[4px] px-2 py-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
            option.value === value ? "bg-surface font-bold text-ink" : "text-ink",
            option.disabled ? "cursor-not-allowed text-border-strong" : "cursor-pointer",
          )}
          key={option.value}
        >
          <input
            checked={option.value === value}
            className="sr-only"
            disabled={option.disabled}
            name={name}
            onChange={() => onChange(option.value)}
            type="radio"
            value={option.value}
          />
          {t(`notifications.cadence.${option.value}`)}
        </label>
      ))}
    </div>
  );
};

/** One category's row: name, Required, its cadence, and "Fine-tune n notifications". */
const GroupRow = ({ group }: { group: NotificationGroup }) => {
  const { t } = useTranslation("settings");
  const fetcher = useFetcher();
  const [open, setOpen] = useState(false);
  const listId = useId();
  const name = t(`notifications.groups.${group.category}`);
  const set = (fields: Record<string, string>) => void fetcher.submit(fields, { method: "post" });
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <li
      className={cn(
        "flex flex-col gap-2 border-b border-border px-4 py-3 last:border-b-0",
        group.custom && "bg-primary-soft shadow-[inset_3px_0_var(--primary)]",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <b className="flex-1 font-semibold">{name}</b>
        {group.mandatory ? (
          <Badge shape="tag">
            <Lock aria-hidden="true" />
            {t("notifications.required")}
          </Badge>
        ) : null}
        <CadenceControl
          label={t("notifications.cadenceFor", { name })}
          mandatory={group.mandatory}
          name={`cadence-${group.category}`}
          onChange={(cadence) => set({ cadence, category: group.category, intent: "set-category" })}
          value={group.cadence}
        />
      </div>
      {group.types.length > 0 ? (
        <button
          aria-controls={listId}
          aria-expanded={open}
          className="flex items-center gap-1 self-start text-[13px] font-semibold text-primary"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <Chevron aria-hidden="true" className="size-3.5" />
          {t("notifications.fineTune", { count: group.types.length })}
          {group.custom ? ` · ${t("notifications.custom")}` : ""}
        </button>
      ) : null}
      {open ? (
        <ul className="flex flex-col gap-2 pl-5" id={listId}>
          {group.types.map((type) => {
            const label = t(`notifications.kinds.${type.kind}`, {
              defaultValue: spelledOut(type.kind),
            });
            return (
              <li className="flex flex-wrap items-center gap-2 text-sm" key={type.kind}>
                <span className="flex-1">{label}</span>
                <CadenceControl
                  delivery={type.delivery}
                  label={t("notifications.cadenceFor", { name: label })}
                  mandatory={type.mandatory}
                  name={`cadence-${type.kind}`}
                  onChange={(cadence) => set({ cadence, intent: "set-type", kind: type.kind })}
                  value={type.cadence}
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
};

/** "How you're reached": the email, in-app and push switches, and when digests go out. */
const Channels = ({ settings }: { settings: Preferences["settings"] }) => {
  const { t } = useTranslation("settings");
  const fetcher = useFetcher();
  const titleId = useId();
  const channels = settings.channels;
  const toggle = (key: "email" | "inApp" | "push", on: boolean) =>
    void fetcher.submit(
      {
        email: String(key === "email" ? on : channels.email),
        inApp: String(key === "inApp" ? on : channels.inApp),
        intent: "set-channels",
        push: String(key === "push" ? on : channels.push),
      },
      { method: "post" },
    );
  return (
    <Card aria-labelledby={titleId} className="grid gap-2.5 px-4 py-3.5 sm:grid-cols-3">
      <h2 className="font-semibold sm:col-span-3" id={titleId}>
        {t("notifications.reached")}
      </h2>
      {(["email", "inApp", "push"] as const).map((key) => (
        <label className="flex items-center justify-between gap-3" key={key}>
          {t(`notifications.channels.${key}`)}
          <Switch checked={channels[key]} onCheckedChange={(on) => toggle(key, on)} />
        </label>
      ))}
      <p className="text-[13px] text-muted sm:col-span-3">
        {t("notifications.digest", {
          // The gateway's day is ISO (1 = Monday … 7 = Sunday); the formatter's 0 is Sunday.
          day: formatWeekday(settings.digest.weeklyDow % 7),
          time: hour(settings.digest.dailyHour),
        })}
      </p>
    </Card>
  );
};

export interface NotificationPreferencesProps {
  /** The caller's settings and the type catalog, or null when they couldn't be read. */
  preferences: null | Preferences;
}

/**
 * Notification preferences (U35, U35m): how you're reached (email, in-app, push, and when the
 * digests go out), then what you're notified about, one row per category with its cadence.
 * Required categories can't be turned off; "Fine-tune n notifications" sets each type on its
 * own, and a category with any set that way is marked "· Custom".
 */
export const NotificationPreferences = ({ preferences }: NotificationPreferencesProps) => {
  const { t } = useTranslation("settings");
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold">{t("notifications.title")}</h2>
        <p className="leading-normal text-muted">{t("notifications.description")}</p>
      </div>
      {preferences ? (
        <>
          <Channels settings={preferences.settings} />
          <Card title={t("notifications.about")}>
            <ul>
              {notificationGroups(preferences).map((group) => (
                <GroupRow group={group} key={group.category} />
              ))}
            </ul>
          </Card>
        </>
      ) : (
        <p className="rounded-[10px] border border-border bg-surface px-4 py-3.5 text-muted">
          {t("notifications.unavailable")}
        </p>
      )}
    </div>
  );
};
