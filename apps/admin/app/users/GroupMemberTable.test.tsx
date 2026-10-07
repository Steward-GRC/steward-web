// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { GroupMemberTable } from "./GroupMemberTable";

const members = [
  { email: "grace@example.com", name: "Grace", source: "manual", userId: "u-grace" },
  { email: "margaret@example.com", name: "Margaret", source: "idp-sync", userId: "u-margaret" },
];

describe("GroupMemberTable", () => {
  it("sends the group, the member and the intent when Remove is pressed", async () => {
    const posted = vi.fn<(form: FormData) => void>();
    const Stub = createRoutesStub([
      {
        action: async ({ request }) => {
          posted(await request.formData());
          return null;
        },
        Component: () => <GroupMemberTable groupId="g-2" members={members} />,
        path: "/",
      },
    ]);
    render(<Stub />);

    await userEvent.click(screen.getByRole("button", { name: "Remove" }));

    await vi.waitFor(() => expect(posted).toHaveBeenCalledOnce());
    const form = posted.mock.calls[0]?.[0];
    expect(form?.get("intent")).toBe("remove-member");
    expect(form?.get("groupId")).toBe("g-2");
    expect(form?.get("userId")).toBe("u-grace");
  });

  it("shows a synced membership as read-only", () => {
    const Stub = createRoutesStub([
      { Component: () => <GroupMemberTable groupId="g-2" members={members} />, path: "/" },
    ]);
    render(<Stub />);
    expect(screen.getByText("Synced")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(1);
  });

  it("says so when the group has no members", () => {
    const Stub = createRoutesStub([
      { Component: () => <GroupMemberTable groupId="g-2" members={[]} />, path: "/" },
    ]);
    render(<Stub />);
    expect(screen.getByText("No members yet. Add one below.")).toBeInTheDocument();
  });
});
