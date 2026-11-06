// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CopyId } from "./CopyId";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CopyId", () => {
  it("shows the record ID with a button beside it that copies just the ID", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue();
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<CopyId id="PRC-CONDUCT-000001" />);
    expect(screen.getByText("PRC-CONDUCT-000001")).toHaveClass("font-mono");
    await userEvent.click(screen.getByRole("button", { name: "Copy PRC-CONDUCT-000001" }));
    expect(writeText).toHaveBeenCalledWith("PRC-CONDUCT-000001");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Copied PRC-CONDUCT-000001" })).toBeVisible(),
    );
  });

  it("can show more than the ID while copying only the ID", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue();
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<CopyId id="POL-EXPENSES-000002">POL-EXPENSES-000002 · v3</CopyId>);
    expect(screen.getByText("POL-EXPENSES-000002 · v3")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Copy POL-EXPENSES-000002" }));
    expect(writeText).toHaveBeenCalledWith("POL-EXPENSES-000002");
  });
});
