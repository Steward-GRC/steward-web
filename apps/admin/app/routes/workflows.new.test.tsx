// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import NewWorkflow from "./workflows.new";

type NewProps = Parameters<typeof NewWorkflow>[0];

describe("New workflow (A9)", () => {
  it("asks for a name and a description, then creates the workflow", async () => {
    const posted: FormData[] = [];
    const Stub = createRoutesStub([
      {
        action: async ({ request }) => {
          posted.push(await request.formData());
          return null;
        },
        Component: () => <NewWorkflow {...({ actionData: undefined } as unknown as NewProps)} />,
        path: "/workflows/new",
      },
    ]);
    render(<Stub initialEntries={["/workflows/new"]} />);
    const form = await screen.findByRole("form", { name: "New workflow" });
    await userEvent.type(within(form).getByLabelText("Name"), "Travel sign-off");
    await userEvent.click(within(form).getByRole("button", { name: "Create workflow" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]!.get("name")).toBe("Travel sign-off");
  });
});
