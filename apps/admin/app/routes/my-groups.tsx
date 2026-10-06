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

import type { Route } from "./+types/my-groups";

import {
  addUserToGroup,
  findUserByEmail,
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
  const intent = form.get("intent");
  const groupId = String(form.get("groupId") ?? "");

  try {
    switch (intent) {
      case "add-member": {
        const email = String(form.get("email") ?? "").trim();
        const match = email ? await findUserByEmail(request, email) : undefined;
        if (!match) {
          return data({ error: undefined, groupId, intent, notFound: true, ok: false } as const, {
            status: 400,
          });
        }
        await addUserToGroup(request, match.id, groupId);
        return data({ groupId, intent, ok: true } as const);
      }
      case "remove-member": {
        const userId = String(form.get("userId") ?? "");
        await removeUserFromGroup(request, userId, groupId);
        return data({ groupId, intent, ok: true } as const);
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
  } catch (error) {
    return data(
      {
        error: refusalOf(error),
        groupId,
        intent: String(intent),
        notFound: false,
        ok: false,
      } as const,
      { status: 400 },
    );
  }
};

const MemberTable = ({ members }: { members: readonly GroupMember[] }) =>
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

export default function MyGroups({ actionData, loaderData }: Route.ComponentProps) {
  const { groups } = loaderData;

  const errorFor = (groupId: string) =>
    actionData && !actionData.ok && actionData.groupId === groupId ? actionData.error : undefined;
  const notFoundFor = (groupId: string) =>
    actionData && !actionData.ok && actionData.groupId === groupId ? actionData.notFound : false;

  if (groups.length === 0) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader
          eyebrow="Access"
          subtitle="Add or remove the members of the groups you manage."
          title="My groups"
        />
        <EmptyState
          description="You don't manage any groups. Ask a site administrator to grant you a group-manager role."
          title="No managed groups"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        eyebrow="Access"
        subtitle="Add or remove the members of the groups you manage. Memberships synced from your identity provider are read-only."
        title="My groups"
      />

      {groups.map((group) => (
        <Card key={group.id}>
          <CardHeader>
            <CardTitle>{group.name}</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <MemberTable members={group.members} />

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
            {notFoundFor(group.id) ? (
              <p className="text-sm text-danger">No user found with that email.</p>
            ) : errorFor(group.id) ? (
              <Banner
                failure={errorFor(group.id)}
                title="Couldn't update this group"
                tone="danger"
              />
            ) : null}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
