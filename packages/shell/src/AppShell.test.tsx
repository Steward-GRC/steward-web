// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders its header and the page content, with no diagnostics provider of its own", () => {
    // AppShell no longer wraps DiagnosticsSlotProvider (DiagnosticsProvider does, mounted in
    // each app's root Layout instead, so the slot renders nothing without one here).
    render(
      <AppShell>
        <p>page content</p>
      </AppShell>,
    );
    expect(screen.getByText("page content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "About and diagnostics" })).toBeInTheDocument();
  });

  it("opens the About and diagnostics dialog from the account menu", async () => {
    render(
      <MemoryRouter>
        <AppShell>
          <p>page content</p>
        </AppShell>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: "About and diagnostics" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "About and diagnostics" }));

    expect(await screen.findByRole("heading", { name: "About Steward" })).toBeInTheDocument();
  });
});
