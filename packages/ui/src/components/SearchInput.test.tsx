// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { SearchInput } from "./SearchInput";

const Controlled = ({ onChange }: { onChange?: (value: string) => void }) => {
  const [value, setValue] = useState("");
  return (
    <SearchInput
      aria-label="Search these records"
      onChange={(event) => {
        setValue(event.target.value);
        onChange?.(event.target.value);
      }}
      value={value}
    />
  );
};

const box = () => screen.getByRole("searchbox", { name: "Search these records" });

describe("SearchInput (#107)", () => {
  it("shows no clear button while the box is empty", () => {
    render(<Controlled />);
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });

  it("shows it once there is text, and clearing empties the box, resets the results and refocuses", async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await userEvent.type(box(), "audit");
    const clear = screen.getByRole("button", { name: "Clear search" });
    await userEvent.click(clear);
    expect(box()).toHaveValue("");
    expect(box()).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });

  it("clears on Escape and keeps the key from closing anything around it", async () => {
    const outer = vi.fn();
    render(
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- watches the key bubble
      <div onKeyDown={outer}>
        <Controlled />
      </div>,
    );
    await userEvent.type(box(), "audit");
    await userEvent.keyboard("{Escape}");
    expect(box()).toHaveValue("");
    expect(outer).not.toHaveBeenCalledWith(expect.objectContaining({ key: "Escape" }));
  });

  it("lets Escape through when the box is already empty", async () => {
    const outer = vi.fn();
    render(
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- watches the key bubble
      <div onKeyDown={outer}>
        <Controlled />
      </div>,
    );
    box().focus();
    await userEvent.keyboard("{Escape}");
    expect(outer).toHaveBeenCalledWith(expect.objectContaining({ key: "Escape" }));
  });

  it("works on a box the page does not control", async () => {
    const onChange = vi.fn();
    render(
      <SearchInput
        aria-label="Search these records"
        defaultValue="old"
        onChange={(event) => onChange(event.target.value)}
      />,
    );
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(box()).toHaveValue("");
    expect(onChange).toHaveBeenLastCalledWith("");
  });
});
