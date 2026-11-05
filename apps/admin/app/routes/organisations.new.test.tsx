// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import NewOrganization from "./organisations.new";

type NewProps = Parameters<typeof NewOrganization>[0];

describe("Organization setup, step 1 (A24)", () => {
  it("opens the four-step wizard on Details, with the gates still locked", async () => {
    const Stub = createRoutesStub([
      {
        Component: () => (
          <NewOrganization {...({ actionData: undefined } as unknown as NewProps)} />
        ),
        path: "/organisations/new",
      },
    ]);
    render(<Stub initialEntries={["/organisations/new"]} />);
    expect(
      await screen.findByRole("heading", { level: 1, name: "New organization" }),
    ).toBeInTheDocument();
    const steps = screen.getByRole("list", { name: "Setup steps" });
    expect(within(steps).getByRole("button", { name: "1 Details" })).toHaveAttribute(
      "aria-current",
      "step",
    );
    for (const step of ["2 Domain verification", "3 IdP test", "4 Activate"]) {
      expect(within(steps).getByRole("button", { name: step })).toBeDisabled();
    }
    const form = screen.getByRole("form", { name: "Details" });
    expect(within(form).getByLabelText("Organization name")).toBeRequired();
    expect(within(form).getByRole("button", { name: "Add organization" })).toBeInTheDocument();
  });
});
