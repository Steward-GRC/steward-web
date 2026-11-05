// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { User } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  Checkbox,
  cn,
  Field,
  RadioGroup,
  RadioItem,
  Select,
} from "@steward-web/ui";
import { X } from "lucide-react";
import { useId, useState } from "react";
import { useFetcher } from "react-router";

import { GLOBAL_ROLES, roleKey } from "./roles";
import { CARD, failureOf, succeeded, type UserActionResult } from "./userActionResult";

const EFFECT_PILL = {
  ALLOW: "bg-ok-soft text-ok",
  DENY: "bg-danger-soft text-danger",
} as const;

/** One exception: the policy, Allow or Deny, and a remove button. */
const ExceptionRow = ({
  effect,
  policyNumber,
  readOnly,
  title,
}: {
  effect: "ALLOW" | "DENY";
  policyNumber: string;
  readOnly: boolean;
  title: string;
}) => {
  const { t } = useTranslation("admin");
  const remove = useFetcher<UserActionResult>();
  return (
    <li className="flex items-center gap-3 border-b border-border py-2 last:border-b-0">
      <span className="min-w-0 flex-1">
        <span className="block truncate">{title}</span>
        <span className="font-mono text-xs text-muted">{policyNumber}</span>
      </span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-2xs leading-[15px] font-semibold",
          EFFECT_PILL[effect],
        )}
      >
        {effect === "ALLOW" ? t("users.rolesTab.allow") : t("users.rolesTab.deny")}
      </span>
      {readOnly ? null : (
        <remove.Form method="post">
          <input name="intent" type="hidden" value="remove-exception" />
          <input name="policyNumber" type="hidden" value={policyNumber} />
          <button
            aria-label={t("users.rolesTab.remove", { policy: title })}
            className="flex size-7 items-center justify-center rounded-md text-muted hover:bg-sunken hover:text-ink"
            type="submit"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </remove.Form>
      )}
    </li>
  );
};

/**
 * Roles & access (A19): the Reader baseline, the elevated roles (Site admin, Template admin,
 * Compliance admin), and per-policy Allow or Deny exceptions. Root has every permission, so it
 * shows that instead of the toggles.
 */
export const RolesTab = ({
  policies,
  user,
}: {
  policies: readonly { number: string; title: string }[];
  user: User;
}) => {
  const { t } = useTranslation("admin");
  const roles = useFetcher<UserActionResult>();
  const add = useFetcher<UserActionResult>();
  const accessId = useId();
  const [policy, setPolicy] = useState("");
  const [effect, setEffect] = useState<"ALLOW" | "DENY">("DENY");
  const readOnly = Boolean(user.deletedAt);
  const titleOf = (number: string) => policies.find((entry) => entry.number === number)?.title;
  const excepted = new Set(user.policyOverrides.map((entry) => entry.policyNumber));

  return (
    <div className="flex flex-col gap-3.5">
      <roles.Form className={`${CARD} flex flex-col gap-3`} method="post">
        <input name="intent" type="hidden" value="save-roles" />
        <div className="flex flex-col gap-1">
          <b>{t("users.rolesTab.baseline")}</b>
          <p className="text-sm text-muted">{t("users.rolesTab.baselineDescription")}</p>
        </div>
        {user.isRoot ? (
          <p className="text-sm text-muted">{t("users.rolesTab.root")}</p>
        ) : (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 font-semibold">{t("users.rolesTab.elevated")}</legend>
            {GLOBAL_ROLES.map((role) => (
              <label className="flex items-center gap-3 text-sm" key={role}>
                <Checkbox
                  defaultChecked={user.roles.includes(role)}
                  disabled={readOnly}
                  name="roles"
                  value={role}
                />
                {t(roleKey(role))}
              </label>
            ))}
          </fieldset>
        )}
        {failureOf(roles) ? (
          <Banner failure={failureOf(roles)} title={t("users.rolesTab.failed")} tone="danger" />
        ) : null}
        {user.isRoot ? null : (
          <div className="flex items-center gap-3">
            <Button busy={roles.state !== "idle"} disabled={readOnly} type="submit">
              {t("users.detail.save")}
            </Button>
            {succeeded(roles) ? (
              <span className="text-sm font-semibold text-ok">{t("users.detail.saved")}</span>
            ) : null}
          </div>
        )}
      </roles.Form>

      {user.isRoot ? null : (
        <section aria-labelledby={accessId} className={`${CARD} flex flex-col gap-2`}>
          <b id={accessId}>{t("users.rolesTab.policyAccess")}</b>
          {user.policyOverrides.length === 0 ? (
            <p className="text-sm text-muted">{t("users.rolesTab.noExceptions")}</p>
          ) : (
            <ul aria-labelledby={accessId} className="flex flex-col">
              {user.policyOverrides.map((entry) => (
                <ExceptionRow
                  effect={entry.effect}
                  key={entry.policyNumber}
                  policyNumber={entry.policyNumber}
                  readOnly={readOnly}
                  title={titleOf(entry.policyNumber) ?? entry.policyNumber}
                />
              ))}
            </ul>
          )}
          {readOnly ? null : (
            <add.Form
              className="flex flex-wrap items-end gap-3 border-t border-border pt-3"
              method="post"
              onSubmit={() => setPolicy("")}
            >
              <input name="intent" type="hidden" value="add-exception" />
              <input name="policyNumber" type="hidden" value={policy} />
              <input name="effect" type="hidden" value={effect} />
              <Field className="min-w-[220px] flex-1" label={t("users.rolesTab.policy")}>
                <Select
                  onValueChange={setPolicy}
                  options={policies
                    .filter((entry) => !excepted.has(entry.number))
                    .map((entry) => ({ label: entry.title, value: entry.number }))}
                  placeholder={t("users.rolesTab.choosePolicy")}
                  value={policy}
                />
              </Field>
              <fieldset className="flex flex-col gap-1.5">
                <legend className="mb-1.5 text-sm font-semibold">
                  {t("users.rolesTab.effect")}
                </legend>
                <RadioGroup
                  className="flex h-9 items-center gap-4"
                  onValueChange={(value) => setEffect(value as "ALLOW" | "DENY")}
                  value={effect}
                >
                  <RadioItem value="ALLOW">{t("users.rolesTab.allow")}</RadioItem>
                  <RadioItem value="DENY">{t("users.rolesTab.deny")}</RadioItem>
                </RadioGroup>
              </fieldset>
              <Button disabled={!policy} type="submit" variant="secondary">
                {t("users.rolesTab.add")}
              </Button>
            </add.Form>
          )}
          {failureOf(add) ? (
            <Banner failure={failureOf(add)} title={t("users.rolesTab.failed")} tone="danger" />
          ) : null}
        </section>
      )}
    </div>
  );
};
