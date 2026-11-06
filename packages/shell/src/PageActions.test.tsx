// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { CommandActionsProvider, useRegisterCommandActions } from "@steward-web/ui";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SearchField } from "./SearchField";

const Page = ({ retire }: { retire: () => void }) => {
  useRegisterCommandActions([
    { id: "acknowledge", label: "Acknowledge", run: vi.fn(), shortcut: "acknowledge" },
    { id: "retire", label: "Retire", run: retire, shortcut: "retire" },
    { allowed: false, id: "delete", label: "Delete", run: vi.fn() },
  ]);
  return null;
};

const mount = (retire = vi.fn()) => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <CommandActionsProvider>
          <SearchField />
          <Page retire={retire} />
        </CommandActionsProvider>
      ),
      path: "/",
    },
    { loader: () => ({ groups: [] }), path: "/resources/command-palette" },
  ]);
  render(<Stub initialEntries={["/"]} />);
  return retire;
};

afterEach(() => localStorage.clear());

describe("the command bar offers the page's actions (bug log 26)", () => {
  it("lists them first under Actions, with their keys, and leaves out what isn't allowed", async () => {
    mount();
    await userEvent.keyboard("{Meta>}k{/Meta}");
    const group = await screen.findByRole("group", { name: "Actions" });
    const options = within(group).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["AcknowledgeA", "Retire⇧R"]);
    expect(screen.queryByRole("option", { name: /Delete/ })).toBeNull();
  });

  it("narrows them by the words typed", async () => {
    mount();
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await userEvent.type(screen.getByRole("combobox"), "ret");
    const group = await screen.findByRole("group", { name: "Actions" });
    expect(within(group).getAllByRole("option")).toHaveLength(1);
  });

  it("closes the bar, then runs the action, and keeps it out of Recent", async () => {
    const retire = mount();
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await userEvent.click(await screen.findByRole("option", { name: /Retire/ }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(retire).toHaveBeenCalledOnce());
    expect(localStorage.length).toBe(0);
  });

  it("runs an action on its key from the page", async () => {
    const retire = mount();
    await userEvent.keyboard("{Shift>}R{/Shift}");
    expect(retire).toHaveBeenCalledOnce();
  });
});
