// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { CommandActionsProvider, useCommandActions } from "@steward-web/ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, useLocation } from "react-router";
import { describe, expect, it } from "vitest";

import { useRegisterNavActions } from "./useNavActions";

const Page = () => {
  useRegisterNavActions([
    { id: "create", label: "New thing", shortcut: "history", to: "/things/new" },
    { allowed: false, id: "hidden", label: "Not for you", to: "/nope" },
  ]);
  const listed = useCommandActions();
  return (
    <>
      <p>at {useLocation().pathname}</p>
      <ul>
        {listed.map((action) => (
          <li key={action.id}>
            <button onClick={action.run} type="button">
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

const mount = () => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <CommandActionsProvider>
          <Page />
        </CommandActionsProvider>
      ),
      path: "*",
    },
  ]);
  render(<Stub initialEntries={["/things"]} />);
};

describe("a page's navigation actions for the command bar", () => {
  it("lists what is allowed and drops what is not", async () => {
    mount();
    expect(await screen.findByRole("button", { name: "New thing" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Not for you" })).toBeNull();
  });

  it("goes to the address when run, from the bar or from its shortcut key", async () => {
    mount();
    await userEvent.click(await screen.findByRole("button", { name: "New thing" }));
    expect(await screen.findByText("at /things/new")).toBeInTheDocument();
  });

  it("runs on its shortcut", async () => {
    mount();
    await screen.findByRole("button", { name: "New thing" });
    await userEvent.keyboard("h");
    expect(await screen.findByText("at /things/new")).toBeInTheDocument();
  });
});
