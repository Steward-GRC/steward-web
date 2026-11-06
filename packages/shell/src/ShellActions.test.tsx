// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { CommandActionsProvider } from "@steward-web/ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, useLocation } from "react-router";
import { describe, expect, it } from "vitest";

import { ShellActions } from "./ShellActions";

const Where = () => <p>at {useLocation().pathname}</p>;

const mount = (inbox: boolean) => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <CommandActionsProvider>
          <ShellActions inbox={inbox} />
          <Where />
        </CommandActionsProvider>
      ),
      path: "*",
    },
  ]);
  render(<Stub initialEntries={["/policies"]} />);
};

describe("the shell's own command bar actions", () => {
  it("opens the inbox on Shift+I", async () => {
    mount(true);
    await userEvent.keyboard("{Shift>}I{/Shift}");
    expect(await screen.findByText("at /inbox")).toBeInTheDocument();
  });

  it("does nothing for someone signed out", async () => {
    mount(false);
    await userEvent.keyboard("{Shift>}I{/Shift}");
    expect(screen.getByText("at /policies")).toBeInTheDocument();
  });
});
