// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDateTime } from "@steward-web/i18n";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, data } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RouteErrorBoundary } from "./RouteErrorBoundary";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const renderThrowing = (path: string, thrown: () => never) => {
  const Stub = createRoutesStub([
    {
      Component: () => null,
      ErrorBoundary: RouteErrorBoundary,
      loader: () => thrown(),
      path: "/policies/:number",
    },
    {
      Component: () => null,
      ErrorBoundary: RouteErrorBoundary,
      loader: () => thrown(),
      path: "*",
    },
  ]);
  render(<Stub initialEntries={[path]} />);
};

describe("not found (6-states.s3)", () => {
  it("says an unknown page isn't there, not that something went wrong (#30)", async () => {
    renderThrowing("/nowhere", () => {
      throw new Response("Not Found", { status: 404 });
    });
    expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByText("There's nothing at /nowhere.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← Back to the home page" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.queryByText(/Something went wrong/)).toBeNull();
  });

  it("names the policy number that matched nothing", async () => {
    renderThrowing("/policies/POL-FACILITIES-000099", () => {
      throw data({ kind: "policy", number: "POL-FACILITIES-000099" }, { status: 404 });
    });
    expect(await screen.findByRole("heading", { name: "Policy not found" })).toBeInTheDocument();
    expect(screen.getByText("No policy matches POL-FACILITIES-000099.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← Back to policies" })).toHaveAttribute(
      "href",
      "/policies",
    );
  });

  it("names a procedure that matched nothing", async () => {
    renderThrowing("/policies/PRC-X", () => {
      throw data({ kind: "procedure", number: "PRC-X" }, { status: 404 });
    });
    expect(await screen.findByText("No procedure matches PRC-X.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← Back to procedures" })).toHaveAttribute(
      "href",
      "/procedures",
    );
  });
});

describe("the page error (G17)", () => {
  it("shows the designed copy, the error report and the three actions", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn() },
      userAgent: "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0",
    });
    renderThrowing("/policies/POL-1", () => {
      throw Object.assign(new Error("boom"), { requestId: "4821" });
    });
    expect(
      await screen.findByRole("heading", { name: "Something went wrong on this page" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The page hit an unexpected error and couldn't render…"),
    ).toBeInTheDocument();
    const report = screen.getByRole("region", { name: "Error report" });
    expect(within(report).getByText("Reference 4821 · /policies/POL-1")).toBeInTheDocument();
    expect(within(report).getByText(/^Steward \S+ · Firefox · /)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy for support" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to policies" })).toHaveAttribute(
      "href",
      "/policies",
    );
  });

  it("says Copied in the report once copied for support", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    vi.stubGlobal("navigator", { clipboard: { writeText }, userAgent: "test-agent" });
    renderThrowing("/policies/POL-1", () => {
      throw new Error("boom");
    });
    await userEvent.click(await screen.findByRole("button", { name: "Copy for support" }));
    const report = screen.getByRole("region", { name: "Error report" });
    expect(await within(report).findByText("Copied")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledOnce();
  });

  it("writes the report's time with the locale formatter", async () => {
    vi.useFakeTimers({ now: new Date("2026-10-02T14:22:00Z"), shouldAdvanceTime: true });
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn() }, userAgent: "test-agent" });
    renderThrowing("/policies/POL-1", () => {
      throw new Error("boom");
    });
    const report = await screen.findByRole("region", { name: "Error report" });
    expect(report).toHaveTextContent(formatDateTime("2026-10-02T14:22:00Z"));
  });
});

describe("a missing role (bug log 59)", () => {
  it("says which role is needed instead of leaving the person guessing", async () => {
    renderThrowing("/drafts/new/policy", () => {
      throw data({ needs: "author" }, { status: 403 });
    });
    expect(
      await screen.findByRole("heading", { name: "You need the author role" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Creating and editing policies is for authors/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← Back to the home page" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
