// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, Link, Outlet } from "react-router";
import { describe, expect, it } from "vitest";

import { RoutePending } from "./RoutePending";

let release: () => void = () => {};

describe("route-level pending (6-states.s1)", () => {
  it("shows the skeleton with its screen-reader text while the next page loads", async () => {
    const Stub = createRoutesStub([
      {
        children: [
          { Component: () => <Link to="/slow">Go</Link>, path: "/" },
          {
            Component: () => <p>Slow page</p>,
            loader: () =>
              new Promise<null>((resolve) => {
                release = () => resolve(null);
              }),
            path: "/slow",
          },
        ],
        Component: () => (
          <RoutePending delay={0}>
            <Outlet />
          </RoutePending>
        ),
      },
    ]);
    render(<Stub initialEntries={["/"]} />);
    await userEvent.click(screen.getByRole("link", { name: "Go" }));
    const skeleton = await screen.findByRole("status");
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(skeleton).toHaveTextContent("Loading…");
    release();
    expect(await screen.findByText("Slow page")).toBeInTheDocument();
    expect(screen.queryByRole("status")).toBeNull();
  });
});
