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

const renderMerge = (action: (form: FormData) => void) => {
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        action(await request.formData());
        return { ok: true };
      },
      Component: () => <MergeAccounts {...({ loaderData } as unknown as MergeProps)} />,
      path: "/users/merge",
    },
  ]);
  render(<Stub initialEntries={["/users/merge"]} />);
};

describe("the merge confirm (D21)", () => {
  it("shows both accounts and asks for the source email before merging", async () => {
    const action = vi.fn();
    renderMerge(action);
    await userEvent.click(screen.getByRole("button", { name: "Merge accounts…" }));

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
