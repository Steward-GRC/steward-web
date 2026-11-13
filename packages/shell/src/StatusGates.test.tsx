// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The status gates as they draw (Gates G1, G2, G11, G12), and which one a page gets.
import { identityFromMe, NO_ACCESS } from "@steward-web/auth";
import { render, screen, waitFor } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import {
  AdminsOnlyGate,
  CheckingGate,
  InstanceGate,
  MaintenanceGate,
  NotSetUpGate,
  statusGateFor,
} from "./StatusGates";

const person = (roles: string[], permissions: string[]) =>
  identityFromMe({
    email: "erin@example.org",
    firstName: "Erin",
    id: "u-erin",
    lastName: "Reader",
    managedGroupIds: [],
    name: "Erin Reader",
    permissions,
    roles,
    username: "erin",
  });

const locked = {
  announcement: { enabled: false, level: "info", message: "" },
  maintenance: { enabled: true, message: "Back at 18:00." },
  workCalendar: { holidays: [], timezone: "UTC", weekdays: [1, 2, 3, 4, 5] },
};
const open = { ...locked, maintenance: { enabled: false, message: "" } };

describe("statusGateFor", () => {
  const erin = person([], ["policy.read"]);
  const alice = person(["site-admin"], []);

  it("locks the whole staff app during maintenance, site admins included", () => {
    expect(statusGateFor({ app: "staff", identity: erin, settings: locked })).toBe("maintenance");
    expect(statusGateFor({ app: "staff", identity: alice, settings: locked })).toBe("maintenance");
    expect(statusGateFor({ app: "staff", identity: NO_ACCESS, settings: locked })).toBe(
      "maintenance",
    );
    expect(statusGateFor({ app: "staff", identity: erin, settings: open })).toBeUndefined();
  });

  it("keeps the admin console open to site admins, and to sign-in, so they can lift it", () => {
    expect(statusGateFor({ app: "admin", identity: alice, settings: locked })).toBeUndefined();
    expect(statusGateFor({ app: "admin", identity: NO_ACCESS, settings: locked })).toBeUndefined();
    expect(statusGateFor({ app: "admin", identity: erin, settings: locked })).toBe("maintenance");
  });

  it("turns away someone signed in to the admin console without a way into it", () => {
    expect(statusGateFor({ app: "admin", identity: erin, settings: open })).toBe("adminsOnly");
    expect(statusGateFor({ app: "admin", identity: alice, settings: open })).toBeUndefined();
    expect(statusGateFor({ app: "admin", identity: NO_ACCESS, settings: open })).toBeUndefined();
    expect(statusGateFor({ app: "staff", identity: erin, settings: open })).toBeUndefined();
  });

  it("never locks anything when the settings can't be read", () => {
    expect(statusGateFor({ app: "staff", identity: erin, settings: null })).toBeUndefined();
  });
});

/** Renders a gate at `/` with the status resource route answering `status`. */
const withStatus = (gate: React.ReactNode, status: () => unknown) => {
  const Stub = createRoutesStub([
    { Component: () => gate, path: "/" },
    { loader: status, path: "/resources/status" },
    { Component: () => <p>Sign-in page</p>, path: "/sign-in" },
  ]);
  return render(<Stub initialEntries={["/"]} />);
};

const stillLocked = () => ({ instance: "ready", maintenance: true });

describe("G11: maintenance lockdown", () => {
  it("is a calm full page: the loading mark, the kicker, the heading and the message", async () => {
    withStatus(<MaintenanceGate message="Back at 18:00." />, stillLocked);
    expect(await screen.findByText("Maintenance")).toHaveClass("uppercase");
    expect(
      screen.getByRole("heading", { level: 1, name: "SYSTEM DOWN FOR SCHEDULED MAINTENANCE" }),
    ).toHaveClass("font-serif");
    expect(screen.getByText("Back at 18:00.")).toBeInTheDocument();
    expect(screen.getByText("This page will reconnect automatically.")).toBeInTheDocument();
    expect(screen.getByTestId("maintenance-gate")).toHaveClass("bg-background");
  });

  it("says the system is temporarily unavailable when the admin left no message", async () => {
    withStatus(<MaintenanceGate message="" />, stillLocked);
    expect(
      await screen.findByText("The system is temporarily unavailable for scheduled maintenance."),
    ).toBeInTheDocument();
  });

  it("offers site admins the admin portal, and no one else", async () => {
    const { unmount } = withStatus(<MaintenanceGate adminUrl="/admin" message="" />, stillLocked);
    expect(await screen.findByRole("link", { name: "Go to admin portal →" })).toHaveAttribute(
      "href",
      "/admin",
    );
    unmount();
    withStatus(<MaintenanceGate message="" />, stillLocked);
    await screen.findByText("Maintenance");
    expect(screen.queryByRole("link", { name: "Go to admin portal →" })).toBeNull();
  });

  it("reconnects by itself once maintenance is over", async () => {
    const onReconnect = vi.fn();
    let maintenance = true;
    withStatus(<MaintenanceGate checkEvery={20} message="" onReconnect={onReconnect} />, () => ({
      instance: "ready",
      maintenance,
    }));
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(onReconnect).not.toHaveBeenCalled();
    maintenance = false;
    await waitFor(() => expect(onReconnect).toHaveBeenCalledTimes(1));
  });
});

describe("G12: admins only", () => {
  it("names who is signed in and offers the way back to the staff home", () => {
    render(<AdminsOnlyGate name="Erin Reader" staffUrl="/" />);
    expect(screen.getByRole("heading", { name: "Admins only" })).toBeInTheDocument();
    expect(
      screen.getByText("The admin console is available to site, template, and compliance admins.", {
        exact: false,
      }),
    ).toHaveTextContent("You're signed in as Erin Reader.");
    expect(screen.getByText("Erin Reader")).toHaveClass("font-bold");
    expect(screen.getByRole("link", { name: "Go back to the staff home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

describe("G1 and G2: checking the instance, not set up yet", () => {
  it("G1 is only the looping mark, held back for its first 400 ms", () => {
    render(<CheckingGate />);
    expect(screen.getByRole("status")).toHaveTextContent("Checking this Steward…");
    expect(screen.getByTestId("gate-card")).toHaveClass("stw-appear-late");
  });

  it("G1 still names the page with a level-one heading, for screen readers", () => {
    render(<CheckingGate />);
    expect(screen.getByRole("heading", { level: 1, name: "Checking this Steward…" })).toHaveClass(
      "sr-only",
    );
  });

  it("G2 says the instance isn't ready, with no form", () => {
    render(<NotSetUpGate />);
    expect(screen.getByRole("heading", { name: "Not set up yet" })).toBeInTheDocument();
    expect(
      screen.getByText("This instance isn’t ready yet. Please check back later."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("switches to sign-in by itself once setup finishes", async () => {
    let instance = "needsSetup";
    withStatus(<InstanceGate checkEvery={20} instance="needsSetup" next="/" />, () => ({
      instance,
      maintenance: false,
    }));
    expect(await screen.findByRole("heading", { name: "Not set up yet" })).toBeInTheDocument();
    instance = "ready";
    expect(await screen.findByText("Sign-in page")).toBeInTheDocument();
  });

  it("checks again while the instance can't be reached, then says it isn't set up", async () => {
    let instance = "unknown";
    withStatus(<InstanceGate checkEvery={20} instance="unknown" next="/" />, () => ({
      instance,
      maintenance: false,
    }));
    expect(await screen.findByRole("status")).toBeInTheDocument();
    instance = "needsSetup";
    expect(await screen.findByRole("heading", { name: "Not set up yet" })).toBeInTheDocument();
  });
});
