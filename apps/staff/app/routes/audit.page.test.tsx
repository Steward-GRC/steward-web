// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import { createRoutesStub, useLoaderData } from "react-router";
import { describe, expect, it } from "vitest";

import Audit from "./audit";

type Props = Parameters<typeof Audit>[0];

const Page = () => {
  const data = useLoaderData();
  return <Audit {...({ loaderData: data } as unknown as Props)} />;
};

const show = (data: object) => {
  const Stub = createRoutesStub([{ Component: Page, loader: () => data, path: "/audit" }]);
  render(<Stub initialEntries={["/audit"]} />);
};

describe("Audit log (U26)", () => {
  it("lists each action with when, policy, title, action and who", async () => {
    show({
      records: [
        {
          action: "Policy published",
          actor: "Bob Author",
          id: "7",
          occurredAt: "2026-11-05T14:30:00Z",
          number: "POL-EXPENSES-000002",
          subjectLabel: "Expenses policy",
        },
      ],
    });
    expect(await screen.findByRole("heading", { level: 1, name: "Audit log" })).toBeInTheDocument();
    expect(
      screen.getByText("Every policy and approval action across your group."),
    ).toBeInTheDocument();
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows[0]?.textContent).toBe("WhenPolicyTitleActionBy");
    expect(rows[1]?.textContent).toContain("POL-EXPENSES-000002");
    expect(rows[1]?.textContent).toContain("Expenses policy");
    expect(rows[1]?.textContent).toContain("Policy published");
    expect(rows[1]?.textContent).toContain("Bob Author");
  });

  it("says when there is nothing yet", async () => {
    show({ records: [] });
    expect(await screen.findByText("No actions recorded yet")).toBeInTheDocument();
  });
});
