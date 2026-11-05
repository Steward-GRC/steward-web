// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { User } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { Button, cn, EmptyState, Input, Switch } from "@steward-web/ui";
import { useId, useState } from "react";
import { Link, useSubmit } from "react-router";

import type { Route } from "./+types/users";

import { listPlatformGroups } from "../groups/platformGroups.server";
import { roleKey } from "../users/roles";
import { listUsers } from "../users/users.server";

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

// The frame's columns (A16): Name, Email, a 110 px Status, Roles, Groups and Access.
const GRID = "md:grid md:grid-cols-[1fr_1.4fr_110px_1.3fr_1fr_1.2fr] md:items-center md:gap-x-2";

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
  const { groupNames, includeDeleted, users } = loaderData;
  const submit = useSubmit();
  const toggleId = useId();
  const [query, setQuery] = useState("");

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

  const words = query.trim().toLowerCase();
  const shown = words
    ? users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(words))
    : users;

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
      <Input
        aria-label={t("users.search")}
        className="md:hidden"
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("users.search")}
        type="search"
        value={query}
      />

      {shown.length === 0 ? (
        <EmptyState description={t("users.empty.description")} title={t("users.empty.title")} />
      ) : (
        <div
          className="overflow-hidden rounded-[10px] border border-border bg-surface text-sm"
          role="table"
        >
          <div
            className={cn(
              GRID,
              "hidden border-b border-border-strong bg-sunken px-3.5 py-[9px] font-semibold text-muted",
            )}
            role="row"
          >
            {(["name", "email", "status", "roles", "groups", "access"] as const).map((column) => (
              <span key={column} role="columnheader">
                {t(`users.columns.${column}`)}
              </span>
            ))}
          </div>
          {shown.map((user) => {
            const [label, tone] = status(user);
            const closed = Boolean(user.deletedAt) || !user.enabled;
            return (
              <div
                className={cn(
                  GRID,
                  "flex flex-col gap-1 border-b border-border px-3.5 py-2.5 last:border-b-0",
                  closed && "text-muted",
                )}
                key={user.userId}
                role="row"
              >
                <span role="cell">
                  {user.deletedAt ? (
                    <b className="font-semibold">{user.name}</b>
                  ) : (
                    <Link
                      className="font-semibold text-inherit hover:text-primary hover:underline"
                      to={`/users/${user.userId}`}
                    >
                      {user.name}
                    </Link>
                  )}
                </span>
                <span className="min-w-0 truncate" role="cell">
                  {user.email}
                </span>
                <span className="flex" role="cell">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-2xs leading-[15px] font-semibold",
                      PILL[tone],
                    )}
                  >
                    {label}
                  </span>
                </span>
                <span role="cell">{roles(user)}</span>
                <span role="cell">{groups(user)}</span>
                <span className="text-xs" role="cell">
                  {access(user)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
