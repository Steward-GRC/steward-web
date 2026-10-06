import { refusalOf } from "@steward-web/shell";
// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
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
  EmptyState,
  Field,
  Input,
  PageHeader,
  Switch,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TD,
  TH,
  THead,
} from "@steward-web/ui";
import { data, Form, Link, redirect } from "react-router";

import type { Route } from "./+types/users.$userId";

import { BASELINE_ROLE, GLOBAL_ROLES, roleLabel } from "../users/roles";
import { lastSeenLabel } from "../users/sessionTimes";
import {
  deleteUser,
  findUser,
  listUserSessions,
  previewUserDeletion,
  revokeUserSessions,
  saveUserProfile,
  setUserEnabled,
  setUserGlobalRoles,
} from "../users/users.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const user = await findUser(request, params.userId);
  if (!user) return { deletionPreview: null, sessions: [], user: null };

  const [sessions, deletionPreview] = await Promise.all([
    listUserSessions(request, user.userId),
    user.deletedAt ? Promise.resolve(null) : previewUserDeletion(request, user.userId),
  ]);
  return { deletionPreview, sessions, user };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const user = await findUser(request, params.userId);
  if (!user) throw data("User not found", { status: 404 });

  const form = await request.formData();
  const intent = form.get("intent");

  try {
    switch (intent) {
      case "delete": {
        await deleteUser(request, user.userId);
        return redirect("/users");
      }
      case "revoke-sessions": {
        await revokeUserSessions(request, user.userId);
        return data({ intent, ok: true } as const);
      }
      case "save-profile": {
        const enabled = form.has("enabled");
        if (!user.isRoot && user.enabled !== enabled) {
          await setUserEnabled(request, user.userId, enabled);
        }
        if (user.localAccount) {
          const name = String(form.get("name") ?? "").trim();
          const email = String(form.get("email") ?? "").trim();
          if (name && email) await saveUserProfile(request, user.userId, name, email);
        }
        return data({ intent, ok: true } as const);
      }
      case "save-roles": {
        if (!user.isRoot) {
          await setUserGlobalRoles(request, user, form.getAll("roles").map(String));
        }
        return data({ intent, ok: true } as const);
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
  } catch (error) {
    return data({ error: refusalOf(error), intent: String(intent), ok: false } as const, {
      status: 400,
    });
  }
};

export default function UserEdit({ actionData, loaderData }: Route.ComponentProps) {
  const { deletionPreview, sessions, user } = loaderData;

  if (!user) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader eyebrow="Access" subtitle="No user matches that id." title="User not found" />
        <Button asChild className="self-start" variant="secondary">
          <Link to="/users">Back to users</Link>
        </Button>
      </div>
    );
  }

  const errorFor = (intent: string) =>
    actionData && !actionData.ok && actionData.intent === intent ? actionData.error : undefined;
  const savedProfile = actionData?.ok && actionData.intent === "save-profile";
  const savedRoles = actionData?.ok && actionData.intent === "save-roles";

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader eyebrow="Access" subtitle={user.email} title={user.name} />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="roles">Roles &amp; access</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent className="flex flex-col gap-6" value="profile">
          <Form className="flex flex-col gap-4" method="post">
            <input name="intent" type="hidden" value="save-profile" />
            <Field label="Username">
              <Input disabled readOnly value={user.username || "—"} />
            </Field>
            <label className="flex items-center gap-3 text-sm text-ink" htmlFor="user-enabled">
              <Switch
                defaultChecked={user.enabled}
                disabled={user.isRoot}
                id="user-enabled"
                name="enabled"
                value="true"
              />
              Account enabled
            </label>
            {user.isRoot ? (
              <p className="text-sm text-muted">
                This is the protected root site-admin. It can&apos;t be disabled or demoted; account
                enablement and role toggles are locked.
              </p>
            ) : null}

            {user.localAccount ? (
              <>
                <Field label="Display name">
                  <Input defaultValue={user.name} name="name" required />
                </Field>
                <Field label="Email">
                  <Input defaultValue={user.email} name="email" required type="email" />
                </Field>
              </>
            ) : (
              <p className="text-sm text-muted">
                This is a directory (AD / SSO) account. Display name, email and password are managed
                by the identity provider and can&apos;t be edited here.
              </p>
            )}

            {errorFor("save-profile") ? (
              <Banner
                failure={errorFor("save-profile")}
                title="Couldn't save this user"
                tone="danger"
              />
            ) : null}
            <Button className="self-start" type="submit">
              Save
            </Button>
            {savedProfile ? <p className="text-sm text-ok">Saved.</p> : null}
          </Form>
        </TabsContent>

        <TabsContent className="flex flex-col gap-6" value="roles">
          <Form className="flex flex-col gap-4" method="post">
            <input name="intent" type="hidden" value="save-roles" />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">Reader baseline</span>
              <Badge tone={user.enabled ? "info" : "neutral"}>{roleLabel(BASELINE_ROLE)}</Badge>
              <p className="text-sm text-muted">
                {user.enabled
                  ? "Every enabled user is a Reader by default."
                  : "Suspended while the account is disabled."}
              </p>
            </div>

            {user.isRoot ? (
              <p className="text-sm text-muted">
                Root holds every permission inherently — there are no role toggles to assign.
              </p>
            ) : (
              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-semibold text-ink">Elevated roles</legend>
                {GLOBAL_ROLES.map((role) => (
                  <label className="flex items-center gap-3 text-sm text-ink" key={role.value}>
                    <Checkbox
                      defaultChecked={user.roles.includes(role.value)}
                      name="roles"
                      value={role.value}
                    />
                    {role.label}
                  </label>
                ))}
              </fieldset>
            )}

            {errorFor("save-roles") ? (
              <Banner
                failure={errorFor("save-roles")}
                title="Couldn't save these roles"
                tone="danger"
              />
            ) : null}
            {user.isRoot ? null : (
              <Button className="self-start" type="submit">
                Save
              </Button>
            )}
            {savedRoles ? <p className="text-sm text-ok">Saved.</p> : null}
          </Form>
        </TabsContent>

        <TabsContent className="flex flex-col gap-8" value="security">
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Sessions</h2>
              {sessions.some((s) => s.active) ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="danger">
                      Log out everywhere
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    description="This immediately revokes every active session. The user will need to sign in again."
                    title={`Log out ${user.name} everywhere?`}
                  >
                    <Form method="post">
                      <input name="intent" type="hidden" value="revoke-sessions" />
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" variant="danger">
                          Log out everywhere
                        </Button>
                      </DialogFooter>
                    </Form>
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>
            {errorFor("revoke-sessions") ? (
              <Banner
                failure={errorFor("revoke-sessions")}
                title="Couldn't log this user out"
                tone="danger"
              />
            ) : null}
            {sessions.length === 0 ? (
              <EmptyState description="No sessions found for this user." title="No sessions" />
            ) : (
              <Table>
                <THead>
                  <tr>
                    <TH>Status</TH>
                    <TH>Issued</TH>
                    <TH>Signed in</TH>
                    <TH>Last seen</TH>
                    <TH>Expires</TH>
                    <TH>Client IP</TH>
                  </tr>
                </THead>
                <tbody>
                  {sessions.map((session) => {
                    const expired = new Date(session.expiresAt) <= new Date();
                    return (
                      <tr key={session.sessionId}>
                        <TD>
                          <Badge tone={session.active ? "ok" : "neutral"}>
                            {session.active ? "Active" : expired ? "Expired" : "Revoked"}
                          </Badge>
                        </TD>
                        <TD className="text-muted">
                          {new Date(session.issuedAt).toLocaleString()}
                        </TD>
                        <TD className="text-muted">
                          {new Date(session.authenticatedAt).toLocaleString()}
                        </TD>
                        <TD className="text-muted">{lastSeenLabel(session)}</TD>
                        <TD className="text-muted">
                          {new Date(session.expiresAt).toLocaleString()}
                        </TD>
                        <TD className="text-muted">{session.clientIp ?? "—"}</TD>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </section>

          {!user.deletedAt && deletionPreview ? (
            <section className="flex flex-col gap-4 border-t border-border pt-6">
              <h2 className="text-sm font-semibold text-danger">Delete user</h2>
              <p className="text-sm text-muted">
                Permanently removes <strong>{user.name}</strong>&apos;s account, revokes their
                sessions and drops their access. This never deletes a policy they own.
              </p>
              {deletionPreview.warnings.map((warning) => (
                <Banner key={warning.code} title={warning.message} tone="warn" />
              ))}
              {deletionPreview.items.length > 0 ? (
                <ul className="flex flex-col gap-1.5 text-sm">
                  {deletionPreview.items.map((item) => (
                    <li className="flex items-center gap-2" key={item.refId}>
                      <Badge tone={item.blocksDelete ? "danger" : "neutral"}>{item.label}</Badge>
                      <span className="text-muted">{item.detail}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {errorFor("delete") ? (
                <Banner
                  failure={errorFor("delete")}
                  title="Couldn't delete this user"
                  tone="danger"
                />
              ) : null}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="self-start"
                    disabled={user.isRoot || deletionPreview.blocksDelete}
                    variant="danger"
                  >
                    Delete user…
                  </Button>
                </DialogTrigger>
                <DialogContent
                  description="This can't be undone from here."
                  title={`Delete ${user.name}?`}
                >
                  <Form method="post">
                    <input name="intent" type="hidden" value="delete" />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" variant="danger">
                        Delete user
                      </Button>
                    </DialogFooter>
                  </Form>
                </DialogContent>
              </Dialog>
              {user.isRoot ? (
                <p className="text-sm text-muted">
                  The protected root account can&apos;t be deleted.
                </p>
              ) : deletionPreview.blocksDelete ? (
                <p className="text-sm text-muted">
                  Resolve the items above before this account can be deleted.
                </p>
              ) : null}
            </section>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
