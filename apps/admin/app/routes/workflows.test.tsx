// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import Workflows from "./workflows";

const stage = (approvers: string[]) => ({
  approvers,
  approversByCategory: [],
  groupUnits: [],
  id: `s-${approvers.join("-")}`,
  name: "Review",
  pinnedLast: false,
  quorum: "one",
  rejectOnSlaBreach: false,
  slaDays: null,
});

const SITES = [
  {
    name: "Finance",
    workflows: [
      {
        disabledApprover: true,
        id: "w-finance",
        name: "Finance sign-off",
        stages: [stage(["u-dave"]), stage(["u-carol"])],
        usedBy: 2,
      },
    ],
  },
  {
    name: null,
    workflows: [
      { disabledApprover: false, id: "w-legacy", name: "Legacy", stages: [stage([])], usedBy: 0 },
    ],
  },
];

type WorkflowsProps = Parameters<typeof Workflows>[0];

const openWorkflows = (sites: object[] = SITES) => {
  const Stub = createRoutesStub([
    {
      Component: () => <Workflows {...({ loaderData: { sites } } as unknown as WorkflowsProps)} />,
      path: "/workflows",
    },
  ]);
  render(<Stub initialEntries={["/workflows"]} />);
};

describe("Workflows (A8)", () => {
  it("groups the workflows by site as cards", async () => {
    openWorkflows();
    expect(await screen.findByRole("heading", { level: 1, name: "Workflows" })).toBeInTheDocument();
    expect(screen.getByText("Approval workflows for policy review.")).toBeInTheDocument();

    const finance = screen.getByRole("region", { name: "Finance" });
    const card = within(finance).getByRole("link", { name: /Finance sign-off/ });
    expect(card).toHaveAttribute("href", "/workflows/w-finance");
    expect(within(card).getByText("2 stages · used by 2 groups")).toBeInTheDocument();
    expect(within(card).getByText("Disabled approver — needs replacement")).toBeInTheDocument();

    const unused = screen.getByRole("region", { name: "Not in use" });
    const legacy = within(unused).getByRole("link", { name: /Legacy/ });
    expect(within(legacy).getByText("Draft")).toBeInTheDocument();
    expect(within(legacy).getByText("1 stage · used by 0 groups")).toBeInTheDocument();
  });

  it("says when there are no workflows", async () => {
    openWorkflows([]);
    expect(await screen.findByText("No workflows yet")).toBeInTheDocument();
  });
});
