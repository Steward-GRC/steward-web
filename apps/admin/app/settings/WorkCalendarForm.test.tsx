// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WorkCalendarForm } from "./WorkCalendarForm";

const CALENDAR = {
  holidays: [{ date: "2026-12-25", label: "Christmas Day" }],
  timezone: "UTC",
  weekdays: [1, 2, 3, 4, 5],
};

const open = (props: Partial<Parameters<typeof WorkCalendarForm>[0]> = {}) => {
  const onSave = vi.fn();
  render(<WorkCalendarForm busy={false} calendar={CALENDAR} onSave={onSave} {...props} />);
  return onSave;
};

const save = () => userEvent.click(screen.getByRole("button", { name: "Save" }));
const holidayRows = () => screen.getAllByRole("listitem");

describe("WorkCalendarForm weekdays", () => {
  it("shows Monday to Sunday with the calendar's days checked", () => {
    open();
    const group = screen.getByRole("group", { name: "Days that count as working days" });
    const names = within(group)
      .getAllByRole("checkbox")
      .map((box) => box.getAttribute("aria-label"));
    expect(names).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
    expect(screen.getByRole("checkbox", { name: "Friday" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Saturday" })).not.toBeChecked();
  });

  it("saves the toggled days as sorted ISO numbers", async () => {
    const onSave = open();
    await userEvent.click(screen.getByRole("checkbox", { name: "Sunday" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Friday" }));
    await save();
    expect(onSave).toHaveBeenCalledWith({ ...CALENDAR, weekdays: [1, 2, 3, 4, 7] });
  });

  it("refuses to save with no working day", async () => {
    const onSave = open({ calendar: { ...CALENDAR, weekdays: [1] } });
    await userEvent.click(screen.getByRole("checkbox", { name: "Monday" }));
    await save();
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("Pick at least one working day.")).toBeInTheDocument();
  });
});

describe("WorkCalendarForm time zone", () => {
  it("shows the stored zone and saves a different one", async () => {
    const onSave = open();
    const zone = screen.getByRole("combobox", { name: "Time zone" });
    expect(zone).toHaveTextContent("UTC");
    await userEvent.click(zone);
    await userEvent.click(await screen.findByRole("option", { name: "Europe/London" }));
    await save();
    expect(onSave).toHaveBeenCalledWith({ ...CALENDAR, timezone: "Europe/London" });
  });

  it("keeps a stored zone the browser's list does not know", () => {
    open({ calendar: { ...CALENDAR, timezone: "Mars/Olympus_Mons" } });
    expect(screen.getByRole("combobox", { name: "Time zone" })).toHaveTextContent(
      "Mars/Olympus_Mons",
    );
  });
});

describe("WorkCalendarForm holidays", () => {
  it("lists the stored holidays with a date and a label", () => {
    open();
    const [row] = holidayRows();
    expect(within(row!).getByLabelText("Holiday date 1")).toHaveValue("2026-12-25");
    expect(within(row!).getByLabelText("Holiday label 1")).toHaveValue("Christmas Day");
  });

  it("adds a row, saves an empty label as the empty string and sorts by date", async () => {
    const onSave = open();
    await userEvent.click(screen.getByRole("button", { name: "Add holiday" }));
    fireEvent.change(screen.getByLabelText("Holiday date 2"), { target: { value: "2026-01-01" } });
    await save();
    expect(onSave).toHaveBeenCalledWith({
      ...CALENDAR,
      holidays: [
        { date: "2026-01-01", label: "" },
        { date: "2026-12-25", label: "Christmas Day" },
      ],
    });
  });

  it("removes a row", async () => {
    const onSave = open();
    await userEvent.click(screen.getByRole("button", { name: "Remove holiday 1" }));
    expect(screen.queryByLabelText("Holiday date 1")).not.toBeInTheDocument();
    await save();
    expect(onSave).toHaveBeenCalledWith({ ...CALENDAR, holidays: [] });
  });

  it("rejects a duplicate date before it reaches the server", async () => {
    const onSave = open();
    await userEvent.click(screen.getByRole("button", { name: "Add holiday" }));
    fireEvent.change(screen.getByLabelText("Holiday date 2"), { target: { value: "2026-12-25" } });
    await save();
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Holiday date 2")).toBeInvalid();
    expect(screen.getByText("This date is already in the list.")).toBeInTheDocument();
  });

  it("rejects a row with no date", async () => {
    const onSave = open();
    await userEvent.click(screen.getByRole("button", { name: "Add holiday" }));
    await save();
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Holiday date 2")).toBeInvalid();
    expect(screen.getByText("Pick a date.")).toBeInTheDocument();
  });

  it("limits a label to 80 characters", async () => {
    const onSave = open();
    const label = screen.getByLabelText("Holiday label 1");
    expect(label).toHaveAttribute("maxlength", "80");
    fireEvent.change(label, { target: { value: "x".repeat(81) } });
    await save();
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("A label is at most 80 characters.")).toBeInTheDocument();
  });

  it("accepts an 80 character label", async () => {
    const onSave = open();
    fireEvent.change(screen.getByLabelText("Holiday label 1"), {
      target: { value: "x".repeat(80) },
    });
    await save();
    expect(onSave).toHaveBeenCalledOnce();
  });
});

describe("WorkCalendarForm feedback", () => {
  it("shows the server's message when the calendar is refused", () => {
    open({ serverError: "unknown time zone Mars/Olympus_Mons" });
    expect(screen.getByRole("alert")).toHaveTextContent("unknown time zone Mars/Olympus_Mons");
  });

  it("says Saved! after a save and disables Save while busy", () => {
    open({ busy: true, saved: true });
    expect(screen.getByText("Saved!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});
