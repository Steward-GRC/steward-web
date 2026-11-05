// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import MyGroups from "./my-groups";

const GROUPS = [
  {
    id: "g-facilities",
    members: [
      { email: "dave@example.org", name: "Dave", source: "manual", userId: "mock-user-dave" },
      { email: "erin@example.org", name: "Erin", source: "idp-sync", userId: "mock-user-erin" },
      { email: "carol@example.org", name: "Carol", source: "manual", userId: "mock-user-carol" },
    ],
    name: "Facilities team",
  },
  { id: "g-travel", members: [], name: "Travel desk" },
];

type GroupsProps = Parameters<typeof MyGroups>[0];

const openGroups = (groups: object[] = GROUPS) => {
  const posted: FormData[] = [];
  const searched: string[] = [];
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        posted.push(await request.formData());
        return { ok: true };
      },
      Component: () => <MyGroups {...({ loaderData: { groups } } as unknown as GroupsProps)} />,
      path: "/my-groups",
    },
    {
      loader: ({ request }) => {
        const query = new URL(request.url).searchParams.get("q") ?? "";
        searched.push(query);
        return {
          people: query ? [{ email: "bob@example.org", id: "mock-user-bob", name: "Bob" }] : [],
        };
      },
      path: "/resources/user-search",
    },
  ]);
  render(<Stub initialEntries={["/my-groups"]} />);
  return { posted, searched };
};

describe("My groups (A22)", () => {
  it("has one accordion per group with its member count", async () => {
    openGroups();
    expect(await screen.findByRole("heading", { level: 1, name: "My groups" })).toBeInTheDocument();
    const facilities = screen.getByRole("button", { name: "Facilities team · 3 members" });
    expect(facilities).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Travel desk · 0 members" })).toBeInTheDocument();
  });

  it("shows members as chips; a manual one can be removed, a synced one is locked", async () => {
    const { posted } = openGroups();
    const members = await screen.findByRole("list", { name: "Facilities team members" });
    expect(within(members).getByText("Erin · Synced")).toBeInTheDocument();
    expect(
      within(members).queryByRole("button", { name: "Remove Erin from Facilities team" }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      within(members).getByRole("button", { name: "Remove Dave from Facilities team" }),
    );
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]!.get("intent")).toBe("remove-member");
    expect(posted[0]!.get("userId")).toBe("mock-user-dave");
    expect(posted[0]!.get("groupId")).toBe("g-facilities");
  });

  it("adds a member from the picker", async () => {
    const { posted, searched } = openGroups();
    const members = await screen.findByRole("list", { name: "Facilities team members" });
    await userEvent.click(within(members).getByRole("button", { name: "Add member…" }));
    await userEvent.type(screen.getByRole("searchbox", { name: "Find a person" }), "bo");
    await vi.waitFor(() => expect(searched.at(-1)).toBe("bo"));
    await userEvent.click(await screen.findByRole("button", { name: "Bob · bob@example.org" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]!.get("intent")).toBe("add-member");
    expect(posted[0]!.get("userId")).toBe("mock-user-bob");
  });

  it("says when someone manages no groups", async () => {
    openGroups([]);
    expect(await screen.findByText("No managed groups")).toBeInTheDocument();
  });
});
