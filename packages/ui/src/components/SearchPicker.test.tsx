// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { type PickerOption, SearchPicker } from "./SearchPicker";

const JANE: PickerOption = { detail: "jane@example.org", id: "u-1", label: "Jane Smith" };
const JOHN: PickerOption = { detail: "jane@example.org", id: "u-2", label: "John Smith" };

const Harness = ({
  onChange,
  search,
}: {
  onChange?: (option: null | PickerOption) => void;
  search: (query: string) => Promise<PickerOption[]>;
}) => {
  const [value, setValue] = useState<null | PickerOption>(null);
  return (
    <SearchPicker
      debounceMs={0}
      label="Person"
      onChange={(option) => {
        setValue(option);
        onChange?.(option);
      }}
      search={search}
      value={value}
    />
  );
};

const box = () => screen.getByRole("combobox", { name: "Person" });

let releaseFirst: (options: PickerOption[]) => void = () => {};

describe("SearchPicker (#88)", () => {
  it("asks for more characters under two and does not search", async () => {
    const search = vi.fn().mockResolvedValue([]);
    render(<Harness search={search} />);
    await userEvent.type(box(), "j");
    expect(await screen.findByText("Type at least 2 characters to search.")).toBeInTheDocument();
    expect(search).not.toHaveBeenCalled();
  });

  it("searches from two characters and lists name and email", async () => {
    const search = vi.fn().mockResolvedValue([JANE]);
    render(<Harness search={search} />);
    await userEvent.type(box(), "ja");
    const list = await screen.findByRole("listbox");
    expect(search).toHaveBeenLastCalledWith("ja");
    const option = within(list).getByRole("option");
    expect(option).toHaveTextContent("Jane Smith");
    expect(option).toHaveTextContent("jane@example.org");
    expect(box()).toHaveAttribute("aria-expanded", "true");
  });

  it("tells two people with one name and one email apart", async () => {
    const twins = [
      { ...JANE, extra: "jsmith" },
      { ...JANE, extra: "jsmith2", id: "u-3" },
    ];
    render(<Harness search={vi.fn().mockResolvedValue(twins)} />);
    await userEvent.type(box(), "jane");
    expect(await screen.findByText("jsmith")).toBeInTheDocument();
    expect(screen.getByText("jsmith2")).toBeInTheDocument();
  });

  it("falls back to the end of the id when nothing else tells two results apart", async () => {
    render(<Harness search={vi.fn().mockResolvedValue([JANE, { ...JANE, id: "u-9999" }])} />);
    await userEvent.type(box(), "jane");
    expect(await screen.findByText("ID …9999")).toBeInTheDocument();
  });

  it("picks with the arrow keys and Enter, keeping the id as the identity", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} search={vi.fn().mockResolvedValue([JANE, JOHN])} />);
    await userEvent.type(box(), "smith");
    await screen.findByRole("listbox");
    await userEvent.keyboard("{ArrowDown}");
    expect(box()).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-0"));
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith(JOHN);
    expect(box()).toHaveValue("John Smith");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("wraps with the arrows and jumps with Home and End", async () => {
    render(<Harness search={vi.fn().mockResolvedValue([JANE, JOHN])} />);
    await userEvent.type(box(), "smith");
    await screen.findByRole("listbox");
    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("option", { name: /John Smith/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("option", { name: /Jane Smith/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("option", { name: /John Smith/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("closes the list on Escape", async () => {
    render(<Harness search={vi.fn().mockResolvedValue([JANE])} />);
    await userEvent.type(box(), "ja");
    await screen.findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(box()).toHaveAttribute("aria-expanded", "false");
  });

  it("says when nothing matches", async () => {
    render(<Harness search={vi.fn().mockResolvedValue([])} />);
    await userEvent.type(box(), "zz");
    expect(await screen.findByText("No match for “zz”.")).toBeInTheDocument();
  });

  it("picks with a click and clears the choice when the person types again", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} search={vi.fn().mockResolvedValue([JANE])} />);
    await userEvent.type(box(), "ja");
    await userEvent.click(await screen.findByRole("option", { name: /Jane Smith/ }));
    expect(onChange).toHaveBeenLastCalledWith(JANE);
    await userEvent.type(box(), "x");
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("shows the answer to the last thing typed, not a slower earlier one", async () => {
    const search = vi
      .fn()
      .mockImplementationOnce(
        () => new Promise<PickerOption[]>((resolve) => (releaseFirst = resolve)),
      )
      .mockResolvedValue([JOHN]);
    render(<Harness search={search} />);
    await userEvent.type(box(), "ja");
    await userEvent.type(box(), "n");
    await screen.findByRole("option", { name: /John Smith/ });
    releaseFirst([JANE]);
    await waitFor(() => expect(screen.queryByRole("option", { name: /Jane Smith/ })).toBeNull());
  });

  it("says the list is capped and to keep typing", async () => {
    const many = Array.from({ length: 10 }, (_, index) => ({
      detail: `p${index}@example.org`,
      id: `u-${index}`,
      label: `Person ${index}`,
    }));
    render(<Harness search={vi.fn().mockResolvedValue(many)} />);
    await userEvent.type(box(), "pe");
    expect(
      await screen.findByText("Showing the first 10. Keep typing to narrow it down."),
    ).toBeInTheDocument();
  });
});
