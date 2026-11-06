// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { initialsOf, Table, Tabs, TabsList, TabsTrigger } from "./Display";

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

describe("TabsList", () => {
  it("sits on the white surface background", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Record">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByRole("tablist")).toHaveClass("bg-surface");
  });
});
