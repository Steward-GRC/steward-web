// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The controls of the Settings "Working days" card: which weekdays count, the site time zone,
// and the holidays. Presentational: the route owns the save. The checks here mirror the
// gateway's (the server stays the authority) so an obvious mistake never costs a round trip.
import type { WorkCalendarInput } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { Button, Checkbox, Input, Select } from "@steward-web/ui";
import { Plus, X } from "lucide-react";
import { useId, useMemo, useState } from "react";

import { isIsoDate, MAX_HOLIDAYS, MAX_LABEL } from "./workCalendar";

export interface WorkCalendarFormProps {
  busy: boolean;
  calendar: WorkCalendarInput;
  /** Called with the checked calendar, holidays sorted by date; never with an invalid one. */
  onSave: (calendar: WorkCalendarInput) => void;
  saved?: boolean;
  /** The gateway's message when it refused the calendar (INVALID_WORK_CALENDAR). */
  serverError?: string;
}

interface Row {
  date: string;
  key: number;
  label: string;
}

const DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

/** Every zone name this browser knows, plus UTC (some engines leave it out) and the stored one. */
const zoneNames = (current: string): string[] => {
  let known: string[] = [];
  try {
    known = Intl.supportedValuesOf("timeZone");
  } catch {
    known = [];
  }
  return [...new Set(["UTC", ...known, current].filter(Boolean))].toSorted();
};

/** The weekday boxes, the time zone and the holiday rows, with one Save for all three. */
export const WorkCalendarForm = ({
  busy,
  calendar,
  onSave,
  saved = false,
  serverError,
}: WorkCalendarFormProps) => {
  const { t } = useTranslation("admin");
  const base = useId();
  const errorPrefix = useId();
  const [weekdays, setWeekdays] = useState<number[]>([...calendar.weekdays]);
  const [timezone, setTimezone] = useState(calendar.timezone);
  const [counter, setCounter] = useState(calendar.holidays.length);
  const [rows, setRows] = useState<Row[]>(
    calendar.holidays.map(({ date, label }, key) => ({ date, key, label })),
  );
  const [attempted, setAttempted] = useState(false);
  const zones = useMemo(() => zoneNames(calendar.timezone), [calendar.timezone]);

  const rowError = (row: Row, at: number): { field: "date" | "label"; message: string } | null => {
    if (!isIsoDate(row.date))
      return { field: "date", message: t("settings.workCalendar.errors.date") };
    if (rows.findIndex((other) => other.date === row.date) < at) {
      return { field: "date", message: t("settings.workCalendar.errors.duplicate") };
    }
    if (row.label.length > MAX_LABEL) {
      return { field: "label", message: t("settings.workCalendar.errors.label") };
    }
    return null;
  };
  const noDays = weekdays.length === 0;
  const invalid = noDays || rows.some((row, at) => rowError(row, at) !== null);

  const update = (key: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const toggle = (day: number, on: boolean) =>
    setWeekdays((current) =>
      on
        ? [...new Set([...current, day])].toSorted((a, b) => a - b)
        : current.filter((d) => d !== day),
    );

  const submit = () => {
    setAttempted(true);
    if (invalid) return;
    onSave({
      holidays: rows
        .map(({ date, label }) => ({ date, label }))
        .toSorted((a, b) => a.date.localeCompare(b.date)),
      timezone,
      weekdays,
    });
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="flex flex-col gap-2">
        <b className="text-sm" id={`${base}-days`}>
          {t("settings.workCalendar.days")}
        </b>
        <div
          aria-labelledby={`${base}-days`}
          className="flex flex-wrap gap-x-4 gap-y-1"
          role="group"
        >
          {DAYS.map((day) => (
            <label className="flex min-h-9 items-center gap-2 text-sm" key={day}>
              <Checkbox
                aria-label={t(`settings.workCalendar.weekday.${day}`)}
                checked={weekdays.includes(day)}
                onCheckedChange={(checked) => toggle(day, checked === true)}
              />
              <span aria-hidden="true">{t(`settings.workCalendar.short.${day}`)}</span>
            </label>
          ))}
        </div>
        {attempted && noDays ? (
          <p className="text-sm font-medium text-danger">
            {t("settings.workCalendar.errors.days")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-1.5 md:max-w-sm">
        <label className="text-sm font-semibold text-ink" htmlFor={`${base}-zone`}>
          {t("settings.workCalendar.timezone")}
        </label>
        <Select
          id={`${base}-zone`}
          onValueChange={setTimezone}
          options={zones.map((zone) => ({ label: zone, value: zone }))}
          value={timezone}
        />
      </div>

      <div className="flex flex-col gap-2">
        <b className="text-sm" id={`${base}-holidays`}>
          {t("settings.workCalendar.holidays")}
        </b>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">{t("settings.workCalendar.noHolidays")}</p>
        ) : (
          <ul aria-labelledby={`${base}-holidays`} className="flex flex-col gap-2">
            {rows.map((row, at) => {
              const shown = attempted ? rowError(row, at) : null;
              const errorId = `${errorPrefix}-${row.key}-error`;
              return (
                <li className="flex flex-col gap-1" key={row.key}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      aria-describedby={shown?.field === "date" ? errorId : undefined}
                      aria-invalid={shown?.field === "date" ? true : undefined}
                      aria-label={t("settings.workCalendar.dateLabel", { number: at + 1 })}
                      className="w-44 shrink-0"
                      onChange={(event) => update(row.key, { date: event.target.value })}
                      type="date"
                      value={row.date}
                    />
                    <Input
                      aria-describedby={shown?.field === "label" ? errorId : undefined}
                      aria-invalid={shown?.field === "label" ? true : undefined}
                      aria-label={t("settings.workCalendar.labelLabel", { number: at + 1 })}
                      className="min-w-[160px] flex-1"
                      maxLength={MAX_LABEL}
                      onChange={(event) => update(row.key, { label: event.target.value })}
                      placeholder={t("settings.workCalendar.labelPlaceholder")}
                      value={row.label}
                    />
                    <button
                      aria-label={t("settings.workCalendar.remove", { number: at + 1 })}
                      className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted hover:text-ink"
                      onClick={() => setRows((current) => current.filter((r) => r.key !== row.key))}
                      type="button"
                    >
                      <X aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                  {shown ? (
                    <p className="text-sm font-medium text-danger" id={errorId}>
                      {shown.message}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        <div>
          <Button
            disabled={rows.length >= MAX_HOLIDAYS}
            onClick={() => {
              setRows((current) => [...current, { date: "", key: counter, label: "" }]);
              setCounter(counter + 1);
            }}
            type="button"
            variant="secondary"
          >
            <Plus aria-hidden="true" className="size-4" />
            {t("settings.workCalendar.add")}
          </Button>
        </div>
      </div>

      {serverError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {serverError}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        {saved ? <span className="font-semibold text-ok">{t("settings.saved")}</span> : null}
        <Button busy={busy} type="submit">
          {t("settings.save")}
        </Button>
      </div>
    </form>
  );
};
