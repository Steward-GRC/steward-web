// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { RaciRule } from "@steward-web/api-client";

import { AckTrigger } from "@steward-web/api-client";
import { useTranslation } from "@steward-web/i18n";
import { Badge, Banner, Button, cn, type Failure, notify } from "@steward-web/ui";
import { Check, Lock, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useFetcher } from "react-router";

import type { AccessView } from "./access.server";

import {
  type AccessAction,
  draftOf,
  type DraftRule,
  moveRule,
  newRule,
  nextGrant,
  rulesInputOf,
  setGrant,
} from "./accessModel";
import { AccessSimulator } from "./AccessSimulator";
import { AddRuleDialog } from "./AddRuleDialog";
import { RuleTable } from "./RuleTable";

const TRIGGERS = [AckTrigger.None, AckTrigger.OnPublish, AckTrigger.OnChange] as const;

/** What the page's action answers. */
export type AccessActionResult =
  | { failure: Failure; intent: string; ok: false }
  | { intent: string; ok: true; rules?: readonly RaciRule[] };

const CARD = "flex flex-col gap-2 rounded-[10px] border border-border bg-surface px-4 py-3.5";

/**
 * Category access (A5), the admin console's signature screen: who owns the category, when its
 * policies ask to be acknowledged, its rule table and the simulator beside it. Owners and the
 * trigger save as they change; the rules are edited as a draft, the simulator reruns against
 * the draft, and "Save rules" stores it. A template admin gets the same page, "View only".
 */
export const CategoryAccess = ({ view }: { view: AccessView }) => {
  const { t } = useTranslation("admin");
  const rulesTitleId = useId();
  const ackTitleId = useId();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<readonly DraftRule[]>(() => draftOf(view.rules));
  const [dirty, setDirty] = useState(false);
  const nextKey = useRef(view.rules.length);

  const save = useFetcher<AccessActionResult>({ key: `access-save-${view.categoryId}` });
  const ack = useFetcher<AccessActionResult>({ key: `access-ack-${view.categoryId}` });
  const owners = useFetcher<AccessActionResult>({ key: `access-owners-${view.categoryId}` });
  const canEdit = view.canEdit;
  const live = canEdit && editing;

  // A saved draft comes back as the stored rules: the moved marks clear and it's clean again.
  const saved = save.state === "idle" ? save.data : undefined;
  useEffect(() => {
    if (saved?.ok && saved.rules) {
      setDraft(draftOf(saved.rules));
      setDirty(false);
      notify.success(t("access.saved"));
    }
  }, [saved, t]);

  const change = (next: readonly DraftRule[]) => {
    setDraft(next);
    setDirty(true);
  };
  const cycle = (key: string, action: AccessAction) => {
    const rule = draft.find((entry) => entry.key === key);
    if (rule) change(setGrant(draft, key, action, nextGrant(rule[action])));
  };
  const add = (subjectKind: DraftRule["subjectKind"], subjectRef: string) => {
    change([...draft, newRule(subjectKind, subjectRef, `new-${nextKey.current++}`)]);
  };

  const pendingTrigger = ack.formData?.get("ackTriggers");
  const trigger = (
    typeof pendingTrigger === "string" ? pendingTrigger : view.ackTrigger
  ) as AckTrigger;
  const removing = owners.formData?.get("userId");
  const failure = (fetcher: { data?: AccessActionResult; state: string }) =>
    fetcher.state === "idle" && fetcher.data && !fetcher.data.ok ? fetcher.data.failure : undefined;

  const draftInput = useMemo(() => rulesInputOf(draft), [draft]);
  const direct = view.owners.filter((owner) => owner.from === null && owner.id !== removing);
  const inheritedOwners = view.owners.filter((owner) => owner.from !== null);

  return (
    <div className="flex w-full flex-col gap-4 px-4 pt-[22px] pb-7 md:px-7">
      <header className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <nav aria-label={t("access.pathLabel")} className="text-xs font-medium text-muted">
            {view.path.join(" › ")}
          </nav>
          <h1 className="text-[28px] leading-[1.25] font-semibold">{t("access.title")}</h1>
          <p className="text-base text-muted">{t("access.subtitle")}</p>
        </div>
        {canEdit ? (
          <>
            {editing ? (
              <Button
                className="h-[38px] px-3.5 text-base"
                onClick={() => setEditing(false)}
                variant="secondary"
              >
                <Check aria-hidden="true" />
                {t("access.done")}
              </Button>
            ) : (
              <Button
                className="h-[38px] px-3.5 text-base"
                onClick={() => setEditing(true)}
                variant="secondary"
              >
                {t("access.edit")}
              </Button>
            )}
            {editing || dirty ? (
              <save.Form method="post">
                <input name="intent" type="hidden" value="save-rules" />
                <input name="rules" type="hidden" value={JSON.stringify(draftInput)} />
                <Button
                  busy={save.state !== "idle"}
                  className="h-[38px] px-4 text-base"
                  type="submit"
                >
                  {t("access.save")}
                </Button>
              </save.Form>
            ) : null}
          </>
        ) : (
          <Badge>
            <Lock aria-hidden="true" />
            {t("access.viewOnly")}
          </Badge>
        )}
      </header>

      {failure(save) ? (
        <Banner failure={failure(save)} title={t("access.saveFailed")} tone="danger" />
      ) : null}

      <div className="grid items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <div className="grid gap-3.5 md:grid-cols-2">
            <section aria-label={t("access.owners.title")} className={CARD}>
              <b className="text-sm">{t("access.owners.title")}</b>
              <div className="flex flex-wrap gap-1.5">
                {direct.map((owner) => (
                  <span
                    className="flex h-7 items-center gap-1.5 rounded-full bg-sunken px-2.5 text-sm"
                    key={owner.id}
                  >
                    {owner.name}
                    {live ? (
                      <owners.Form className="flex" method="post">
                        <input name="intent" type="hidden" value="remove-owner" />
                        <input name="userId" type="hidden" value={owner.id} />
                        <button
                          aria-label={t("access.owners.remove", { name: owner.name })}
                          className="flex rounded-full text-muted hover:text-ink"
                          type="submit"
                        >
                          <X aria-hidden="true" className="size-4" />
                        </button>
                      </owners.Form>
                    ) : null}
                  </span>
                ))}
                {inheritedOwners.map((owner) => (
                  <span
                    className="flex h-7 items-center gap-1.5 rounded-full bg-sunken px-2.5 text-sm text-muted"
                    key={`${owner.from}-${owner.id}`}
                  >
                    <Lock aria-hidden="true" className="size-3.5" />
                    {t("access.owners.inherited", { from: owner.from, name: owner.name })}
                  </span>
                ))}
                {direct.length + inheritedOwners.length === 0 ? (
                  <span className="text-sm text-muted">{t("access.owners.empty")}</span>
                ) : null}
              </div>
              {failure(owners) ? (
                <Banner failure={failure(owners)} title={t("access.owners.failed")} tone="danger" />
              ) : null}
            </section>

            <section aria-labelledby={ackTitleId} className={CARD}>
              <b className="text-sm" id={ackTitleId}>
                {t("access.ack.title")}
              </b>
              <ack.Form method="post">
                <input name="intent" type="hidden" value="ack-trigger" />
                <div
                  aria-labelledby={ackTitleId}
                  className="flex gap-0.5 rounded-md bg-sunken p-[3px] text-sm"
                  role="radiogroup"
                >
                  {TRIGGERS.map((option) => (
                    <label
                      className={cn(
                        "flex h-[30px] flex-1 cursor-pointer items-center justify-center rounded-[4px] text-center has-[:disabled]:cursor-default has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]",
                        option === trigger && "bg-surface font-bold shadow-[var(--shadow-1)]",
                      )}
                      key={option}
                    >
                      <input
                        checked={option === trigger}
                        className="sr-only"
                        disabled={!canEdit}
                        name="ackTriggers"
                        onChange={(event) => void ack.submit(event.currentTarget.form)}
                        type="radio"
                        value={option}
                      />
                      {t(`access.ack.options.${option}`)}
                    </label>
                  ))}
                </div>
              </ack.Form>
              <span className="text-xs text-muted">
                {ack.state === "idle" ? t(`access.ack.status.${trigger}`) : t("access.ack.saving")}
              </span>
              {failure(ack) ? (
                <Banner failure={failure(ack)} title={t("access.ack.failed")} tone="danger" />
              ) : null}
            </section>
          </div>

          <section
            aria-labelledby={rulesTitleId}
            className="overflow-hidden rounded-[10px] border border-border bg-surface"
          >
            <div className="flex flex-wrap items-center gap-2.5 border-b border-border-strong bg-sunken px-4 py-2.5">
              <b className="text-[15px]" id={rulesTitleId}>
                {t("access.rules.title")}
              </b>
              <span className="text-sm text-muted">{t("access.rules.order")}</span>
              <AddRuleDialog disabled={!live} onAdd={add} people={view.people} />
            </div>
            <RuleTable
              editing={live}
              inherited={view.inherited}
              names={view.names}
              onCycle={cycle}
              onMove={(key, delta) => change(moveRule(draft, key, delta))}
              onRemove={(key) => change(draft.filter((rule) => rule.key !== key))}
              rules={draft}
              titleId={rulesTitleId}
            />
          </section>
        </div>

        <AccessSimulator
          categoryId={view.categoryId}
          draft={draftInput}
          names={view.names}
          people={view.people}
        />
      </div>
    </div>
  );
};
