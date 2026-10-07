// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { refusalOf } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Table,
  TD,
  TH,
  THead,
} from "@steward-web/ui";
import { data, Form } from "react-router";

import type { Route } from "./+types/platform-groups";

import { createPlatformGroup, listPlatformGroups } from "../groups/platformGroups.server";
import {
  addUserToGroup,
  findUserByEmail,
  type GroupMember,
  listManagedGroupMembers,
  removeUserFromGroup,
} from "../users/myGroups.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const groups = await listPlatformGroups(request);
  const members = await Promise.all(groups.map((g) => listManagedGroupMembers(request, g.id)));
  return { groups: groups.map((g, index) => ({ ...g, members: members[index] ?? [] })) };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const groupId = String(form.get("groupId") ?? "");

  try {
    switch (intent) {
      case "add-member": {
        const email = String(form.get("email") ?? "").trim();
        const match = email ? await findUserByEmail(request, email) : undefined;
        if (!match) {
          return data({ error: undefined, groupId, notFound: true, ok: false } as const, {
            status: 400,
          });
        }
        await addUserToGroup(request, match.id, groupId);
        return data({ groupId, ok: true } as const);
      }
      case "create": {
        const name = String(form.get("name") ?? "").trim();
        const parentId = String(form.get("parentId") ?? "");
        await createPlatformGroup(request, name, parentId === "" ? null : parentId);
        return data({ groupId: "", ok: true } as const);
      }
      case "remove-member": {
        await removeUserFromGroup(request, String(form.get("userId") ?? ""), groupId);
        return data({ groupId, ok: true } as const);
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
  } catch (error) {
    if (error instanceof Response) throw error;
    return data({ error: refusalOf(error), groupId, notFound: false, ok: false } as const, {
      status: 400,
    });
  }
};

const MemberTable = ({ groupId, members }: { groupId: string; members: readonly GroupMember[] }) =>
  members.length === 0 ? (
    <p className="text-sm text-muted">No members yet. Add one below.</p>
  ) : (
    <Table>
      <THead>
        <tr>
          <TH>Name</TH>
          <TH>Email</TH>
          <TH />
        </tr>
      </THead>
      <tbody>
        {members.map((m) => (
          <tr key={m.userId}>
            <TD>{m.name}</TD>
            <TD className="text-muted">{m.email}</TD>
            <TD className="text-right">
              {m.source === "idp-sync" ? (
                <Badge tone="neutral">Synced</Badge>
              ) : (
                <Form method="post">
                  <input name="intent" type="hidden" value="remove-member" />
                  <input name="groupId" type="hidden" value={groupId} />
                  <input name="userId" type="hidden" value={m.userId} />
                  <Button size="sm" type="submit" variant="ghost">
                    Remove
                  </Button>
                </Form>
              )}
            </TD>
          </tr>
        ))}
      </tbody>
    </Table>
  );

export default function PlatformGroups({ actionData, loaderData }: Route.ComponentProps) {
  const { groups } = loaderData;
  const failedFor = (groupId: string) =>
    actionData && !actionData.ok && actionData.groupId === groupId ? actionData : undefined;
  const createFailed = failedFor("");

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        eyebrow="Access"
        subtitle="The identity groups people are members of. Reporting's officer setting, SSO group mappings and group managers name these by id. Categories are on the Groups page."
        title="Platform groups"
      />

      <Card>
        <CardHeader>
          <CardTitle>New platform group</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          <Form className="flex flex-wrap items-end gap-3" method="post">
            <input name="intent" type="hidden" value="create" />
            <Field label="Name">
              <Input name="name" placeholder="Privacy Officers" required type="text" />
            </Field>
            <Field label="Parent">
              <select
                className="h-9 rounded-md border border-border-strong bg-surface px-2"
                name="parentId"
              >
                <option value="">None (a root group)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.path}
                  </option>
                ))}
              </select>
            </Field>
            <Button type="submit">Create</Button>
          </Form>
          {createFailed?.error ? (
            <Banner failure={createFailed.error} title="Couldn't create the group" tone="danger" />
          ) : null}
        </CardBody>
      </Card>

      {groups.length === 0 ? (
        <EmptyState
          description="Create one above, then add its members."
          title="No platform groups yet"
        />
      ) : (
        groups.map((group) => {
          const failed = failedFor(group.id);
          return (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle>{group.path}</CardTitle>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <p className="text-sm text-muted">
                  Id <code className="select-all text-ink">{group.id}</code>
                </p>
                <MemberTable groupId={group.id} members={group.members} />
                <Form className="flex flex-wrap items-end gap-3" method="post">
                  <input name="intent" type="hidden" value="add-member" />
                  <input name="groupId" type="hidden" value={group.id} />
                  <Field label="Add by email">
                    <Input name="email" placeholder="name@example.com" required type="email" />
                  </Field>
                  <Button type="submit" variant="secondary">
                    Add
                  </Button>
                </Form>
                {failed?.notFound ? (
                  <p className="text-sm text-danger">No user found with that email.</p>
                ) : failed?.error ? (
                  <Banner failure={failed.error} title="Couldn't update this group" tone="danger" />
                ) : null}
              </CardBody>
            </Card>
          );
        })
      )}
    </div>
  );
}
