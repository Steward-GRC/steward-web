// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import MergeAccounts from "./users.merge";

const loaderData = {
  preview: {
    counts: {
      acknowledgmentsDeduped: 0,
      acknowledgmentsMoved: 2,
      policiesOwned: 1,
      preferences: 0,
      raciGrants: 0,
      workflowItems: 0,
    },
    items: [],
    requiresPrivilegedConfirm: false,
    sourceUserId: "u-old",
    targetUserId: "u-erin",
    warnings: [],
  },
  previewError: undefined,
  sourceUserId: "u-old",
  targetUserId: "u-erin",
  users: [
    { email: "erin.old@example.org", name: "Erin (old)", userId: "u-old" },
    { email: "erin@example.org", name: "Erin", userId: "u-erin" },
  ],
};

type MergeProps = Parameters<typeof MergeAccounts>[0];

const renderMerge = (action: (form: FormData) => void, data: object = loaderData) => {
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        action(await request.formData());
        return { ok: true };
      },
      Component: () => <MergeAccounts {...({ loaderData: data } as unknown as MergeProps)} />,
      path: "/users/merge",
    },
  ]);
  render(<Stub initialEntries={["/users/merge"]} />);
};

describe("the merge confirm (D21)", () => {
  it("shows both accounts and asks for the source email before merging", async () => {
    const action = vi.fn();
    renderMerge(action);
    await userEvent.click(screen.getByRole("button", { name: "Merge accounts" }));

    const dialog = screen.getByRole("dialog", { name: "Merge these accounts?" });
    expect(dialog).toHaveAttribute("data-tone", "danger");
    expect(within(dialog).getByText("Source — closed after merge")).toBeInTheDocument();
    expect(within(dialog).getByText("Erin (old)")).toBeInTheDocument();
    expect(within(dialog).getByText("Target — keeps the records")).toBeInTheDocument();
    expect(within(dialog).getByText("erin@example.org")).toBeInTheDocument();

    const merge = within(dialog).getByRole("button", { name: "Merge accounts" });
    expect(merge).toBeDisabled();
    await userEvent.type(
      within(dialog).getByLabelText("Type erin.old@example.org to confirm"),
      "erin.old@example.org",
    );
    expect(merge).toBeEnabled();
    await userEvent.click(merge);
    await vi.waitFor(() => expect(action).toHaveBeenCalledOnce());
    expect(action.mock.calls[0]![0].get("sourceUserId")).toBe("u-old");
    expect(action.mock.calls[0]![0].get("targetUserId")).toBe("u-erin");
  });
});

describe("Merge accounts (A21)", () => {
  it("has the frame's title, subtitle and red irreversibility note", () => {
    renderMerge(vi.fn());
    expect(screen.getByRole("heading", { level: 1, name: "Merge accounts" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Move one user's policies, acknowledgments, and grants onto another, then close the source account.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This can't be undone. The source account is closed after the merge."),
    ).toBeInTheDocument();
  });

  it("puts the source and the target on one line and shows the six counts", () => {
    renderMerge(vi.fn());
    expect(screen.getByRole("combobox", { name: "Source (closed after merge)" })).toHaveTextContent(
      "Erin (old) · erin.old@example.org",
    );
    expect(screen.getByRole("combobox", { name: "Target (keeps the records)" })).toHaveTextContent(
      "Erin · erin@example.org",
    );
    const counts = screen.getByRole("list", { name: "What moves" });
    expect(
      within(counts)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual([
      "1Policies owned",
      "0RACI grants",
      "2Acks moved",
      "0Acks deduped",
      "0Workflow items",
      "0Preferences",
    ]);
  });

  it("keeps Merge accounts off until a preview has run", () => {
    renderMerge(vi.fn(), { ...loaderData, preview: undefined });
    expect(screen.getByRole("button", { name: "Preview merge" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Merge accounts" })).toBeDisabled();
  });
});
