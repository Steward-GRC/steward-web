// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Banner,
  EmptyState,
  type Failure,
} from "@steward-web/ui";
import { Lock, X } from "lucide-react";
import { data, useFetcher } from "react-router";

import type { Route } from "./+types/my-groups";

import { MemberPicker } from "../users/MemberPicker";
import {
  addUserToGroup,
  type GroupMember,
  listManagedGroupMembers,
  listManagedGroups,
  removeUserFromGroup,
} from "../users/myGroups.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const groups = await listManagedGroups(request);
  const membersByGroup = await Promise.all(
    groups.map((g) => listManagedGroupMembers(request, g.id)),
  );
  return {
    groups: groups.map((g, index) => ({ ...g, members: membersByGroup[index] ?? [] })),
  };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const groupId = String(form.get("groupId") ?? "");
  const userId = String(form.get("userId") ?? "");

  try {
    switch (intent) {
      case "add-member": {
        await addUserToGroup(request, userId, groupId);
        break;
      }
      case "remove-member": {
        await removeUserFromGroup(request, userId, groupId);
        break;
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
    return { groupId, intent, ok: true } as const;
  } catch (error) {
    if (error instanceof Response) throw error;
    return data({ failure: refusalOf(error), groupId, intent, ok: false } as const, {
      status: 400,
    });
  }
};

type GroupResult = { failure: Failure; ok: false } | { ok: true };

const CHIP = "flex h-7 items-center gap-1.5 rounded-full bg-sunken px-2.5";

/** One managed group's members as chips: manual ones with a remove cross, synced ones locked. */
const GroupMembers = ({
  group,
}: {
  group: { id: string; members: readonly GroupMember[]; name: string };
}) => {
  const { t } = useTranslation("admin");
  const change = useFetcher<GroupResult>();
  const failure =
    change.state === "idle" && change.data && !change.data.ok ? change.data.failure : undefined;
  const submit = (intent: "add-member" | "remove-member", userId: string) =>
    void change.submit({ groupId: group.id, intent, userId }, { method: "post" });

  return (
    <>
      <ul
        aria-label={t("myGroups.members", { name: group.name })}
        className="flex flex-wrap gap-1.5 text-sm"
      >
        {group.members.map((member) =>
          member.source === "idp-sync" ? (
            <li className={`${CHIP} text-muted`} key={member.userId}>
              <Lock aria-hidden="true" className="size-3.5" />
              {t("myGroups.synced", { name: member.name })}
            </li>
          ) : (
            <li className={CHIP} key={member.userId}>
              {member.name}
              <button
                aria-label={t("myGroups.remove", { group: group.name, member: member.name })}
                className="flex rounded-full text-muted hover:text-ink"
                onClick={() => submit("remove-member", member.userId)}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </li>
          ),
        )}
        <li>
          <MemberPicker
            exclude={new Set(group.members.map((member) => member.userId))}
            onPick={(userId) => submit("add-member", userId)}
          />
        </li>
      </ul>
      {failure ? <Banner failure={failure} title={t("myGroups.failed")} tone="danger" /> : null}
    </>
  );
};

/**
 * My groups (A22), for group managers: one accordion per group they manage, its members as
 * chips, "Add member…", and the members synced from the identity provider locked.
 */
export default function MyGroups({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const { groups } = loaderData;

  return (
    <div className="flex w-full flex-col gap-3 p-4 md:p-6">
      <header>
        <h1 className="text-2xl font-semibold">{t("myGroups.title")}</h1>
        <p className="text-base text-muted">{t("myGroups.subtitle")}</p>
      </header>
      {groups.length === 0 ? (
        <EmptyState
          description={t("myGroups.empty.description")}
          title={t("myGroups.empty.title")}
        />
      ) : (
        <Accordion
          className="flex flex-col gap-3"
          defaultValue={groups.map((group) => group.id)}
          type="multiple"
        >
          {groups.map((group) => (
            <AccordionItem
              className="overflow-hidden rounded-[10px] border border-border bg-surface"
              key={group.id}
              value={group.id}
            >
              <AccordionTrigger className="flex-row-reverse justify-end gap-2 border-b border-border px-3.5 py-2.5 text-base">
                <span>
                  <b>{group.name}</b>{" "}
                  <span className="text-sm font-normal text-muted">
                    · {t("myGroups.count", { count: group.members.length })}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-2 px-3.5 py-2">
                <GroupMembers group={group} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
