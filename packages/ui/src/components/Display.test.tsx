// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card, CardBody, CardHeader, initialsOf, Table } from "./Display";

describe("initialsOf", () => {
  it("takes the first and last name's first letters", () => {
    expect(initialsOf("Erin Example")).toBe("EE");
    expect(initialsOf("  carol   de la Cruz ")).toBe("CC");
  });

  it("copes with one word and with nothing", () => {
    expect(initialsOf("alice")).toBe("A");
    expect(initialsOf(" ".repeat(3))).toBe("?");
  });
});

describe("Table", () => {
  it("keeps what's positioned inside it (an sr-only label) within its own scroll box", () => {
    render(
      <Table>
        <tbody>
          <tr>
            <td>
              <span className="sr-only">Actions</span>
            </td>
          </tr>
        </tbody>
      </Table>,
    );
    // A positioned ancestor stops an off-screen sr-only span from widening the page on a phone.
    // eslint-disable-next-line testing-library/no-node-access -- the scroll wrapper has no role of its own
    expect(screen.getByRole("table").parentElement).toHaveClass("relative", "overflow-x-auto");
  });
});

describe("Card", () => {
  it("draws the one card edge: a border, rounded corners, the surface and clipped contents", () => {
    render(<Card data-testid="card">Body</Card>);
    expect(screen.getByTestId("card")).toHaveClass(
      "overflow-hidden",
      "rounded-lg",
      "border",
      "border-border",
      "bg-surface",
    );
  });

  it("names itself from its title and puts the title and aside on the band", () => {
    render(
      <Card aside={<span>Updated just now</span>} title="Library overview">
        <CardBody>Counts</CardBody>
      </Card>,
    );
    const card = screen.getByRole("region", { name: "Library overview" });
    const band = screen.getByTestId("card-band");
    expect(card).toContainElement(band);
    expect(band).toHaveClass("bg-sunken", "border-b", "border-border-strong");
    expect(band).toHaveTextContent("Library overview");
    expect(band).toHaveTextContent("Updated just now");
  });

  it("has no region of its own without a title", () => {
    render(<Card>Plain</Card>);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("gives a CardHeader the same band", () => {
    render(<CardHeader>Heading</CardHeader>);
    expect(screen.getByText("Heading")).toHaveClass("bg-sunken", "border-border-strong");
  });
});
