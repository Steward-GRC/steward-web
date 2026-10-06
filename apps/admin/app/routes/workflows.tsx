// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Badge, Button, EmptyState, PageHeader, Table, TD, TH, THead } from "@steward-web/ui";
import { Link } from "react-router";

import type { Route } from "./+types/workflows";

import { notUsable } from "../workflows/workflowRules";
import { listWorkflowDefs } from "../workflows/workflows.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const workflows = await listWorkflowDefs(request);
  return { workflows };
};

export default function Workflows({ loaderData }: Route.ComponentProps) {
  const { workflows } = loaderData;

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        actions={
          <Button asChild size="sm">
            <Link to="/workflows/new">New workflow</Link>
          </Button>
        }
        eyebrow="Structure"
        subtitle="Approval chains a group can select as its default."
        title="Workflows"
      />

      {workflows.length === 0 ? (
        <EmptyState
          action={
            <Button asChild size="sm">
              <Link to="/workflows/new">New workflow</Link>
            </Button>
          }
          description="Create the first workflow to start building approval chains."
          title="No workflows yet"
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Workflow</TH>
              <TH>Stages</TH>
              <TH>Status</TH>
            </tr>
          </THead>
          <tbody>
            {workflows.map((workflow) => (
              <tr key={workflow.id}>
                <TD>
                  <Link
                    className="font-medium text-primary hover:underline"
                    to={`/workflows/${workflow.id}`}
                  >
                    {workflow.name}
                  </Link>
                </TD>
                <TD>
                  <Badge tone="neutral">{workflow.stages.length}</Badge>
                </TD>
                <TD>
                  {notUsable(workflow) ? (
                    <Badge tone="warn">Incomplete</Badge>
                  ) : (
                    <Badge tone="ok">Usable</Badge>
                  )}
                </TD>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
