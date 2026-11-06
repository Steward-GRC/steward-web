// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  type CommandAction,
  CommandActionsProvider,
  useCommandActions,
  useRegisterCommandActions,
} from "./CommandActions";

const Page = ({ actions }: { actions: CommandAction[] }) => {
  useRegisterCommandActions(actions);
  return <p>page</p>;
};

const Listed = () => (
  <ul>
    {useCommandActions().map((action) => (
      <li key={action.id}>{action.label}</li>
    ))}
  </ul>
);

const retire = (run = vi.fn(), allowed = true): CommandAction => ({
  allowed,
  id: "retire",
  label: "Retire",
  run,
  shortcut: "retire",
});

const Host = () => {
  const [shown, setShown] = useState(true);
  return (
    <CommandActionsProvider>
      {shown ? <Page actions={[retire()]} /> : null}
      <button onClick={() => setShown(false)} type="button">
        leave
      </button>
      <Listed />
    </CommandActionsProvider>
  );
};

describe("admin command actions (#103)", () => {
  it("lists the everyday actions first and the admin ones after, whatever order they registered in", () => {
    render(
      <CommandActionsProvider>
        <Page
          actions={[
            { id: "move", kind: "admin", label: "Move", run: vi.fn() },
            { id: "print", label: "Print", run: vi.fn() },
            { id: "retire", kind: "admin", label: "Retire", run: vi.fn() },
            { id: "history", label: "History", run: vi.fn() },
          ]}
        />
        <Listed />
      </CommandActionsProvider>,
    );
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Print",
      "History",
      "Move",
      "Retire",
    ]);
  });
});

describe("command actions", () => {
  it("lists what a page registers, and drops it when the page goes", () => {
    render(<Host />);
    expect(screen.getByText("Retire", { selector: "li" })).toBeInTheDocument();
    return userEvent.click(screen.getByText("leave")).then(() => {
      expect(screen.queryByText("Retire", { selector: "li" })).not.toBeInTheDocument();
    });
  });

  it("leaves out an action the person may not take", () => {
    render(
      <CommandActionsProvider>
        <Page actions={[retire(vi.fn(), false)]} />
        <Listed />
      </CommandActionsProvider>,
    );
    expect(screen.queryByText("Retire", { selector: "li" })).not.toBeInTheDocument();
  });

  it("does nothing without a provider", () => {
    render(<Page actions={[retire()]} />);
    expect(screen.getByText("page")).toBeInTheDocument();
  });

  it("runs the latest callback on its shortcut, but not while typing or in a dialog", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(
      <CommandActionsProvider>
        <Page actions={[retire(first)]} />
        <input aria-label="field" />
      </CommandActionsProvider>,
    );
    rerender(
      <CommandActionsProvider>
        <Page actions={[retire(second)]} />
        <input aria-label="field" />
      </CommandActionsProvider>,
    );
    const user = userEvent.setup();
    await user.keyboard("{Shift>}R{/Shift}");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();

    await user.click(screen.getByLabelText("field"));
    await user.keyboard("{Shift>}R{/Shift}");
    expect(second).toHaveBeenCalledOnce();
  });

  it("holds its shortcuts while a dialog is open", async () => {
    const run = vi.fn();
    render(
      <CommandActionsProvider>
        <Page actions={[retire(run)]} />
        <div role="dialog" />
      </CommandActionsProvider>,
    );
    await userEvent.keyboard("{Shift>}R{/Shift}");
    expect(run).not.toHaveBeenCalled();
  });
});
