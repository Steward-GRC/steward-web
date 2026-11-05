// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ActingAsBanner, ConnectionLostBanner, SecondFactorNudge } from "./ShellBanners";

const NOW = new Date("2026-10-02T10:00:00Z");

beforeEach(() => vi.useFakeTimers({ now: NOW, shouldAdvanceTime: true }));
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
});

const inRouter = (node: React.ReactNode, action = vi.fn()) => {
  const Stub = createRoutesStub([
    { Component: () => node, path: "/" },
    {
      action: async ({ request }) => {
        action(Object.fromEntries(await request.formData()));
        return null;
      },
      path: "/resources/impersonation",
    },
    { Component: () => <p>security page</p>, path: "/profile/security" },
  ]);
  render(<Stub initialEntries={["/"]} />);
  return action;
};

const session = {
  expiresAt: new Date(NOW.getTime() + 24 * 60_000).toISOString(),
  targetName: "Erin",
};

describe("acting as a user (H9)", () => {
  it("says who you're acting as, the time left, and that it's audited", () => {
    inRouter(<ActingAsBanner session={session} />);
    const banner = screen.getByRole("region", { name: "Acting as Erin" });
    expect(banner).toHaveTextContent("You are acting as Erin");
    expect(banner).toHaveTextContent("· 24 min left · actions are audited under your own account");
  });

  it("counts down", () => {
    inRouter(<ActingAsBanner session={session} />);
    act(() => vi.advanceTimersByTime(4 * 60_000));
    expect(screen.getByRole("region", { name: "Acting as Erin" })).toHaveTextContent(
      "· 20 min left",
    );
  });

  it("stops acting as the user", async () => {
    const action = inRouter(<ActingAsBanner session={session} />);
    await userEvent.click(screen.getByRole("button", { name: "Stop" }));
    await vi.waitFor(() => expect(action).toHaveBeenCalledWith({ intent: "stop" }));
  });

  it("can't be dismissed", () => {
    inRouter(<ActingAsBanner session={session} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});

describe("connection lost (H7)", () => {
  it("says it's reconnecting while the browser is offline, and clears by itself", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
    inRouter(<ConnectionLostBanner />);
    expect(screen.queryByText("Can't reach the server — reconnecting…")).toBeNull();
    act(() => {
      globalThis.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByRole("status")).toHaveTextContent("Can't reach the server — reconnecting…");
    act(() => {
      globalThis.dispatchEvent(new Event("online"));
    });
    await vi.waitFor(() =>
      expect(screen.queryByText("Can't reach the server — reconnecting…")).toBeNull(),
    );
  });

  it("notices when the server stops answering", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    inRouter(<ConnectionLostBanner checkEvery={1000} />);
    act(() => vi.advanceTimersByTime(1000));
    expect(await screen.findByText("Can't reach the server — reconnecting…")).toBeInTheDocument();
  });
});

describe("the second-factor nudge (H8)", () => {
  it("suggests a stronger second factor and links to set one up", async () => {
    inRouter(<SecondFactorNudge setUpUrl="/profile/security" />);
    expect(
      screen.getByText(
        "Add an authenticator app or passkey for stronger sign-in — email codes still work.",
      ),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Set up" }));
    expect(await screen.findByText("security page")).toBeInTheDocument();
  });

  it("hides for 24 hours once dismissed", async () => {
    inRouter(<SecondFactorNudge setUpUrl="/profile/security" />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss for 24 hours" }));
    expect(screen.queryByText(/stronger sign-in/)).toBeNull();
  });

  it("stays hidden within the day it was dismissed, and comes back after", () => {
    localStorage.setItem("steward.secondFactorNudge.dismissedAt", String(NOW.getTime() - 60_000));
    inRouter(<SecondFactorNudge setUpUrl="/profile/security" />);
    expect(screen.queryByText(/stronger sign-in/)).toBeNull();
  });

  it("comes back after 24 hours", () => {
    localStorage.setItem(
      "steward.secondFactorNudge.dismissedAt",
      String(NOW.getTime() - 25 * 60 * 60_000),
    );
    inRouter(<SecondFactorNudge setUpUrl="/profile/security" />);
    expect(screen.getByText(/stronger sign-in/)).toBeInTheDocument();
  });
});
