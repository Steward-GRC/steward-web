// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  Badge,
  Checkbox,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Table,
  TD,
  TH,
  THead,
} from "@steward-web/ui";
import { Form, Link } from "react-router";

import type { Route } from "./+types/users";

import { roleLabel } from "../users/roles";
import { listUsers } from "../users/users.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("q")?.trim() || undefined;
  const includeDeleted = url.searchParams.get("deleted") === "1";
  const users = await listUsers(request, { includeDeleted, search });
  return { includeDeleted, search: search ?? "", users };
};

export default function Users({ loaderData }: Route.ComponentProps) {
  const { includeDeleted, search, users } = loaderData;

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader eyebrow="Access" subtitle="Platform users and roles." title="Users" />

      <Form className="flex flex-wrap items-end gap-4" method="get">
        <Field label="Email">
          <Input defaultValue={search} name="q" placeholder="Search by email…" type="search" />
        </Field>
        <label className="flex h-9 items-center gap-2 text-sm text-ink" htmlFor="show-deleted">
          <Checkbox defaultChecked={includeDeleted} id="show-deleted" name="deleted" value="1" />
          Show deleted
        </label>
        <button
          className="h-9 rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-ink hover:bg-sunken"
          type="submit"
        >
          Search
        </button>
      </Form>

      {users.length === 0 ? (
        <EmptyState description="No platform users match this search." title="No users found" />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Status</TH>
              <TH>Roles</TH>
              <TH>Groups</TH>
            </tr>
          </THead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId}>
                <TD>
                  {user.deletedAt ? (
                    <span className="font-medium">{user.name}</span>
                  ) : (
                    <Link
                      className="font-medium text-primary hover:underline"
                      to={`/users/${user.userId}`}
                    >
                      {user.name}
                    </Link>
                  )}
                </TD>
                <TD className="text-muted">{user.email}</TD>
                <TD>
                  {user.deletedAt ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone="neutral">{user.mergedIntoUserId ? "merged" : "deleted"}</Badge>
                      {user.mergedIntoUserId ? (
                        <span className="text-sm text-muted">
                          into{" "}
                          <Link
                            className="text-primary hover:underline"
                            to={`/users/${user.mergedIntoUserId}`}
                          >
                            {users.find((u) => u.userId === user.mergedIntoUserId)?.name ??
                              user.mergedIntoUserId}
                          </Link>
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={user.enabled ? "ok" : "danger"}>
                        {user.enabled ? "enabled" : "disabled"}
                      </Badge>
                      {user.isRoot ? <Badge tone="primary">root</Badge> : null}
                    </div>
                  )}
                </TD>
                <TD>
                  {user.roles.length === 0 ? (
                    <span className="text-sm text-muted">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} tone="info">
                          {roleLabel(role)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TD>
                <TD className="text-muted">
                  {user.adGroups.length === 0 ? "—" : user.adGroups.join(", ")}
                </TD>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
