// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { type ChipItem, ChipPicker } from "./ChipPicker";

const JANE: ChipItem = { description: "jane@example.org", id: "u-1", label: "Jane Smith" };
const JOHN: ChipItem = { description: "john@example.org", id: "u-2", label: "John Smith" };
const OPS: ChipItem = { id: "g-1", kind: "group", label: "Ops team" };

const PEOPLE = [JANE, JOHN];

const Harness = ({
  initial = [],
  onChange,
  search,
  ...rest
}: {
  disabled?: boolean;
  initial?: ChipItem[];
  items?: ChipItem[];
  name?: string;
  onChange?: (next: readonly ChipItem[]) => void;
  readOnly?: boolean;
  search?: (query: string) => Promise<ChipItem[]>;
}) => {
  const [value, setValue] = useState<readonly ChipItem[]>(initial);
  return (
    <ChipPicker
      debounceMs={0}
      kindLabels={{ group: "Group", user: "Person" }}
      label="Owners"
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      search={search}
      value={value}
      {...rest}
    />
  );
};

const box = () => screen.getByRole("combobox", { name: "Owners" });
const submitted = (form: HTMLFormElement) => [...new FormData(form).entries()];
const searchFor = (found: ChipItem[]) => vi.fn(async () => found);

describe("ChipPicker (#374)", () => {
  it("renders each chosen item as a labelled chip inside the bar", () => {
    render(<Harness initial={[JANE, OPS]} items={PEOPLE} />);
    const chips = screen.getByRole("list", { name: "Selected: Owners" });
    expect(within(chips).getAllByRole("listitem")).toHaveLength(2);
    expect(within(chips).getByText("Jane Smith")).toBeInTheDocument();
    expect(within(chips).getByText("Ops team")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Jane Smith" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Ops team" })).toBeInTheDocument();
  });

  it("names a chip's kind for screen readers", () => {
    render(<Harness initial={[OPS]} items={PEOPLE} />);
    expect(within(screen.getByRole("listitem")).getByText("Group")).toBeInTheDocument();
  });

  it("is a combobox with the ARIA attributes of the pattern", async () => {
    render(<Harness items={PEOPLE} />);
    expect(box()).toHaveAttribute("aria-expanded", "false");
    expect(box()).toHaveAttribute("aria-autocomplete", "list");
    expect(box()).toHaveAttribute("aria-haspopup", "listbox");
    await userEvent.type(box(), "sm");
    expect(box()).toHaveAttribute("aria-expanded", "true");
    const list = screen.getByRole("listbox", { name: "Owners" });
    expect(box()).toHaveAttribute("aria-controls", list.id);
    expect(within(list).getAllByRole("option")).toHaveLength(2);
    await userEvent.keyboard("{ArrowDown}");
    const active = within(list).getAllByRole("option")[0]!;
    expect(box()).toHaveAttribute("aria-activedescendant", active.id);
    expect(active).toHaveAttribute("aria-selected", "true");
  });

  it("filters a static items list as you type", async () => {
    render(<Harness items={PEOPLE} />);
    await userEvent.type(box(), "john");
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("John Smith");
  });

  it("asks the async provider with the typed query and shows the answer", async () => {
    const search = searchFor(PEOPLE);
    render(<Harness search={search} />);
    await userEvent.type(box(), "sm");
    expect(await screen.findAllByRole("option")).toHaveLength(2);
    expect(search).toHaveBeenLastCalledWith("sm");
  });

  it("asks for more characters under the minimum and does not search", async () => {
    const search = searchFor(PEOPLE);
    render(<Harness search={search} />);
    await userEvent.type(box(), "s");
    expect(search).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Type at least 2 characters to search.");
  });

  it("says it is searching, then that nothing matched", async () => {
    const release = { current: (_found: ChipItem[]) => {} };
    const search = vi.fn(
      () =>
        new Promise<ChipItem[]>((resolve) => {
          release.current = resolve;
        }),
    );
    render(<Harness search={search} />);
    await userEvent.type(box(), "zz");
    expect(await screen.findByText("Searching…")).toBeInTheDocument();
    release.current([]);
    expect(await screen.findByText("No match for “zz”.")).toBeInTheDocument();
  });

  it("says so when the search fails", async () => {
    const search = vi.fn(async () => {
      throw new Error("down");
    });
    render(<Harness search={search} />);
    await userEvent.type(box(), "sm");
    expect(await screen.findByText("Search isn't available right now.")).toBeInTheDocument();
  });

  it("drops an answer that arrives after a newer search", async () => {
    const resolvers: ((found: ChipItem[]) => void)[] = [];
    const search = vi.fn(
      () =>
        new Promise<ChipItem[]>((resolve) => {
          resolvers.push(resolve);
        }),
    );
    render(<Harness search={search} />);
    await userEvent.type(box(), "ja");
    await waitFor(() => expect(resolvers).toHaveLength(1));
    await userEvent.type(box(), "n");
    await waitFor(() => expect(resolvers).toHaveLength(2));
    resolvers[1]!([JOHN]);
    resolvers[0]!([JANE]);
    expect(await screen.findByRole("option", { name: /John Smith/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Jane Smith/ })).not.toBeInTheDocument();
  });

  it("picks with the arrow keys and Enter, clears the text and keeps focus", async () => {
    const onChange = vi.fn();
    render(<Harness items={PEOPLE} onChange={onChange} />);
    await userEvent.type(box(), "sm");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenLastCalledWith([JOHN]);
    expect(box()).toHaveValue("");
    expect(box()).toHaveFocus();
    expect(screen.getByRole("button", { name: "Remove John Smith" })).toBeInTheDocument();
  });

  it("wraps the arrows and jumps with Home and End", async () => {
    render(<Harness items={PEOPLE} />);
    await userEvent.type(box(), "sm");
    await userEvent.keyboard("{ArrowUp}");
    expect(box()).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[1]!.id);
    await userEvent.keyboard("{Home}");
    expect(box()).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[0]!.id);
    await userEvent.keyboard("{End}");
    expect(box()).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[1]!.id);
  });

  it("closes the list with Escape and keeps what was typed", async () => {
    render(<Harness items={PEOPLE} />);
    await userEvent.type(box(), "sm");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(box()).toHaveAttribute("aria-expanded", "false");
    expect(box()).toHaveValue("sm");
  });

  it("picks with the mouse", async () => {
    const onChange = vi.fn();
    render(<Harness items={PEOPLE} onChange={onChange} />);
    await userEvent.type(box(), "sm");
    await userEvent.click(screen.getByRole("option", { name: /Jane Smith/ }));
    expect(onChange).toHaveBeenLastCalledWith([JANE]);
  });

  it("does not offer an item that is already chosen, so there are no duplicates", async () => {
    const onChange = vi.fn();
    render(<Harness initial={[JANE]} items={PEOPLE} onChange={onChange} />);
    await userEvent.type(box(), "sm");
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("John Smith");
  });

  it("never adds the same id twice even if the provider returns it", async () => {
    const onChange = vi.fn();
    render(<Harness initial={[JANE]} onChange={onChange} search={searchFor([JANE, JOHN])} />);
    await userEvent.type(box(), "sm");
    expect(await screen.findAllByRole("option")).toHaveLength(1);
  });

  it("removes the last chip with Backspace in the empty input", async () => {
    const onChange = vi.fn();
    render(<Harness initial={[JANE, JOHN]} items={PEOPLE} onChange={onChange} />);
    await userEvent.click(box());
    await userEvent.keyboard("{Backspace}");
    expect(onChange).toHaveBeenLastCalledWith([JANE]);
    expect(screen.queryByRole("button", { name: "Remove John Smith" })).not.toBeInTheDocument();
    expect(box()).toHaveFocus();
  });

  it("does not remove a chip with Backspace while there is text to delete", async () => {
    const onChange = vi.fn();
    render(<Harness initial={[JANE]} items={PEOPLE} onChange={onChange} />);
    await userEvent.type(box(), "j{Backspace}");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Remove Jane Smith" })).toBeInTheDocument();
  });

  it("removes a chip with its X and returns focus to the input", async () => {
    const onChange = vi.fn();
    render(<Harness initial={[JANE, JOHN]} items={PEOPLE} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Jane Smith" }));
    expect(onChange).toHaveBeenLastCalledWith([JOHN]);
    expect(box()).toHaveFocus();
  });

  it("announces additions and removals in a polite live region", async () => {
    render(<Harness items={PEOPLE} />);
    await userEvent.type(box(), "jane");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(screen.getByText("Jane Smith added.")).toHaveAttribute("aria-live", "polite");
    await userEvent.click(screen.getByRole("button", { name: "Remove Jane Smith" }));
    expect(screen.getByText("Jane Smith removed.")).toHaveAttribute("aria-live", "polite");
  });

  it("submits one hidden input per chip under the given name", () => {
    render(
      <form aria-label="f">
        <Harness initial={[JANE, JOHN]} items={PEOPLE} name="owners" />
      </form>,
    );
    expect(submitted(screen.getByRole("form"))).toEqual([
      ["owners", "u-1"],
      ["owners", "u-2"],
    ]);
  });

  it("shows a kind on the options of a mixed list", async () => {
    render(<Harness items={[JANE, OPS]} />);
    await userEvent.type(box(), "o");
    expect(
      within(screen.getByRole("option", { name: /Ops team/ })).getByText("Group"),
    ).toBeVisible();
  });

  it("is inert when disabled: no typing, no removing, nothing submitted", () => {
    render(
      <form aria-label="f">
        <Harness disabled initial={[JANE]} items={PEOPLE} name="owners" />
      </form>,
    );
    expect(box()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove Jane Smith" })).toBeDisabled();
    expect(submitted(screen.getByRole("form"))).toEqual([]);
  });

  it("shows read-only chips without a search box or remove buttons, still submitted", () => {
    render(
      <form aria-label="f">
        <Harness initial={[JANE]} items={PEOPLE} name="owners" readOnly />
      </form>,
    );
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(submitted(screen.getByRole("form"))).toEqual([["owners", "u-1"]]);
  });

  it("does not submit an enclosing form on Enter while picking", async () => {
    const submit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <Harness items={PEOPLE} />
      </form>,
    );
    await userEvent.type(box(), "sm");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(submit).not.toHaveBeenCalled();
  });
});
