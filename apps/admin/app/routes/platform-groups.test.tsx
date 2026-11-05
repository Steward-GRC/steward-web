// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { asPhone } from "../test/phone";
import PlatformGroups from "./platform-groups";

const GROUPS = [
  {
    id: "pg-privacy",
    members: [
      { email: "dave@example.org", name: "Dave", source: "manual", userId: "u-dave" },
      { email: "erin@example.org", name: "Erin", source: "idp-sync", userId: "u-erin" },
    ],
    name: "Privacy Officers",
    parentId: null,
    path: "Privacy Officers",
  },
];

type Props = Parameters<typeof PlatformGroups>[0];

const openGroups = () => {
  const posted: Record<string, string>[] = [];
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const body = await request.formData();
        posted.push(Object.fromEntries([...body.entries()].map(([k, v]) => [k, String(v)])));
        return { groupId: String(body.get("groupId")), ok: true };
      },
      Component: () => (
        <PlatformGroups {...({ loaderData: { groups: GROUPS } } as unknown as Props)} />
      ),
      path: "/platform-groups",
    },
  ]);
  render(<Stub initialEntries={["/platform-groups"]} />);
  return posted;
};

describe("Platform groups", () => {
  it("lists each group's members, with Remove for a manual one and Synced for the rest", async () => {
    openGroups();
    const table = await screen.findByRole("table", { name: "Members of Privacy Officers" });
    const [, dave, erin] = within(table).getAllByRole("row");
    expect(within(dave!).getByText("dave@example.org")).toBeInTheDocument();
    expect(within(dave!).getByRole("button", { name: "Remove Dave" })).toBeInTheDocument();
    expect(within(erin!).getByText("Synced")).toBeInTheDocument();
  });
});

describe("Platform groups on a phone (7-responsive.s3)", () => {
  it("lists each member as a card, with Remove along its foot", async () => {
    asPhone();
    const posted = openGroups();
    const list = await screen.findByRole("list", { name: "Members of Privacy Officers" });
    expect(screen.queryByRole("table")).toBeNull();
    const [dave, erin] = within(list).getAllByRole("listitem");
    // The name, the email, then Remove.
    expect(dave!.textContent).toBe(["Dave", "dave@example.org", "Remove"].join(""));
    expect(erin).toHaveTextContent("Synced");
    await userEvent.click(within(dave!).getByRole("button", { name: "Remove Dave" }));
    await vi.waitFor(() =>
      expect(posted).toEqual([
        { groupId: "pg-privacy", intent: "remove-member", userId: "u-dave" },
      ]),
    );
  });
});
