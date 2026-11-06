// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { User } from "@steward-web/api-client";

import { PERMISSIONS, useIdentity } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { useRegisterNavActions } from "@steward-web/shell";
import { Button, cn, EmptyState, ResponsiveTable, Switch } from "@steward-web/ui";
import { useId } from "react";
import { Link, useSubmit } from "react-router";

import type { Route } from "./+types/users";

import { listPlatformGroups } from "../groups/platformGroups.server";
import { roleKey } from "../users/roles";
import { listUsers } from "../users/users.server";

/** The table's own search, sort and page changes don't load the page again. */
export { shouldRevalidateTable as shouldRevalidate } from "@steward-web/ui";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const includeDeleted = new URL(request.url).searchParams.get("deleted") === "1";
  const [users, groups] = await Promise.all([
    listUsers(request, { includeDeleted }),
    // Group names are a courtesy: without them the column falls back to directory groups.
    listPlatformGroups(request).catch(() => []),
  ]);
  const groupNames = Object.fromEntries(groups.map((group) => [group.id, group.name]));
  return { groupNames, includeDeleted, users };
};

type Tone = "neutral" | "ok" | "primary";

const PILL: Record<Tone, string> = {
  neutral: "bg-neutral-soft text-neutral",
  ok: "bg-ok-soft text-ok",
  primary: "bg-primary-soft text-on-primary-soft",
};

/**
 * Users & roles (A16): every platform user with one status pill (enabled, disabled, root,
 * deleted, or merged into someone), their roles, groups and policy access. Closed accounts are
 * read-only. People arrive through sign-in, so there's no "create user" here.
 */
export default function Users({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const identity = useIdentity();
  useRegisterNavActions([
    {
      allowed: identity.isSiteAdmin || identity.permissions.has(PERMISSIONS.UserManage),
      id: "merge",
      label: t("users.merge"),
      to: "/users/merge",
    },
  ]);
  const { groupNames, includeDeleted, users } = loaderData;
  const submit = useSubmit();
  const toggleId = useId();

  const status = (user: User): [string, Tone] => {
    if (user.deletedAt) {
      const into = users.find((entry) => entry.userId === user.mergedIntoUserId);
      return user.mergedIntoUserId
        ? [t("users.status.merged", { name: into?.name ?? user.mergedIntoUserId }), "neutral"]
        : [t("users.status.deleted"), "neutral"];
    }
    if (user.isRoot) return [t("users.status.root"), "primary"];
    return user.enabled
      ? [t("users.status.enabled"), "ok"]
      : [t("users.status.disabled"), "neutral"];
  };

  const roles = (user: User) =>
    user.deletedAt
      ? t("users.none")
      : user.roles.length === 0
        ? t(roleKey("reader"))
        : user.roles.map((role) => t(roleKey(role), { defaultValue: role })).join(", ");

  const groups = (user: User) => {
    if (user.deletedAt) return t("users.none");
    const names = [
      ...new Set([...user.groupIds.map((id) => groupNames[id] ?? id), ...user.idpGroups]),
    ];
    return names.length > 0 ? names.join(", ") : t("users.none");
  };

  const access = (user: User) => {
    if (user.deletedAt || !user.enabled) return t("users.none");
    const deny = user.policyOverrides.filter((entry) => entry.effect === "DENY").length;
    const allow = user.policyOverrides.length - deny;
    if (deny + allow === 0) return t("users.access.all");
    const changes = [
      ...(deny > 0 ? [t("users.access.deny", { count: deny })] : []),
      ...(allow > 0 ? [t("users.access.allow", { count: allow })] : []),
    ];
    return t("users.access.changed", { changes: changes.join(", ") });
  };

  return (
    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
      <header className="flex flex-wrap items-end gap-2.5">
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] leading-[1.3] font-semibold">{t("users.title")}</h1>
          <p className="text-base text-muted">{t("users.subtitle")}</p>
        </div>
        <label className="flex items-center gap-1.5 text-sm" htmlFor={toggleId}>
          {t("users.showDeleted")}
          <Switch
            checked={includeDeleted}
            id={toggleId}
            onCheckedChange={(checked) =>
              void submit(checked ? { deleted: "1" } : {}, { method: "get", replace: true })
            }
          />
        </label>
        <Button asChild className="px-3" variant="secondary">
          <Link to="/users/merge">{t("users.merge")}</Link>
        </Button>
      </header>

      {/* Phones get the table as stacked cards with a search at the top (7-responsive.s3). */}
      <ResponsiveTable
        className="text-sm"
        columns={[
          {
            card: "title",
            cell: (user) =>
              user.deletedAt ? (
                <b className="font-semibold">{user.name}</b>
              ) : (
                <Link
                  className="font-semibold text-inherit hover:text-primary hover:underline"
                  to={`/users/${user.userId}`}
                >
                  {user.name}
                </Link>
              ),
            header: t("users.columns.name"),
            key: "name",
            value: (user) => user.name,
          },
          {
            card: "meta",
            cell: (user) => user.email,
            className: "break-all",
            header: t("users.columns.email"),
            key: "email",
            value: (user) => user.email,
          },
          {
            card: "status",
            cell: (user) => {
              const [label, tone] = status(user);
              return (
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-2xs leading-[15px] font-semibold",
                    PILL[tone],
                  )}
                >
                  {label}
                </span>
              );
            },
            className: "w-[110px]",
            header: t("users.columns.status"),
            key: "status",
            value: (user) => status(user)[0],
          },
          { card: "meta", cell: roles, header: t("users.columns.roles"), key: "roles" },
          { card: "meta", cell: groups, header: t("users.columns.groups"), key: "groups" },
          {
            card: "meta",
            cell: access,
            className: "text-xs",
            header: t("users.columns.access"),
            key: "access",
          },
        ]}
        empty={
          <EmptyState description={t("users.empty.description")} title={t("users.empty.title")} />
        }
        framed
        label={t("users.title")}
        rowClassName={(user) => (user.deletedAt || !user.enabled ? "text-muted" : undefined)}
        rowKey={(user) => user.userId}
        rows={users}
        search={{
          label: t("users.search"),
          placeholder: t("users.search"),
          text: (user) => `${user.name} ${user.email}`,
        }}
      />
    </div>
  );
}
