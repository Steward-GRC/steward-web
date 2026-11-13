// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { ApproverPicker, type ApproverPickerValue } from "./ApproverPicker";

const PEOPLE = [
  { enabled: true, id: "u-dave", name: "Dave" },
  { enabled: true, id: "u-erin", name: "Erin" },
  { enabled: false, id: "u-carol", name: "Carol" },
  // The site admin is in the site-wide user list, but the gateway never names them a candidate.
  { enabled: true, id: "u-root", name: "Root Admin" },
];

const CANDIDATES = {
  attached: true,
  users: [
    { id: "u-dave", name: "Dave" },
    { id: "u-erin", name: "Erin" },
  ],
};

const GROUPS = { "g-approvers": "Approvers", "g-empty": "Interns", "g-root": "Root only" };
const MEMBERS = {
  "g-approvers": ["u-dave", "u-erin", "u-root"],
  "g-empty": ["u-nobody"],
  "g-root": ["u-root"],
};

const Harness = ({
  candidates = CANDIDATES,
  initial = { approvers: [], groupUnits: [] },
  onChange,
}: {
  candidates?: { attached: boolean; users: { id: string; name: string }[] } | null;
  initial?: ApproverPickerValue;
  onChange?: (next: ApproverPickerValue) => void;
}) => {
  const [value, setValue] = useState(initial);
  return (
    <MemoryRouter>
      <ApproverPicker
        candidates={candidates}
        groupMembers={MEMBERS}
        groupNames={GROUPS}
        number={1}
        onChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
        people={PEOPLE}
        value={value}
      />
    </MemoryRouter>
  );
};

const optionNames = () => screen.queryAllByRole("option").map((option) => option.textContent);

describe("ApproverPicker (steward-web bug 15)", () => {
  it("offers only the candidates the gateway named, never the site-wide user list", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("combobox", { name: "Stage 1 approvers" }));
    const names = optionNames().join(" | ");
    expect(names).toContain("Dave");
    expect(names).toContain("Erin");
    expect(names).not.toContain("Carol");
    expect(names).not.toContain("Root Admin");
  });

  it("never offers root, not even by typing its name", async () => {
    render(<Harness />);
    await userEvent.type(screen.getByRole("combobox", { name: "Stage 1 approvers" }), "root");
    expect(screen.queryByRole("option", { name: /Root/ })).not.toBeInTheDocument();
  });

  it("filters the candidates as the admin types", async () => {
    render(<Harness />);
    await userEvent.type(screen.getByRole("combobox", { name: "Stage 1 approvers" }), "er");
    expect(screen.getByRole("option", { name: /Erin/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Dave/ })).not.toBeInTheDocument();
  });

  it("adds a chosen person and reports the stage's approvers in the same shape", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.type(screen.getByRole("combobox", { name: "Stage 1 approvers" }), "da");
    await userEvent.click(screen.getByRole("option", { name: /Dave/ }));
    expect(onChange).toHaveBeenCalledWith({ approvers: ["u-dave"], groupUnits: [] });
    expect(screen.getByRole("button", { name: "Remove Dave" })).toBeInTheDocument();
  });

  it("removes a chosen person", async () => {
    const onChange = vi.fn();
    render(
      <Harness initial={{ approvers: ["u-dave", "u-erin"], groupUnits: [] }} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove Dave" }));
    expect(onChange).toHaveBeenCalledWith({ approvers: ["u-erin"], groupUnits: [] });
  });

  it("says to attach the workflow to a category first, and offers no one", () => {
    render(<Harness candidates={{ attached: false, users: [] }} />);
    expect(screen.getByText("Attach this workflow to a category first.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open categories" })).toHaveAttribute(
      "href",
      "/categories",
    );
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("keeps showing who is already named while the workflow is not attached", () => {
    render(
      <Harness
        candidates={{ attached: false, users: [] }}
        initial={{ approvers: ["u-dave"], groupUnits: [] }}
      />,
    );
    expect(screen.getByText("Dave")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove Dave" })).not.toBeInTheDocument();
  });

  it("does not claim the workflow is unattached when the gateway could not answer", () => {
    render(<Harness candidates={null} />);
    expect(screen.getByText("Couldn't load who can approve this workflow.")).toBeInTheDocument();
    expect(screen.queryByText("Attach this workflow to a category first.")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("finds groups through the same box, only those with someone who can approve", async () => {
    render(<Harness />);
    await userEvent.type(screen.getByRole("combobox", { name: "Stage 1 approvers" }), "i");
    expect(screen.queryByRole("option", { name: /Interns/ })).not.toBeInTheDocument();
    await userEvent.clear(screen.getByRole("combobox", { name: "Stage 1 approvers" }));
    await userEvent.type(screen.getByRole("combobox", { name: "Stage 1 approvers" }), "root");
    expect(screen.queryByRole("option", { name: /Root only/ })).not.toBeInTheDocument();
    await userEvent.clear(screen.getByRole("combobox", { name: "Stage 1 approvers" }));
    await userEvent.type(screen.getByRole("combobox", { name: "Stage 1 approvers" }), "app");
    expect(screen.getByRole("option", { name: /Approvers/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Group/ })).toBeInTheDocument();
  });

  it("adds a group as a unit of the members who can approve, never root", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.type(screen.getByRole("combobox", { name: "Stage 1 approvers" }), "app");
    await userEvent.click(screen.getByRole("option", { name: /Approvers/ }));
    expect(onChange).toHaveBeenCalledWith({
      approvers: [],
      groupUnits: [
        { groupId: "g-approvers", internalQuorum: "one", memberUserIds: ["u-dave", "u-erin"] },
      ],
    });
    expect(screen.getByText("Group: Approvers · As a group · 1 of 2")).toBeInTheDocument();
  });

  it("removes a group and keeps the people", async () => {
    const onChange = vi.fn();
    render(
      <Harness
        initial={{
          approvers: ["u-dave"],
          groupUnits: [
            { groupId: "g-approvers", internalQuorum: "majority", memberUserIds: ["u-erin"] },
          ],
        }}
        onChange={onChange}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Remove Group: Approvers · As a group · 1 of 1" }),
    );
    expect(onChange).toHaveBeenCalledWith({ approvers: ["u-dave"], groupUnits: [] });
  });

  it("asks for a disabled approver to be replaced", () => {
    render(<Harness initial={{ approvers: ["u-carol"], groupUnits: [] }} />);
    expect(screen.getByText("Carol · disabled — replace")).toBeInTheDocument();
  });

  it("lets the box wrap on a narrow screen", () => {
    const { container } = render(<Harness />);
    expect(container.firstElementChild?.className).toContain("min-w-0");
  });
});
