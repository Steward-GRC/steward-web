// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { RaciDecision, RaciRuleInput } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { Banner, cn, type Failure, Select } from "@steward-web/ui";
import { useEffect, useId, useState } from "react";
import { useFetcher } from "react-router";

import type { AccessPerson } from "./access.server";

import { type AccessAction, ACTIONS, parseReason, type Reason } from "./accessModel";

/** Radix's Select can't hold an empty value, so the baseline has a stand-in of its own. */
const BASELINE = "__everyone__";

const VERDICT = {
  allowed:
    "bg-[var(--verdict-allowed-soft)] shadow-[inset_0_0_0_1px_var(--verdict-allowed)] [--verdict:var(--verdict-allowed)]",
  denied:
    "bg-[var(--verdict-denied-soft)] shadow-[inset_0_0_0_1px_var(--verdict-denied)] [--verdict:var(--verdict-denied)]",
  owner:
    "bg-[var(--verdict-owner-granted-soft)] shadow-[inset_0_0_0_1px_var(--verdict-owner-granted)] [--verdict:var(--verdict-owner-granted)]",
} as const;

export interface AccessSimulatorProps {
  categoryId: string;
  /** The rules as they stand in the editor, saved or not. */
  draft: readonly RaciRuleInput[];
  /** Display names for user ids, for reasons that name a person. */
  names: Record<string, string>;
  people: readonly AccessPerson[];
}

/**
 * The simulator (A5): pick a person, or everyone's baseline, and see what they may do in this
 * category under the rules as they stand in the editor, before they're saved. It reruns as the
 * rules change, and each verdict says which rule, membership or ownership decided it.
 */
export const AccessSimulator = ({ categoryId, draft, names, people }: AccessSimulatorProps) => {
  const { t } = useTranslation("admin");
  const titleId = useId();
  const personId = useId();
  const [person, setPerson] = useState(BASELINE);
  const fetcher = useFetcher<{ decision?: RaciDecision; failure?: Failure }>();
  const rules = JSON.stringify(draft);
  const { load } = fetcher;

  useEffect(() => {
    const query = new URLSearchParams({
      category: categoryId,
      rules,
      user: person === BASELINE ? "" : person,
    });
    void load(`/resources/access-simulate?${query.toString()}`);
  }, [categoryId, load, person, rules]);

  const decision = fetcher.data?.decision;

  const why = (reason: Reason): string => {
    switch (reason.kind) {
      case "other": {
        return reason.text;
      }
      case "rule": {
        const rule =
          reason.category === null
            ? t("access.simulator.reasons.rule", { number: reason.number })
            : t("access.simulator.reasons.ancestorRule", {
                category: reason.category,
                number: reason.number,
              });
        if (reason.subjectKind === "GROUP") {
          return t("access.simulator.reasons.group", { group: reason.name, rule });
        }
        if (reason.subjectKind === "USER") {
          return t("access.simulator.reasons.person", {
            name: names[reason.name] ?? reason.name,
            rule,
          });
        }
        return t("access.simulator.reasons.everyone", { rule });
      }
      default: {
        return t(`access.simulator.reasons.${reason.kind}`);
      }
    }
  };

  const verdict = (action: AccessAction) => {
    if (!decision) return null;
    const allowed = decision[action];
    const reason = parseReason(decision[`${action}Reason`]);
    const tone = allowed ? (reason.kind === "owner" ? "owner" : "allowed") : "denied";
    const name = t(`access.simulator.actions.${action}`);
    return (
      <div
        aria-label={name}
        className={cn("flex flex-col gap-[3px] rounded-lg px-3 py-2.5", VERDICT[tone])}
        key={action}
        role="group"
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold">{name}</span>
          <b className="text-[var(--verdict)]">
            {allowed ? `✓ ${t("access.simulator.yes")}` : `✗ ${t("access.simulator.no")}`}
          </b>
        </div>
        <span className="text-xs text-muted">{why(reason)}</span>
      </div>
    );
  };

  return (
    <section
      aria-labelledby={titleId}
      className="overflow-hidden rounded-[10px] border border-border bg-surface shadow-[var(--shadow-3)] xl:sticky xl:top-[calc(var(--shell-top,0px)+12px)]"
    >
      <div className="flex items-center gap-2 border-b border-border-strong bg-sunken px-4 py-3">
        <b className="text-[15px]" id={titleId}>
          {t("access.simulator.title")}
        </b>
        <span className="rounded-[3px] bg-warn-soft px-1.5 py-0.5 font-mono text-[10px] leading-[14px] font-semibold text-warn">
          {t("access.simulator.live")}
        </span>
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3.5">
        <div className="flex flex-col gap-[5px]">
          <label className="text-sm font-medium" htmlFor={personId}>
            {t("access.simulator.person")}
          </label>
          <Select
            className="h-[38px] px-2.5"
            id={personId}
            onValueChange={setPerson}
            options={[
              { label: t("access.simulator.baseline"), value: BASELINE },
              ...people.map((entry) => ({
                label: t("access.simulator.personOption", { email: entry.email, name: entry.name }),
                value: entry.id,
              })),
            ]}
            value={person}
          />
        </div>
        <div
          aria-busy={fetcher.state === "loading"}
          aria-live="polite"
          className="flex flex-col gap-2.5"
        >
          {fetcher.data?.failure ? (
            <Banner
              failure={fetcher.data.failure}
              title={t("access.simulator.failed")}
              tone="warn"
            />
          ) : decision ? (
            ACTIONS.map((action) => verdict(action))
          ) : (
            <p className="text-sm text-muted">{t("access.simulator.running")}</p>
          )}
        </div>
      </div>
    </section>
  );
};
