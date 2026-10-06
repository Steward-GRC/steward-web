// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Button, EmptyState, PageHeader, Table, TD, TH, THead } from "@steward-web/ui";
import { Link } from "react-router";

import type { Route } from "./+types/groups";

import { listGroups, orderedWithPaths } from "../groups/groups.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const groups = await listGroups(request);
  return { rows: orderedWithPaths(groups) };
};

export default function Groups({ loaderData }: Route.ComponentProps) {
  const { rows } = loaderData;

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        actions={
          <Button asChild size="sm">
            <Link to="/groups/new">New group</Link>
          </Button>
        }
        eyebrow="Access"
        subtitle="The org hierarchy: review cadence, owners and inherited defaults."
        title="Groups"
      />

      {rows.length === 0 ? (
        <EmptyState
          description="Create the first group to start the org hierarchy."
          title="No groups yet"
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Group</TH>
            </tr>
          </THead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <TD>
                  <Link
                    className="font-medium text-primary hover:underline"
                    to={`/groups/${row.id}`}
                  >
                    {row.path}
                  </Link>
                </TD>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
