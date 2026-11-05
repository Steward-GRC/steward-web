// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AiJobProgress } from "./AiJobProgress";

describe("AiJobProgress (U28)", () => {
  it("names the stage and the step, with a bar and the four steps", () => {
    render(<AiJobProgress stage="generating" />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Generating");
    expect(status).toHaveTextContent("step 3 of 4");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "70");
    const steps = screen.getAllByRole("listitem");
    expect(steps.map((step) => [step.textContent, step.dataset.state])).toEqual([
      ["Queued", "done"],
      ["Retrieving context", "done"],
      ["Generating", "current"],
      ["Finalizing", "pending"],
    ]);
  });

  it("says when it failed, why, and offers Try again", async () => {
    const retry = vi.fn();
    render(
      <AiJobProgress
        error="The AI model provider didn't respond."
        onRetry={retry}
        stage="failed"
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed · The AI model provider didn't respond.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalled();
  });

  it("has a compact one-line form", () => {
    render(<AiJobProgress compact stage="queued" />);
    expect(screen.getByRole("status")).toHaveTextContent("Queued · step 1 of 4");
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("reads Done when it's finished", () => {
    render(<AiJobProgress stage="done" />);
    expect(screen.getByRole("status")).toHaveTextContent("Done");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });
});
