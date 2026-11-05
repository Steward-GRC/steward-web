// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import MagicLinks from "./magic-links";

type MagicLinksProps = Parameters<typeof MagicLinks>[0];

const openMagicLinks = (links: null | object[]) => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <MagicLinks {...({ loaderData: { links } } as unknown as MagicLinksProps)} />
      ),
      path: "/magic-links",
    },
  ]);
  render(<Stub initialEntries={["/magic-links"]} />);
};

describe("Magic links (A12)", () => {
  it("has the frame's title and subtitle, and says the list isn't available yet", async () => {
    openMagicLinks(null);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Magic links" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Every read-only share link issued across the org."),
    ).toBeInTheDocument();
    expect(screen.getByText("The list isn't available yet")).toBeInTheDocument();
  });

  it("shows the table once the gateway lists the links", async () => {
    openMagicLinks([
      {
        createdAt: "2026-10-02T12:00:00Z",
        createdBy: "Bob",
        id: "l-1",
        policyTitle: "Desk Booking Policy",
        status: "active",
        url: "https://policies.example.org/s/7c1e04b2",
        version: "v1.0.0",
      },
    ]);
    expect(await screen.findByText("Desk Booking Policy")).toBeInTheDocument();
    expect(screen.queryByText("The list isn't available yet")).not.toBeInTheDocument();
  });
});
