// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Who approves one stage of a workflow (steward-web bug 15): one typeahead box for people and
// groups. The people offered are only the workflow's approver candidates, which the gateway
// builds from the rows of the categories the workflow is attached to, so the site admin is never
// offered and there is no site-wide user list here. A workflow no category uses yet offers
// nobody and says to attach it first.
import type { GroupUnitInput } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { type ChipItem, ChipPicker } from "@steward-web/ui";
import { User, Users } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";

/** What the loader read from the gateway's `workflowApproverCandidates`; null when it could not. */
export interface ApproverCandidatesView {
  attached: boolean;
  users: readonly { id: string; name: string }[];
}

/** The names of people already on a stage, so a chip can say who it is (and when they are off). */
export interface ApproverPerson {
  enabled: boolean;
  id: string;
  name: string;
}

export interface ApproverPickerProps {
  /** Null when the gateway could not say; the box then offers nobody and does not guess. */
  candidates: ApproverCandidatesView | null;
  /** Platform group id to the ids of its direct members; a group is offered only with members. */
  groupMembers: Readonly<Record<string, readonly string[]>>;
  /** Platform group names by id. */
  groupNames: Readonly<Record<string, string>>;
  number: number;
  onChange: (next: ApproverPickerValue) => void;
  people: readonly ApproverPerson[];
  value: ApproverPickerValue;
}

/** The part of a stage this box owns: its people and its group units, in the save's own shape. */
export interface ApproverPickerValue {
  approvers: readonly string[];
  groupUnits?: readonly GroupUnitInput[];
}

/** How many of a group's members its internal quorum needs. */
const needed = (unit: GroupUnitInput) => {
  const total = unit.memberUserIds.length;
  if (unit.internalQuorum === "all") return total;
  if (unit.internalQuorum === "majority") return Math.floor(total / 2) + 1;
  return Math.min(1, total);
};

const NO_UNITS: readonly GroupUnitInput[] = [];

const ICONS = {
  group: <Users className="size-3.5" />,
  user: <User className="size-3.5" />,
};

export const ApproverPicker = ({
  candidates,
  groupMembers,
  groupNames,
  number,
  onChange,
  people,
  value,
}: ApproverPickerProps) => {
  const { t } = useTranslation("admin");
  const label = t("workflows.editor.approvers", { number });
  const units = value.groupUnits ?? NO_UNITS;

  const chosen: ChipItem[] = useMemo(
    () => [
      ...value.approvers.map((id) => {
        const who = people.find((entry) => entry.id === id);
        const name = who?.name ?? id;
        return {
          id,
          kind: "user",
          label: who && !who.enabled ? t("workflows.editor.disabled", { name }) : name,
        };
      }),
      ...units.map((unit) => ({
        id: unit.groupId,
        kind: "group",
        label: t("workflows.editor.group", {
          name: groupNames[unit.groupId] ?? unit.groupId,
          need: needed(unit),
          total: unit.memberUserIds.length,
        }),
      })),
    ],
    [groupNames, people, t, units, value.approvers],
  );

  // Everyone who may be picked, and the groups with at least one member among them.
  const offered: ChipItem[] = useMemo(() => {
    if (!candidates?.attached) return [];
    const allowed = new Set(candidates.users.map((user) => user.id));
    const users = candidates.users.map((user) => ({ id: user.id, kind: "user", label: user.name }));
    const groups = Object.entries(groupNames)
      .filter(([id]) => (groupMembers[id] ?? []).some((member) => allowed.has(member)))
      .map(([id, name]) => ({ id, kind: "group", label: name }));
    return [...users, ...groups];
  }, [candidates, groupMembers, groupNames]);

  const change = (next: readonly ChipItem[]) => {
    const kept = new Set(next.map((item) => `${item.kind ?? "user"}:${item.id}`));
    const allowed = new Set(candidates?.users.map((user) => user.id));
    const approvers = [
      ...value.approvers.filter((id) => kept.has(`user:${id}`)),
      ...next
        .filter((item) => item.kind === "user" && !value.approvers.includes(item.id))
        .map((item) => item.id),
    ];
    const groupUnits: GroupUnitInput[] = [
      ...units.filter((unit) => kept.has(`group:${unit.groupId}`)),
      ...next
        .filter((item) => item.kind === "group" && !units.some((unit) => unit.groupId === item.id))
        .map((item) => ({
          groupId: item.id,
          internalQuorum: "one",
          memberUserIds: (groupMembers[item.id] ?? []).filter((member) => allowed.has(member)),
        })),
    ];
    onChange({ approvers, groupUnits });
  };

  const kindLabels = {
    group: t("workflows.editor.approverPicker.group"),
    user: t("workflows.editor.approverPicker.person"),
  };

  if (!candidates?.attached) {
    return (
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="text-sm text-muted" role="status">
          {candidates ? (
            <>
              {t("workflows.editor.approverPicker.notAttached")}{" "}
              <Link className="font-semibold text-primary underline" to="/categories">
                {t("workflows.editor.approverPicker.notAttachedLink")}
              </Link>
            </>
          ) : (
            t("workflows.editor.approverPicker.unavailable")
          )}
        </p>
        <ChipPicker
          kindIcons={ICONS}
          kindLabels={kindLabels}
          label={label}
          onChange={change}
          readOnly
          value={chosen}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      <ChipPicker
        items={offered}
        kindIcons={ICONS}
        kindLabels={kindLabels}
        label={label}
        onChange={change}
        placeholder={t("workflows.editor.approverPicker.placeholder")}
        value={chosen}
      />
    </div>
  );
};
