// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Badge, Button, Table, TD, TH, THead } from "@steward-web/ui";
import { Form } from "react-router";

import type { GroupMember } from "./myGroups.server";

/** One managed group's direct members. A manual membership gets a Remove button that posts
 *  the group and the member; an IdP-synced one is read-only. */
export const GroupMemberTable = ({
  groupId,
  members,
}: {
  groupId: string;
  members: readonly GroupMember[];
}) =>
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
