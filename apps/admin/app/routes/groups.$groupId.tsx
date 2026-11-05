// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Group, ReviewCadence } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import {
  Banner,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  type Failure,
  Field,
  Input,
  NotFound,
  RadioGroup,
  RadioItem,
  Select,
  TypeToConfirm,
} from "@steward-web/ui";
import { Lock, X } from "lucide-react";
import { useId, useState } from "react";
import { data, Link, redirect, useFetcher } from "react-router";

import type { Route } from "./+types/groups.$groupId";

import {
  deleteGroup,
  effectiveAckEveryone,
  effectiveExclusionGroupIds,
  effectiveIdpGroupIds,
  effectiveOwners,
  isValidSlug,
  listGroups,
  listTemplates,
  listWorkflows,
  moveCandidates,
  moveGroup,
  ownsOwners,
  renameGroup,
  updateGroupSettings,
} from "../groups/groups.server";
import { listUsers } from "../users/users.server";

const TOP_LEVEL = "__top_level__";
const NO_TEMPLATE = "__no_template__";
const NO_WORKFLOW = "__no_workflow__";
const CADENCES = ["NONE", "ANNUAL", "BIENNIAL", "ON_DATE"] as const;

/** A comma-separated field into trimmed, non-empty entries. */
const parseList = (value: string): string[] =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** The category and its ancestors, root first. */
const chainOf = (groups: readonly Group[], group: Group): Group[] => {
  const chain: Group[] = [];
  let at: Group | undefined = group;
  while (at && chain.length <= groups.length) {
    chain.unshift(at);
    const parentId: null | string | undefined = at.parentId;
    at = parentId ? groups.find((g) => g.id === parentId) : undefined;
  }
  return chain;
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const groups = await listGroups(request);
  const group = groups.find((g) => g.id === params.groupId);
  if (!group) return data({ group: null }, { status: 404 });

  const [templates, workflows, users] = await Promise.all([
    listTemplates(request),
    listWorkflows(request),
    // The owner picker is a courtesy: someone who manages categories but not users still gets
    // the page, with names falling back to ids.
    listUsers(request).catch(() => []),
  ]);
  const chain = chainOf(groups, group);
  const owns = ownsOwners(groups, group);
  const nameOf = (id: string) => users.find((u) => u.userId === id)?.name ?? id;
  // Below a top-level department the owners are that department's, read-only.
  const department = chain[1];

  return {
    audience: {
      everyone: effectiveAckEveryone(groups, group),
      exclusionGroupIds: effectiveExclusionGroupIds(groups, group) ?? [],
      idpGroupIds: effectiveIdpGroupIds(groups, group) ?? [],
    },
    candidates: moveCandidates(groups, group.id),
    group,
    inheritedOwners: owns
      ? []
      : effectiveOwners(groups, group).map((id) => ({
          from: department?.name ?? "",
          name: nameOf(id),
        })),
    owns,
    path: chain.map((g) => g.name),
    templates: templates.map(({ id, name }) => ({ id, name })),
    userOptions: users
      .filter((u) => !u.deletedAt)
      .map((u) => ({ email: u.email, label: u.name, value: u.userId })),
    workflows: workflows.map(({ id, name }) => ({ id, name })),
  };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const groupId = params.groupId;
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const field = (name: string) => String(form.get(name) ?? "").trim();

  try {
    switch (intent) {
      case "delete": {
        await deleteGroup(request, groupId);
        return redirect("/groups");
      }
      case "save": {
        const groups = await listGroups(request);
        const group = groups.find((g) => g.id === groupId);
        if (!group) throw data("category not found", { status: 404 });
        const name = field("name");
        const slug = field("slug");
        if (!name || !isValidSlug(slug)) {
          return data({ intent, invalid: true, ok: false } as const, { status: 400 });
        }
        if (name !== group.name || slug !== group.slug) {
          await renameGroup(request, { groupId, name, slug });
        }
        const parent = field("parentId");
        const parentId = parent === TOP_LEVEL || parent === "" ? null : parent;
        if (parentId !== (group.parentId ?? null)) await moveGroup(request, groupId, parentId);
        const template = field("defaultTemplateId") || NO_TEMPLATE;
        const workflow = field("defaultWorkflowId") || NO_WORKFLOW;
        const reviewCadence = (field("reviewCadence") || "NONE") as ReviewCadence;
        await updateGroupSettings(request, groupId, {
          ackEveryone: group.ackEveryone,
          ackTriggers: group.ackTriggers,
          defaultTemplateId: template === NO_TEMPLATE ? null : template,
          defaultTemplateNone: template === NO_TEMPLATE,
          defaultWorkflowId: workflow === NO_WORKFLOW ? null : workflow,
          exclusionGroupIds: group.exclusionGroupIds ?? null,
          idpGroupIds: group.idpGroupIds ?? null,
          owners: ownsOwners(groups, group) ? form.getAll("owners").map(String) : group.owners,
          reviewCadence,
          reviewDate: reviewCadence === "ON_DATE" ? field("reviewDate") || null : null,
        });
        break;
      }
      case "save-audience": {
        const groups = await listGroups(request);
        const group = groups.find((g) => g.id === groupId);
        if (!group) throw data("category not found", { status: 404 });
        await updateGroupSettings(request, groupId, {
          ackEveryone: field("audience") === "everyone",
          ackTriggers: group.ackTriggers,
          defaultTemplateId: group.defaultTemplateId ?? null,
          defaultTemplateNone: group.defaultTemplateNone,
          defaultWorkflowId: group.defaultWorkflowId ?? null,
          exclusionGroupIds: parseList(field("exclusionGroupIds")),
          idpGroupIds: parseList(field("idpGroupIds")),
          owners: group.owners,
          reviewCadence: group.reviewCadence,
          reviewDate: group.reviewDate ?? null,
        });
        break;
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
    return { intent, ok: true } as const;
  } catch (error) {
    if (error instanceof Response) throw error;
    return data({ failure: refusalOf(error), intent, ok: false } as const, { status: 400 });
  }
};

type Result =
  | { failure: Failure; intent: string; ok: false }
  | { intent: string; invalid: true; ok: false }
  | { intent: string; ok: true };

const failureOf = (fetcher: { data?: Result; state: string }) =>
  fetcher.state === "idle" && fetcher.data && !fetcher.data.ok && "failure" in fetcher.data
    ? fetcher.data.failure
    : undefined;

const CHIP = "flex h-7 items-center gap-1.5 rounded-full bg-sunken px-2.5 text-sm";

/**
 * The category directory's Details & Defaults (A3): the category picked in the panel's tree,
 * with its path, one card of name, slug, place, cadence and defaults saved together, its
 * acknowledgement audience, and the danger zone.
 */
export default function CategoryDetail({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const save = useFetcher<Result>();
  const audience = useFetcher<Result>();
  const [cadence, setCadence] = useState<string>(
    loaderData.group ? loaderData.group.reviewCadence : "NONE",
  );
  const [owners, setOwners] = useState<readonly string[]>(
    loaderData.group ? loaderData.group.owners : [],
  );
  const [everyone, setEveryone] = useState(loaderData.group ? loaderData.audience.everyone : false);
  const [slug, setSlug] = useState(loaderData.group ? loaderData.group.slug : "");
  const dangerId = useId();
  const audienceId = useId();

  if (!loaderData.group) {
    return (
      <div className="flex w-full flex-col p-4 md:p-6">
        <NotFound
          action={
            <Button asChild variant="secondary">
              <Link to="/groups">{t("categories.notFound.action")}</Link>
            </Button>
          }
          description={t("categories.notFound.description")}
          title={t("categories.notFound.title")}
        />
      </div>
    );
  }

  const { candidates, group, inheritedOwners, owns, path, templates, userOptions, workflows } =
    loaderData;
  const nameOf = (id: string) => userOptions.find((u) => u.value === id)?.label ?? id;
  const saved = save.state === "idle" && save.data?.ok;
  const invalid = save.state === "idle" && save.data && !save.data.ok && "invalid" in save.data;

  return (
    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
      <header>
        <p className="text-xs font-medium text-muted">{path.join(" › ")}</p>
        <h1 className="text-[26px] leading-[1.3] font-semibold">{group.name}</h1>
        <p className="text-base text-muted">{t("categories.subtitle")}</p>
      </header>

      <save.Form
        aria-label={t("categories.detailsLabel")}
        className="grid gap-3 rounded-[10px] border border-border bg-surface p-4 md:grid-cols-2"
        method="post"
      >
        <input name="intent" type="hidden" value="save" />
        <Field label={t("categories.name")}>
          <Input className="h-[38px]" defaultValue={group.name} name="name" required />
        </Field>
        <Field
          error={invalid ? t("categories.slugInvalid") : undefined}
          label={t("categories.slug")}
        >
          <Input
            className="h-[38px] font-mono text-sm"
            name="slug"
            onChange={(event) => setSlug(event.target.value)}
            required
            value={slug}
          />
        </Field>
        <p className="text-xs text-muted md:col-span-2">
          {t("categories.slugHint", { prefix: slug.toUpperCase() })}
        </p>
        <Field label={t("categories.moveTo")}>
          <Select
            className="h-[38px]"
            defaultValue={group.parentId ?? TOP_LEVEL}
            name="parentId"
            options={[
              { label: t("categories.topLevel"), value: TOP_LEVEL },
              ...candidates.map((c) => ({ label: c.path, value: c.id })),
            ]}
          />
        </Field>
        <Field label={t("categories.reviewCadence")}>
          <Select
            className="h-[38px]"
            name="reviewCadence"
            onValueChange={setCadence}
            options={CADENCES.map((value) => ({
              label: t(`categories.cadence.${value}`),
              value,
            }))}
            value={cadence}
          />
        </Field>
        {cadence === "ON_DATE" ? (
          <Field className="md:col-start-2" label={t("categories.reviewDate")}>
            <Input
              className="h-[38px]"
              defaultValue={group.reviewDate ?? ""}
              name="reviewDate"
              type="date"
            />
          </Field>
        ) : null}
        <Field label={t("categories.defaultTemplate")}>
          <Select
            className="h-[38px]"
            defaultValue={group.defaultTemplateId ?? NO_TEMPLATE}
            name="defaultTemplateId"
            options={[
              { label: t("categories.noTemplate"), value: NO_TEMPLATE },
              ...templates.map((tpl) => ({ label: tpl.name, value: tpl.id })),
            ]}
          />
        </Field>
        <Field label={t("categories.defaultWorkflow")}>
          <Select
            className="h-[38px]"
            defaultValue={group.defaultWorkflowId ?? NO_WORKFLOW}
            name="defaultWorkflowId"
            options={[
              { label: t("categories.noWorkflow"), value: NO_WORKFLOW },
              ...workflows.map((w) => ({ label: w.name, value: w.id })),
            ]}
          />
        </Field>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <span className="text-sm font-semibold">{t("categories.owners")}</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {owns
              ? owners.map((id) => (
                  <span className={CHIP} key={id}>
                    <input name="owners" type="hidden" value={id} />
                    {nameOf(id)}
                    <button
                      aria-label={t("categories.removeOwner", { name: nameOf(id) })}
                      className="flex rounded-full text-muted hover:text-ink"
                      onClick={() => setOwners(owners.filter((owner) => owner !== id))}
                      type="button"
                    >
                      <X aria-hidden="true" className="size-4" />
                    </button>
                  </span>
                ))
              : inheritedOwners.map((owner) => (
                  <span className={`${CHIP} text-muted`} key={owner.name}>
                    <Lock aria-hidden="true" className="size-3.5" />
                    {t("categories.ownersInherited", owner)}
                  </span>
                ))}
            {(owns ? owners.length : inheritedOwners.length) === 0 ? (
              <span className="text-sm text-muted">{t("categories.noOwners")}</span>
            ) : null}
            {owns ? (
              <Select
                aria-label={t("categories.addOwner")}
                className="h-7 w-auto rounded-full px-2.5 text-sm font-semibold text-primary"
                onValueChange={(id) => setOwners([...owners, id])}
                options={userOptions
                  .filter((u) => !owners.includes(u.value))
                  .map((u) => ({ label: u.label, value: u.value }))}
                placeholder={t("categories.addOwner")}
                value=""
              />
            ) : null}
          </div>
        </div>

        {failureOf(save) ? (
          <Banner
            className="md:col-span-2"
            failure={failureOf(save)}
            title={t("categories.failed")}
            tone="danger"
          />
        ) : null}
        <div className="flex items-center justify-end gap-2.5 md:col-span-2">
          {saved ? <span className="font-semibold text-ok">{t("categories.saved")}</span> : null}
          <Button busy={save.state !== "idle"} className="h-[38px] px-4 text-base" type="submit">
            {t("categories.save")}
          </Button>
        </div>
      </save.Form>

      <audience.Form
        aria-labelledby={audienceId}
        className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-4"
        method="post"
      >
        <input name="intent" type="hidden" value="save-audience" />
        <input name="audience" type="hidden" value={everyone ? "everyone" : "specific"} />
        <b id={audienceId}>{t("categories.audience.title")}</b>
        <RadioGroup
          className="flex flex-wrap gap-5"
          onValueChange={(value) => setEveryone(value === "everyone")}
          value={everyone ? "everyone" : "specific"}
        >
          <RadioItem value="everyone">{t("categories.audience.everyone")}</RadioItem>
          <RadioItem value="specific">{t("categories.audience.specific")}</RadioItem>
        </RadioGroup>
        {everyone ? null : (
          <Field
            hint={t("categories.audience.idpGroupsHint")}
            label={t("categories.audience.idpGroups")}
          >
            <Input defaultValue={loaderData.audience.idpGroupIds.join(", ")} name="idpGroupIds" />
          </Field>
        )}
        <Field
          hint={t("categories.audience.excludedHint")}
          label={t("categories.audience.excluded")}
        >
          <Input
            defaultValue={loaderData.audience.exclusionGroupIds.join(", ")}
            name="exclusionGroupIds"
          />
        </Field>
        {failureOf(audience) ? (
          <Banner failure={failureOf(audience)} title={t("categories.failed")} tone="danger" />
        ) : null}
        <div className="flex items-center justify-end gap-2.5">
          {audience.state === "idle" && audience.data?.ok ? (
            <span className="font-semibold text-ok">{t("categories.saved")}</span>
          ) : null}
          <Button busy={audience.state !== "idle"} type="submit" variant="secondary">
            {t("categories.audience.save")}
          </Button>
        </div>
      </audience.Form>

      <section
        aria-labelledby={dangerId}
        className="flex flex-wrap items-center gap-3 rounded-[10px] bg-surface px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--danger)]"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <b className="text-danger" id={dangerId}>
            {t("categories.danger.title")}
          </b>
          <span className="text-sm text-muted">{t("categories.danger.description")}</span>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="flex h-9 items-center rounded-md px-3.5 font-semibold text-danger shadow-[inset_0_0_0_1.5px_var(--danger)] hover:bg-danger-soft"
              type="button"
            >
              {t("categories.danger.delete")}
            </button>
          </DialogTrigger>
          <DialogContent
            description={t("categories.danger.dialogDescription")}
            hasInput
            title={t("categories.danger.dialogTitle", { name: group.name })}
            tone="danger"
          >
            <DeleteForm name={group.name} />
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}

/** D17: type the category's name, then delete. */
const DeleteForm = ({ name }: { name: string }) => {
  const { t } = useTranslation("admin");
  const remove = useFetcher<Result>();
  return (
    <remove.Form method="post">
      <input name="intent" type="hidden" value="delete" />
      <TypeToConfirm phrase={name}>
        {(confirmed) => (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">{t("categories.danger.cancel")}</Button>
            </DialogClose>
            <Button
              busy={remove.state !== "idle"}
              disabled={!confirmed}
              type="submit"
              variant="danger"
            >
              {t("categories.danger.confirm")}
            </Button>
          </DialogFooter>
        )}
      </TypeToConfirm>
      {failureOf(remove) ? (
        <Banner
          className="mx-5 mb-4"
          failure={failureOf(remove)}
          title={t("categories.danger.failed")}
          tone="danger"
        />
      ) : null}
    </remove.Form>
  );
};
