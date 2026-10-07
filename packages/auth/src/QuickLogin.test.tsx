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
  it("lists the accounts the server sent and posts the dev quick-login intent", async () => {
    renderPicker([
      { label: "Staff (sample)", note: "no second factor", username: "staff.sample" },
      { label: "approver.sample", username: "approver.sample" },
    ]);

    expect(
      await screen.findByRole("option", { name: "Staff (sample) (no second factor)" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "approver.sample" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in as this account" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("dev-quick-login")).toHaveAttribute("name", "intent");
  });

  it("renders nothing until the server lists accounts", () => {
    renderPicker([]);
    expect(
      screen.queryByRole("button", { name: "Sign in as this account" }),
    ).not.toBeInTheDocument();
  });
});
