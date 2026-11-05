// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { DecisionPanel } from "./DecisionPanel";

const renderPanel = (
  action: (form: FormData) => void = () => {},
  props: Partial<Parameters<typeof DecisionPanel>[0]> = {},
) => {
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        action(await request.formData());
        return null;
      },
      Component: () => (
        <DecisionPanel
          note="One more approval publishes this as v3.0.0 (Major). Bob is notified either way."
          {...props}
        >
          <input name="taskId" type="hidden" value="task-1" />
        </DecisionPanel>
      ),
      path: "/",
    },
  ]);
  render(<Stub />);
};

describe("the decision panel (U25)", () => {
  it("has the designed heading, note, comment hint and footnote", () => {
    renderPanel();
    const panel = screen.getByRole("region", { name: "Your decision" });
    expect(
      within(panel).getByText(
        "One more approval publishes this as v3.0.0 (Major). Bob is notified either way.",
      ),
    ).toBeInTheDocument();
    expect(within(panel).getByLabelText("Decision comment")).toHaveAccessibleDescription(
      "Required to approve or reject…",
    );
    expect(
      within(panel).getByText("Your decision and comment are recorded against your name."),
    ).toBeInTheDocument();
  });

  it("puts Reject before Approve, both disabled until there's a comment", async () => {
    renderPanel();
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["Reject", "Approve"]);
    for (const button of buttons) expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Decision comment"), " ".repeat(3));
    for (const button of buttons) expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Decision comment"), "Clear and fair.");
    for (const button of buttons) expect(button).toBeEnabled();
  });

  it("submits the decision with the comment and the caller's fields", async () => {
    const action = vi.fn();
    renderPanel(action);
    await userEvent.type(screen.getByLabelText("Decision comment"), "Clear and fair.");
    await userEvent.click(screen.getByRole("button", { name: "Approve" }));
    await vi.waitFor(() => expect(action).toHaveBeenCalledOnce());
    const form = action.mock.calls[0]![0] as FormData;
    expect(form.get("intent")).toBe("approve");
    expect(form.get("comment")).toBe("Clear and fair.");
    expect(form.get("taskId")).toBe("task-1");
  });

  it("shows a refusal as an alert", () => {
    renderPanel(undefined, { error: "This approval is no longer active; refresh your inbox." });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This approval is no longer active; refresh your inbox.",
    );
  });

  it("keeps both buttons off while the decision is sending", async () => {
    renderPanel(undefined, { busy: true });
    await userEvent.type(screen.getByLabelText("Decision comment"), "Clear and fair.");
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });
});
