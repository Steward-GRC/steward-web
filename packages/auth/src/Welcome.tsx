// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { GateAlert, GateCard, GatePage, Mark, Spinner } from "@steward-web/ui";
import { Lock } from "lucide-react";
import { useId, useState } from "react";
import { Form, useNavigation } from "react-router";

import type { WelcomePerson, WelcomeState } from "./welcomeState";

import { NAV_CHOICE_ENABLED } from "./navigationChoice";

export interface WelcomeProps {
  /**
   * Show the "How do you like to navigate?" step. Off until the top nav exists
   * (NAV_CHOICE_ENABLED); the prop is for its own tests.
   */
  navigationChoice?: boolean;
  /** Where to go once onboarded. */
  next: string;
  person: WelcomePerson;
  problem?: WelcomeState["problem"];
}

// G10's controls: 13 px labels 4 px above 40 px fields.
const label = "flex flex-col gap-1 text-sm font-medium";
const input =
  "h-10 w-full rounded-md border border-control bg-surface px-2.5 text-base font-normal text-ink focus-visible:border-primary";

/** The step G10 keeps a slot for: the left sidebar or the top nav. Off for now. */
const NavigationChoice = () => {
  const { t } = useTranslation("auth");
  return (
    <fieldset
      className="flex flex-col gap-2 border-t border-border pt-3"
      data-slot="navigation-choice"
    >
      <legend className="float-left mb-1 text-sm font-medium">
        {t("welcome.navigation.legend")}
      </legend>
      <label className="flex items-center gap-2 text-sm">
        <input
          className="size-[18px] accent-[var(--primary)]"
          defaultChecked
          name="navigation"
          type="radio"
          value="sidebar"
        />
        {t("welcome.navigation.sidebar")}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          className="size-[18px] accent-[var(--primary)]"
          name="navigation"
          type="radio"
          value="top"
        />
        {t("welcome.navigation.top")}
      </label>
    </fieldset>
  );
};

/**
 * The welcome page (Gates G10) for a first sign-in, usually through SSO: the names (with a
 * preview of how the person will appear), the username, the email the sign-in sent (read-only,
 * or asked for when it sent none), the Terms of Service, and Get started.
 */
export const Welcome = ({
  navigationChoice = NAV_CHOICE_ENABLED,
  next,
  person,
  problem,
}: WelcomeProps) => {
  const { t } = useTranslation("auth");
  const navigation = useNavigation();
  const headingId = useId();
  const problemId = useId();
  const emailId = useId();
  const [firstName, setFirstName] = useState(person.firstName);
  const [lastName, setLastName] = useState(person.lastName);
  const busy = navigation.state !== "idle" && navigation.formMethod !== undefined;
  const shownAs = `${firstName.trim()} ${lastName.trim()}`.trim() || person.username;

  return (
    <GatePage>
      <GateCard aria-labelledby={headingId} className="gap-3 p-[26px]">
        <span className="flex items-center gap-2">
          <Mark size={24} variant="full" />
          <h1 className="font-serif text-xl font-semibold" id={headingId}>
            {t("welcome.title")}
          </h1>
        </span>
        <p className="text-muted">{t("welcome.subtitle")}</p>
        {problem ? <GateAlert id={problemId}>{t(`welcome.problem.${problem}`)}</GateAlert> : null}
        <Form className="flex flex-col gap-3" method="post">
          <input name="next" type="hidden" value={next} />
          <div className="grid grid-cols-2 gap-2.5">
            <label className={label}>
              {t("welcome.firstName")}
              <input
                className={input}
                name="firstName"
                onChange={(event) => setFirstName(event.target.value)}
                type="text"
                value={firstName}
              />
            </label>
            <label className={label}>
              {t("welcome.lastName")}
              <input
                className={input}
                name="lastName"
                onChange={(event) => setLastName(event.target.value)}
                type="text"
                value={lastName}
              />
            </label>
          </div>
          <p className="text-sm text-muted">
            {t("welcome.appearAs.before")}
            <b className="font-bold text-ink">{shownAs}</b>
            {t("welcome.appearAs.after")}
          </p>
          <label className={label}>
            {t("welcome.username")}
            <input
              autoComplete="username"
              className={input}
              defaultValue={person.username}
              name="username"
              required
              type="text"
            />
          </label>
          <div className={label}>
            <label htmlFor={emailId}>{t("welcome.email")}</label>
            {person.email ? (
              <span className="relative flex">
                <input
                  className="h-10 w-full rounded-md border border-border bg-sunken px-2.5 pr-9 text-base font-normal text-muted"
                  id={emailId}
                  readOnly
                  type="email"
                  value={person.email}
                />
                <Lock
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-2.5 size-[1.15em] -translate-y-1/2 text-muted"
                />
              </span>
            ) : (
              <input
                autoComplete="email"
                className={input}
                id={emailId}
                name="email"
                required
                type="email"
              />
            )}
          </div>
          {navigationChoice ? <NavigationChoice /> : null}
          <label className="flex items-center gap-2 text-sm">
            <input
              aria-describedby={problem === "terms" ? problemId : undefined}
              className="size-[18px] rounded-sm accent-[var(--primary)]"
              name="acceptTerms"
              required
              type="checkbox"
            />
            {t("welcome.terms")}
          </label>
          <button
            aria-busy={busy || undefined}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary font-semibold text-on-primary hover:bg-primary-hover active:bg-primary-active disabled:opacity-70"
            disabled={busy}
            type="submit"
          >
            {busy ? <Spinner /> : null}
            {busy ? t("welcome.settingUp") : t("welcome.submit")}
          </button>
        </Form>
      </GateCard>
    </GatePage>
  );
};
