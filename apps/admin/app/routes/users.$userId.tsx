// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { OverrideEffect } from "@steward-web/api-client";
import { identityFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import { shellConfigFromEnvironment } from "@steward-web/shell/server";
import { Button, NotFound, Tabs, TabsContent, TabsList, TabsTrigger } from "@steward-web/ui";
import { data, Link, redirect, redirectDocument, useSearchParams } from "react-router";

import type { Route } from "./+types/users.$userId";

import { AdvancedTab } from "../users/AdvancedTab";
import { ProfileTab } from "../users/ProfileTab";
import { roleKey } from "../users/roles";
import { RolesTab } from "../users/RolesTab";
import { SecurityTab } from "../users/SecurityTab";
import {
  actAsUser,
  listPolicyChoices,
  listUserFactors,
  reassignPolicies,
  removeUserFactor,
  renameUserFactor,
  resendWelcome,
  resetPassword,
  sendStepUpCode,
  setPolicyException,
  transferRoot,
} from "../users/userAdmin.server";
import {
  deleteUser,
  findUser,
  listUsers,
  listUserSessions,
  previewUserDeletion,
  revokeUserSessions,
  saveUserProfile,
  setUserEnabled,
  setUserGlobalRoles,
} from "../users/users.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const user = await findUser(request, params.userId);
  if (!user) return data({ user: null }, { status: 404 });

  const live = !user.deletedAt;
  const [identity, everyone, sessions, deletionPreview, factors, policies] = await Promise.all([
    identityFromRequest(request),
    listUsers(request),
    // Each part below is read on its own; one that fails leaves its card empty, not the page.
    listUserSessions(request, user.userId).catch(() => []),
    live ? previewUserDeletion(request, user.userId).catch(() => null) : Promise.resolve(null),
    live ? listUserFactors(request, user.userId).catch(() => []) : Promise.resolve([]),
    live ? listPolicyChoices(request).catch(() => []) : Promise.resolve([]),
  ]);
  const root = everyone.find((entry) => entry.isRoot);
  return {
    deletionPreview,
    factors,
    people: everyone
      .filter((entry) => !entry.deletedAt && entry.enabled && entry.userId !== user.userId)
      .map((entry) => ({ id: entry.userId, name: entry.name })),
    policies,
    rootName: root?.name ?? "",
    sessions,
    user,
    viewerIsRoot: root !== undefined && root.userId === identity.id,
  };
};

const EFFECTS = new Set<string>(Object.values(OverrideEffect));

export const action = async ({ params, request }: Route.ActionArgs) => {
  const user = await findUser(request, params.userId);
  if (!user) throw data("User not found", { status: 404 });
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const field = (name: string) => String(form.get(name) ?? "");

  try {
    switch (intent) {
      case "act-as": {
        await actAsUser(request, user.userId, field("reason"));
        // The acting-as session lives on the admin's gateway session; staff shows its banner.
        // A whole-document redirect to an absolute address, so it leaves the admin app (and its
        // basename) for the staff app.
        return redirectDocument(new URL(shellConfigFromEnvironment().staffUrl, request.url).href);
      }
      case "add-exception": {
        const effect = field("effect");
        if (!EFFECTS.has(effect)) throw data("unknown effect", { status: 400 });
        await setPolicyException(
          request,
          user.userId,
          field("policyNumber"),
          effect as OverrideEffect,
        );
        break;
      }
      case "delete": {
        await deleteUser(request, user.userId);
        return redirect("/users");
      }
      case "make-root": {
        await transferRoot(request, user.userId, field("otp"));
        break;
      }
      case "reassign": {
        await reassignPolicies(request, user.userId, field("toUserId"));
        break;
      }
      case "remove-exception": {
        await setPolicyException(request, user.userId, field("policyNumber"), null);
        break;
      }
      case "rename-factor": {
        await renameUserFactor(request, user.userId, field("methodId"), field("label"));
        break;
      }
      case "resend-welcome": {
        await resendWelcome(request, user.userId);
        break;
      }
      case "reset-factor": {
        await removeUserFactor(request, user.userId, field("methodId"));
        break;
      }
      case "reset-password": {
        const password = await resetPassword(request, user.userId);
        return { intent, ok: true, password } as const;
      }
      case "revoke-sessions": {
        await revokeUserSessions(request, user.userId);
        break;
      }
      case "save-profile": {
        const enabled = form.has("enabled");
        if (!user.isRoot && user.enabled !== enabled) {
          await setUserEnabled(request, user.userId, enabled);
        }
        if (user.localAccount && field("name").trim() && field("email").trim()) {
          await saveUserProfile(request, user.userId, field("name").trim(), field("email").trim());
        }
        break;
      }
      case "save-roles": {
        if (!user.isRoot) {
          await setUserGlobalRoles(request, user, form.getAll("roles").map(String));
        }
        break;
      }
      case "send-step-up": {
        await sendStepUpCode(request);
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

const TABS = ["profile", "security", "roles", "advanced"] as const;

/**
 * A user (A17 to A20): "Erin · erin@example.org · Reader", then Profile, Security, Roles &
 * access and Advanced. The open tab is in the address (`?tab=`), so a saved form comes back
 * to it. A closed account is read-only.
 */
export default function UserDetail({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const [search, setSearch] = useSearchParams();

  if (!loaderData.user) {
    return (
      <div className="flex w-full flex-col p-4 md:p-6">
        <NotFound
          action={
            <Button asChild variant="secondary">
              <Link to="/users">{t("users.notFound.action")}</Link>
            </Button>
          }
          description={t("users.notFound.description")}
          title={t("users.notFound.title")}
        />
      </div>
    );
  }

  const { deletionPreview, factors, people, policies, rootName, sessions, user, viewerIsRoot } =
    loaderData;
  const requested = search.get("tab");
  const tab = TABS.find((entry) => entry === requested) ?? "profile";
  const role = user.isRoot
    ? t("users.detail.root")
    : t(roleKey(user.roles[0] ?? "reader"), { defaultValue: user.roles[0] });

  return (
    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
      <header>
        <h1 className="text-2xl font-semibold">{user.name}</h1>
        <p className="text-base text-muted">
          {t("users.detail.subtitle", { email: user.email, role })}
        </p>
      </header>
      {user.deletedAt ? <p className="text-sm text-muted">{t("users.detail.closed")}</p> : null}

      <Tabs
        className="flex flex-col gap-3.5"
        onValueChange={(next) =>
          setSearch(
            (current) => {
              current.set("tab", next);
              return current;
            },
            { preventScrollReset: true, replace: true },
          )
        }
        value={tab}
      >
        <TabsList>
          {TABS.map((entry) => (
            <TabsTrigger key={entry} value={entry}>
              {t(`users.detail.tabs.${entry}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent className="pt-0" value="profile">
          <ProfileTab user={user} />
        </TabsContent>
        <TabsContent className="pt-0" value="security">
          <SecurityTab factors={factors} readOnly={Boolean(user.deletedAt)} />
        </TabsContent>
        <TabsContent className="pt-0" value="roles">
          <RolesTab policies={policies} user={user} />
        </TabsContent>
        <TabsContent className="pt-0" value="advanced">
          <AdvancedTab
            deletionPreview={deletionPreview}
            people={people}
            rootName={rootName}
            sessions={sessions}
            user={user}
            viewerIsRoot={viewerIsRoot}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
