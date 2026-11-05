// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { NotFound, PageSkeleton } from "./States";

describe("not found (U7s)", () => {
  it("names what's missing, says why, and offers the way back", () => {
    const Stub = createRoutesStub([
      {
        Component: () => (
          <NotFound
            back={{ label: "Back to policies", to: "/policies" }}
            description="No policy matches POL-FACILITIES-000099."
            title="Policy not found"
          />
        ),
        path: "/",
      },
    ]);
    render(<Stub />);
    expect(screen.getByRole("heading", { name: "Policy not found" })).toBeInTheDocument();
    expect(screen.getByText("No policy matches POL-FACILITIES-000099.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← Back to policies" })).toHaveAttribute(
      "href",
      "/policies",
    );
  });
});

describe("skeleton loading", () => {
  it("is busy and tells a screen reader what's loading", () => {
    render(<PageSkeleton label="Loading policy…" />);
    const skeleton = screen.getByRole("status");
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(skeleton).toHaveTextContent("Loading policy…");
  });
});
