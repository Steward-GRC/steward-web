// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AckTrigger, ReviewCadence } from "@steward-web/api-client";

import { refusalOf } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  Field,
  Input,
  PageHeader,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@steward-web/ui";
import { data, Form, Link, redirect } from "react-router";

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
const EVERYONE = "everyone";
const SPECIFIC_GROUPS = "specific";

/** A comma-separated field into trimmed, non-empty entries. */
const parseList = (value: string): string[] =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const groups = await listGroups(request);
  const group = groups.find((g) => g.id === params.groupId);
  if (!group) {
    return {
      candidates: [],
      effectiveAckEveryoneValue: false,
      effectiveExclusionGroupIdsValue: null,
      effectiveIdpGroupIdsValue: null,
      group: null,
      owners: [],
      owns: true,
      templates: [],
      userOptions: [],
      workflows: [],
    };
  }

  const [templates, workflows, users] = await Promise.all([
    listTemplates(request),
    listWorkflows(request),
    // The owner picker is a courtesy, not a gate: a caller who can manage groups but not
    // users still gets the page, just with an empty owner list (ui#173's same-named-account
    // risk doesn't arise when there's nothing to pick from).
    listUsers(request).catch(() => []),
  ]);

  const userOptions = users.map((u) => ({ email: u.email, label: u.name, value: u.userId }));
  const candidates = moveCandidates(groups, group.id);
  const owns = ownsOwners(groups, group);
  const owners = owns ? group.owners : effectiveOwners(groups, group);
  const effectiveAckEveryoneValue = effectiveAckEveryone(groups, group);
  const effectiveIdpGroupIdsValue = effectiveIdpGroupIds(groups, group);
  const effectiveExclusionGroupIdsValue = effectiveExclusionGroupIds(groups, group);

  return {
    candidates,
    effectiveAckEveryoneValue,
    effectiveExclusionGroupIdsValue,
    effectiveIdpGroupIdsValue,
    group,
    owners,
    owns,
    templates,
    userOptions,
    workflows,
  };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const groupId = params.groupId;
  const form = await request.formData();
  const intent = form.get("intent");

  try {
    switch (intent) {
      case "delete": {
        await deleteGroup(request, groupId);
        return redirect("/groups");
      }
      case "move": {
        const target = String(form.get("parentId") ?? "");
        await moveGroup(request, groupId, target === TOP_LEVEL ? null : target);
        return data({ intent, ok: true } as const);
      }
      case "rename": {
        const name = String(form.get("name") ?? "").trim();
        const slug = String(form.get("slug") ?? "").trim();
        if (!name || !isValidSlug(slug)) {
          return data(
            {
              intent,
              ok: false,
              validationError: "A name and a valid slug are required.",
            } as const,
            {
              status: 400,
            },
          );
        }
        await renameGroup(request, { groupId, name, slug });
        return data({ intent, ok: true } as const);
      }
      case "save-settings": {
        const templateSel = String(form.get("defaultTemplateId") ?? NO_TEMPLATE);
        const workflowSel = String(form.get("defaultWorkflowId") ?? NO_WORKFLOW);
        const reviewCadence = String(form.get("reviewCadence") ?? "NONE") as ReviewCadence;
        const reviewDate =
          reviewCadence === "ON_DATE" ? String(form.get("reviewDate") ?? "") : null;
        const ackEveryone = String(form.get("ackAudience") ?? EVERYONE) === EVERYONE;
        await updateGroupSettings(request, groupId, {
          ackEveryone,
          ackTriggers: String(form.get("ackTriggers") ?? "NONE") as AckTrigger,
          defaultTemplateId: templateSel === NO_TEMPLATE ? null : templateSel,
          defaultTemplateNone: templateSel === NO_TEMPLATE,
          defaultWorkflowId: workflowSel === NO_WORKFLOW ? null : workflowSel,
          exclusionGroupIds: parseList(String(form.get("exclusionGroupIds") ?? "")),
          idpGroupIds: parseList(String(form.get("idpGroupIds") ?? "")),
          owners: form.getAll("owners").map(String),
          reviewCadence,
          reviewDate: reviewDate || null,
        });
        return data({ intent, ok: true } as const);
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
  } catch (error) {
    return data({ failure: refusalOf(error), intent: String(intent), ok: false } as const, {
      status: 400,
    });
  }
};

export default function GroupEdit({ actionData, loaderData }: Route.ComponentProps) {
  if (!loaderData.group) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader eyebrow="Access" subtitle="No group matches that id." title="Group not found" />
        <Button asChild className="self-start" variant="secondary">
          <Link to="/groups">Back to groups</Link>
        </Button>
      </div>
    );
  }

  const {
    candidates,
    effectiveAckEveryoneValue,
    effectiveExclusionGroupIdsValue,
    effectiveIdpGroupIdsValue,
    group,
    owners,
    owns,
    templates,
    userOptions,
    workflows,
  } = loaderData;

  const errorFor = (intent: string) =>
    actionData && !actionData.ok && actionData.intent === intent && "failure" in actionData
      ? actionData.failure
      : undefined;
  const validationErrorFor = (intent: string) =>
    actionData && !actionData.ok && actionData.intent === intent && "validationError" in actionData
      ? actionData.validationError
      : undefined;
  const savedIntent = actionData?.ok ? actionData.intent : undefined;

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader eyebrow="Access" subtitle={`/${group.slug}`} title={group.name} />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="defaults">Defaults &amp; governance</TabsTrigger>
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>

        <TabsContent className="flex flex-col gap-8" value="details">
          <Form className="flex flex-col gap-4" method="post">
            <input name="intent" type="hidden" value="rename" />
            <Field label="Name">
              <Input defaultValue={group.name} name="name" required />
            </Field>
            <Field
              hint="Used to derive this group's policy-number prefix. Changing it breaks old category-browse links."
              label="Slug"
            >
              <Input defaultValue={group.slug} name="slug" required />
            </Field>
            {validationErrorFor("rename") ? (
              <Banner title="Couldn't rename this group" tone="danger">
                {validationErrorFor("rename")}
              </Banner>
            ) : null}
            {errorFor("rename") ? (
              <Banner
                failure={errorFor("rename")}
                title="Couldn't rename this group"
                tone="danger"
              />
            ) : null}
            <Button className="self-start" type="submit">
              Rename
            </Button>
            {savedIntent === "rename" ? <p className="text-sm text-ok">Renamed.</p> : null}
          </Form>

          <Form className="flex flex-col gap-3 border-t border-border pt-6" method="post">
            <input name="intent" type="hidden" value="move" />
            <Field hint="Re-parents this group and its subgroups. Max depth is 3." label="Move to">
              <Select
                defaultValue={group.parentId ?? TOP_LEVEL}
                name="parentId"
                options={[
                  { label: "Top level (no parent)", value: TOP_LEVEL },
                  ...candidates.map((c) => ({ label: c.path, value: c.id })),
                ]}
              />
            </Field>
            {errorFor("move") ? (
              <Banner failure={errorFor("move")} title="Couldn't move this group" tone="danger" />
            ) : null}
            <Button className="self-start" type="submit" variant="secondary">
              Move
            </Button>
            {savedIntent === "move" ? <p className="text-sm text-ok">Moved.</p> : null}
          </Form>
        </TabsContent>

        <TabsContent value="defaults">
          <Form className="flex flex-col gap-4" method="post">
            <input name="intent" type="hidden" value="save-settings" />

            <Field
              hint="No template lets authors write freeform; a template scaffolds required sections."
              label="Default template"
            >
              <Select
                defaultValue={group.defaultTemplateId ?? NO_TEMPLATE}
                name="defaultTemplateId"
                options={[
                  { label: "No template (freeform)", value: NO_TEMPLATE },
                  ...templates.map((t) => ({ label: t.name, value: t.id })),
                ]}
              />
            </Field>

            <Field
              hint="A workflow belongs to one group. Only this group's current workflow and unassigned ones are shown."
              label="Default workflow"
            >
              <Select
                defaultValue={group.defaultWorkflowId ?? NO_WORKFLOW}
                name="defaultWorkflowId"
                options={[
                  { label: "None", value: NO_WORKFLOW },
                  ...workflows.map((w) => ({ label: w.name, value: w.id })),
                ]}
              />
            </Field>

            <Field label="Review cadence">
              <Select
                defaultValue={group.reviewCadence}
                name="reviewCadence"
                options={[
                  { label: "None", value: "NONE" },
                  { label: "Annual", value: "ANNUAL" },
                  { label: "Every 2 years", value: "BIENNIAL" },
                  { label: "On a specific date", value: "ON_DATE" },
                ]}
              />
            </Field>

            <Field label="Review date">
              <Input defaultValue={group.reviewDate ?? ""} name="reviewDate" type="date" />
            </Field>

            {owns ? (
              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-semibold text-ink">Owner(s)</legend>
                <p className="text-xs text-muted">
                  Reviews this group&apos;s policies on the cadence above.
                </p>
                {userOptions.map((option) => (
                  <label className="flex items-center gap-3 text-sm text-ink" key={option.value}>
                    <Checkbox
                      defaultChecked={owners.includes(option.value)}
                      name="owners"
                      value={option.value}
                    />
                    {option.label}
                    <span className="text-muted">{option.email}</span>
                  </label>
                ))}
              </fieldset>
            ) : (
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink">Owner(s)</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {owners.length === 0 ? (
                    <span className="text-sm text-muted">None</span>
                  ) : (
                    owners.map((userId) => (
                      <Badge key={userId} tone="neutral">
                        {userOptions.find((o) => o.value === userId)?.label ?? userId}
                      </Badge>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted">
                  Inherited from the top-level department (read-only).
                </p>
              </div>
            )}

            <fieldset className="flex flex-col gap-4 border-t border-border pt-6">
              <legend className="text-sm font-semibold text-ink">
                Acknowledgement &amp; access
              </legend>

              <Field label="Ack trigger">
                <Select
                  defaultValue={group.ackTriggers}
                  name="ackTriggers"
                  options={[
                    { label: "Never", value: "NONE" },
                    { label: "On publish", value: "ON_PUBLISH" },
                    { label: "On every change", value: "ON_CHANGE" },
                  ]}
                />
              </Field>

              <Field
                hint={
                  group.ackEveryoneSet
                    ? "This group sets its own ack audience."
                    : `Inherited: ${effectiveAckEveryoneValue ? "everyone" : "the IdP groups below"}.`
                }
                label="Ack audience"
              >
                <Select
                  defaultValue={effectiveAckEveryoneValue ? EVERYONE : SPECIFIC_GROUPS}
                  name="ackAudience"
                  options={[
                    { label: "Everyone", value: EVERYONE },
                    { label: "Specific IdP groups", value: SPECIFIC_GROUPS },
                  ]}
                />
              </Field>

              <Field
                hint="Comma-separated IdP group claim values. Used when the audience above is 'Specific IdP groups'. Saving here always sets an explicit override — there's no way back to inherited from this form."
                label="IdP groups (ack audience)"
              >
                <Input
                  defaultValue={(effectiveIdpGroupIdsValue ?? []).join(", ")}
                  name="idpGroupIds"
                />
              </Field>

              <Field
                hint="Comma-separated IdP group claim values excluded from this category's ack audience and visibility. Saving here always sets an explicit override."
                label="Excluded IdP groups"
              >
                <Input
                  defaultValue={(effectiveExclusionGroupIdsValue ?? []).join(", ")}
                  name="exclusionGroupIds"
                />
              </Field>
            </fieldset>

            {errorFor("save-settings") ? (
              <Banner
                failure={errorFor("save-settings")}
                title="Couldn't save these settings"
                tone="danger"
              />
            ) : null}
            <Button className="self-start" type="submit">
              Save
            </Button>
            {savedIntent === "save-settings" ? <p className="text-sm text-ok">Saved.</p> : null}
          </Form>
        </TabsContent>

        <TabsContent className="flex flex-col gap-4" value="danger">
          <p className="text-sm font-semibold text-danger">Delete this group</p>
          <p className="text-sm text-muted">
            Deletes <strong>{group.name}</strong> and its policy-free subgroups. Blocked if this
            group or any subgroup has policies.
          </p>
          {errorFor("delete") ? (
            <Banner failure={errorFor("delete")} title="Couldn't delete this group" tone="danger" />
          ) : null}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="self-start" variant="danger">
                Delete group...
              </Button>
            </DialogTrigger>
            <DialogContent
              description="This can't be undone, and is blocked if the group or a subgroup has policies."
              title={`Delete ${group.name}?`}
            >
              <Form method="post">
                <input name="intent" type="hidden" value="delete" />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" variant="danger">
                    Delete group
                  </Button>
                </DialogFooter>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
