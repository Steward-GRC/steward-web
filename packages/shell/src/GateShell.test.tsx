// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { createRoutesStub, Outlet } from "react-router";
import { describe, expect, it } from "vitest";

import { GATE_HANDLE, GateShell, useIsGate } from "./GateShell";

describe("GateShell", () => {
  it("frames a gate with no header, navigation or footer, keeping the accessibility button", () => {
    render(
      <GateShell banners={null} environment={null}>
        <p>card</p>
      </GateShell>,
    );
    expect(screen.getByRole("main")).toHaveTextContent("card");
    expect(screen.queryByRole("banner")).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryByRole("contentinfo")).toBeNull();
    expect(screen.getByRole("button", { name: "Accessibility options" })).toBeInTheDocument();
  });

  it("puts the dev login bar across the very top, above the environment banner", () => {
    render(
      <GateShell devLogin={<div data-testid="dev-login-bar">Dev login</div>} environment="test">
        <p>card</p>
      </GateShell>,
    );
    const bar = screen.getByTestId("dev-login-bar");
    const env = screen.getByTestId("environment-banner");
    expect(bar.compareDocumentPosition(env) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("main")).not.toContainElement(bar);
  });

  it("still names a non-production install and shows the announcement", () => {
    render(
      <GateShell
        banners={{
          announcement: {
            enabled: true,
            level: "info",
            message: "Policies move to the new library on Monday.",
          },
          maintenance: { enabled: false, message: "" },
          workCalendar: { holidays: [], timezone: "UTC", weekdays: [1, 2, 3, 4, 5] },
        }}
        environment="test"
      >
        <p>card</p>
      </GateShell>,
    );
    expect(screen.getByTestId("environment-banner")).toHaveTextContent("Test environment");
    expect(screen.getByText("Policies move to the new library on Monday.")).toBeInTheDocument();
  });
});

const Probe = () => <p>{useIsGate() ? "gate" : "app"}</p>;
const Root = () => (
  <>
    <Probe />
    <Outlet />
  </>
);

describe("useIsGate", () => {
  it("is true on a route that declares itself a gate, and false elsewhere", async () => {
    const Stub = createRoutesStub([
      {
        children: [
          { Component: () => null, handle: GATE_HANDLE, path: "sign-in" },
          { Component: () => null, path: "policies" },
        ],
        Component: Root,
        path: "/",
      },
    ]);
    const { unmount } = render(<Stub initialEntries={["/sign-in"]} />);
    expect(await screen.findByText("gate")).toBeInTheDocument();
    unmount();
    render(<Stub initialEntries={["/policies"]} />);
    expect(await screen.findByText("app")).toBeInTheDocument();
  });
});
