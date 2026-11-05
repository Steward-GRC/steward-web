// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { AckSnapshot, StatCard } from "./StatCards";

describe("the admin stat cards (A1)", () => {
  it("is a link with its label, a chevron and the number", () => {
    const Stub = createRoutesStub([
      {
        Component: () => <StatCard label="Published" to="/policies?status=published" value={9} />,
        path: "/",
      },
    ]);
    render(<Stub />);
    const card = screen.getByRole("link", { name: /^Published/ });
    expect(card).toHaveAttribute("href", "/policies?status=published");
    expect(card).toHaveTextContent("Published9");
  });
});

describe("the acknowledgement snapshot (A1)", () => {
  it("shows acknowledged of the audience, the bar and the percentage", () => {
    render(<AckSnapshot acknowledged={184} audience={214} />);
    expect(screen.getByRole("heading", { name: "Acknowledgement snapshot" })).toBeInTheDocument();
    expect(screen.getByText("184 of 214")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "86");
    expect(screen.getByText("184 of 214 acknowledged · 86%")).toBeInTheDocument();
  });

  it("reads 0% with nobody to acknowledge", () => {
    render(<AckSnapshot acknowledged={0} audience={0} />);
    expect(screen.getByText("0 of 0 acknowledged · 0%")).toBeInTheDocument();
  });
});
