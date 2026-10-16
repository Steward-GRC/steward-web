// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { QuickLogin } from "./QuickLogin";

const renderPicker = (users: Parameters<typeof QuickLogin>[0]["users"]) => {
  const Stub = createRoutesStub([
    { Component: () => <QuickLogin next="/policies" users={users} />, path: "/sign-in" },
  ]);
  return render(<Stub initialEntries={["/sign-in"]} />);
};

describe("QuickLogin", () => {
  it("shows the dev-login banner and one button per seeded account, each a single-click sign-in", async () => {
    renderPicker([
      { label: "Staff (sample)", note: "no second factor", username: "staff.sample" },
      { label: "approver.sample", username: "approver.sample" },
    ]);

    expect(await screen.findByText("Dev login, test users only")).toBeInTheDocument();
    const staffButton = screen.getByRole("button", { name: "Staff (sample)" });
    expect(staffButton).toHaveAttribute("name", "username");
    expect(staffButton).toHaveAttribute("value", "staff.sample");
    expect(screen.getByRole("button", { name: "approver.sample" })).toHaveAttribute(
      "value",
      "approver.sample",
    );
    expect(screen.getByDisplayValue("dev-quick-login")).toHaveAttribute("name", "intent");
  });

  it("renders nothing until the server lists accounts", () => {
    renderPicker([]);
    expect(screen.queryByText("Dev login, test users only")).not.toBeInTheDocument();
  });
});
