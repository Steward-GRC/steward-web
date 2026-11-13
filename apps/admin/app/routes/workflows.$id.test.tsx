// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import WorkflowEditor from "./workflows.$id";

const WORKFLOW = {
  description: "Two stages for anything that spends money.",
  id: "w-finance",
  name: "Finance sign-off",
  stages: [
    {
      approvers: ["mock-user-dave", "mock-user-grace", "mock-user-carol"],
      approversByCategory: [],
      groupUnits: [],
      id: "s-1",
      name: "Finance review",
      pinnedLast: false,
      quorum: "majority",
      rejectOnSlaBreach: false,
      slaDays: 3,
    },
    {
      approvers: [],
      approversByCategory: [],
      groupUnits: [
        {
          groupId: "g-approvers",
          internalQuorum: "majority",
          memberUserIds: ["mock-user-a", "mock-user-b", "mock-user-c"],
        },
      ],
      id: "s-2",
      name: "Final approval",
      pinnedLast: true,
      quorum: "one",
      rejectOnSlaBreach: false,
      slaDays: null,
    },
  ],
  version: 2,
};

const CALENDAR = {
  holidays: [{ date: "2026-12-25", label: "Christmas Day" }],
  timezone: "Europe/London",
  weekdays: [1, 2, 3, 4, 5],
};

const BASE = {
  calendar: CALENDAR,
  groupNames: { "g-approvers": "Approvers" },
  people: [
    { enabled: true, id: "mock-user-dave", name: "Dave" },
    { enabled: true, id: "mock-user-grace", name: "Grace" },
    { enabled: false, id: "mock-user-carol", name: "Carol" },
    { enabled: true, id: "mock-user-erin", name: "Erin" },
  ],
  usedBy: 1,
  workflow: WORKFLOW,
};

type EditorProps = Parameters<typeof WorkflowEditor>[0];

const openEditor = (overrides: Record<string, unknown> = {}) => {
  const posted: FormData[] = [];
  const loaderData = { ...BASE, ...overrides };
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const form = await request.formData();
        posted.push(form);
        return { intent: form.get("intent"), ok: true };
      },
      Component: () => <WorkflowEditor {...({ loaderData } as unknown as EditorProps)} />,
      path: "/workflows/:id",
    },
  ]);
  render(<Stub initialEntries={["/workflows/w-finance"]} />);
  return posted;
};

const stage = (number: number) => screen.getByRole("group", { name: `Stage ${number}` });
const savedStages = (form: FormData) =>
  JSON.parse(String(form.get("stagesJson"))) as {
    approvers: string[];
    name: string;
    quorum: string;
    slaDays: null | number;
  }[];

describe("The workflow editor (A9)", () => {
  it("opens with the name, the sequential line and no draft pill when usable", async () => {
    openEditor();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Finance sign-off" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Workflows")).toBeInTheDocument();
    expect(
      screen.getByText("Stages run sequentially. Each runs after the previous one approves."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Draft")).not.toBeInTheDocument();
  });

  it("stacks the name above the description, full width (bug log 253)", async () => {
    openEditor();
    await screen.findByRole("heading", { level: 1 });
    const details = screen.getByRole("group", { name: "Name and description" });
    expect(details.className).not.toContain("grid-cols-2");
    const name = within(details).getByLabelText("Name");
    const description = within(details).getByLabelText("Description");
    expect(
      name.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows each stage's quorum as One, Quorum or All with its explanation", async () => {
    openEditor();
    await screen.findByRole("heading", { level: 1 });
    const first = stage(1);
    expect(within(first).getByRole("radio", { name: "Quorum" })).toBeChecked();
    expect(
      within(first).getByText("Quorum: a majority of approvers must approve."),
    ).toBeInTheDocument();
    await userEvent.click(within(first).getByRole("radio", { name: "All" }));
    expect(within(first).getByText("All: every approver must approve.")).toBeInTheDocument();

    const second = stage(2);
    expect(within(second).getByText("Always last")).toBeInTheDocument();
    expect(within(second).getByRole("radio", { name: "One" })).toBeChecked();
  });

  it("shows approvers as chips: a disabled one asks to be replaced, a group shows its quorum", async () => {
    openEditor();
    await screen.findByRole("heading", { level: 1 });
    const approvers = within(stage(1)).getByRole("list", { name: "Stage 1 approvers" });
    expect(within(approvers).getByText("Dave")).toBeInTheDocument();
    expect(within(approvers).getByText("Carol · disabled — replace")).toBeInTheDocument();
    expect(
      within(stage(2)).getByText("Group: Approvers · As a group · 2 of 3"),
    ).toBeInTheDocument();
  });

  it("adds and removes approvers, sets the due date and saves the stages", async () => {
    const posted = openEditor();
    await screen.findByRole("heading", { level: 1 });
    const first = stage(1);
    await userEvent.click(within(first).getByRole("button", { name: "Remove Carol from stage 1" }));
    await userEvent.click(within(first).getByRole("combobox", { name: "+ Add approver" }));
    await userEvent.click(await screen.findByRole("option", { name: "Erin" }));
    const due = within(first).getByRole("spinbutton", { name: "Stage 1 due within" });
    await userEvent.clear(due);
    await userEvent.type(due, "5");

    await userEvent.click(screen.getByRole("button", { name: "Save workflow" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    const [saved] = savedStages(posted[0]!);
    expect(saved!.approvers).toEqual(["mock-user-dave", "mock-user-grace", "mock-user-erin"]);
    expect(saved!.quorum).toBe("majority");
    expect(saved!.slaDays).toBe(5);
  });

  it("words the due box as working days and counts the number (A9, working days)", async () => {
    openEditor();
    await screen.findByRole("heading", { level: 1 });
    const first = stage(1);
    expect(within(first).getByText("Due within")).toBeInTheDocument();
    expect(within(first).getByText("working days")).toBeInTheDocument();
    const due = within(first).getByRole("spinbutton", { name: "Stage 1 due within" });
    await userEvent.clear(due);
    await userEvent.type(due, "1");
    expect(within(first).getByText("working day")).toBeInTheDocument();
    expect(within(first).queryByText("working days")).not.toBeInTheDocument();
  });

  it("explains the count from the site calendar under the box", async () => {
    openEditor();
    await screen.findByRole("heading", { level: 1 });
    const first = stage(1);
    const due = within(first).getByRole("spinbutton", { name: "Stage 1 due within" });
    const helper = within(first).getByText(/Counts whole working days from the site calendar/);
    expect(due).toHaveAccessibleDescription(helper.textContent!);
    expect(helper).toHaveTextContent("Mon–Fri, 1 holiday, Europe/London");
  });

  it("still explains the count when the calendar could not be read", async () => {
    openEditor({ calendar: null });
    await screen.findByRole("heading", { level: 1 });
    const helper = within(stage(1)).getByText(/Counts whole working days from the site calendar/);
    expect(helper).not.toHaveTextContent("Europe/London");
  });

  it("reorders stages from the keyboard on the grip", async () => {
    const posted = openEditor();
    await screen.findByRole("heading", { level: 1 });
    within(stage(2)).getByRole("button", { name: "Move stage 2" }).focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(within(stage(1)).getByDisplayValue("Final approval")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Save workflow" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(savedStages(posted[0]!).map((entry) => entry.name)).toEqual([
      "Final approval",
      "Finance review",
    ]);
  });

  it("says it's a draft until every stage has an approver", async () => {
    openEditor({
      workflow: {
        ...WORKFLOW,
        stages: [{ ...WORKFLOW.stages[0], approvers: [] }],
      },
    });
    expect(await screen.findByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Not usable yet — draft")).toBeInTheDocument();
  });

  it("adds a stage, duplicates the workflow and keeps delete off while in use", async () => {
    const posted = openEditor();
    await screen.findByRole("heading", { level: 1 });
    await userEvent.click(screen.getByRole("button", { name: "+ Add stage" }));
    expect(screen.getByRole("group", { name: "Stage 3" })).toBeInTheDocument();

    const remove = screen.getByRole("button", { name: "Delete workflow" });
    expect(remove).toBeDisabled();
    expect(remove).toHaveAttribute("title", "In use by 1 group");

    await userEvent.click(screen.getByRole("button", { name: "Duplicate workflow" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]!.get("intent")).toBe("duplicate");
  });

  it("deletes an unused workflow after asking", async () => {
    const posted = openEditor({ usedBy: 0 });
    await userEvent.click(await screen.findByRole("button", { name: "Delete workflow" }));
    const dialog = screen.getByRole("dialog", { name: "Delete Finance sign-off?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete workflow" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]!.get("intent")).toBe("delete");
  });
});

describe("Veto approvers in the workflow editor (steward-web#256)", () => {
  it("is off by default, with nothing to mark until it is turned on", async () => {
    openEditor();
    const toggle = await screen.findByRole("checkbox", { name: "Allow veto approvers" });
    expect(toggle).not.toBeChecked();
    expect(screen.queryByRole("checkbox", { name: /^Can veto/ })).toBeNull();
  });

  it("marks a user and a group seat once it is on, and saves them with the stages", async () => {
    const posted = openEditor();
    await userEvent.click(await screen.findByRole("checkbox", { name: "Allow veto approvers" }));
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Can veto: Dave (Finance review)" }),
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Can veto: Approvers group (Final approval)" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Save workflow" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    const form = posted[0]!;
    expect(form.get("vetoEnabled")).toBe("on");
    const stages = JSON.parse(String(form.get("stagesJson"))) as {
      vetoApproverIds?: string[];
      vetoGroupIds?: string[];
    }[];
    expect(stages[0]?.vetoApproverIds).toEqual(["mock-user-dave"]);
    expect(stages[1]?.vetoGroupIds).toEqual(["g-approvers"]);
  });

  it("shows what the workflow already holds", async () => {
    openEditor({
      veto: {
        enabled: true,
        stages: { "s-1": { vetoApproverIds: ["mock-user-grace"], vetoGroupIds: [] } },
      },
    });
    expect(await screen.findByRole("checkbox", { name: "Allow veto approvers" })).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Can veto: Grace (Finance review)" }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Can veto: Dave (Finance review)" }),
    ).not.toBeChecked();
  });

  it("sends no veto lists when none are marked", async () => {
    const posted = openEditor();
    await userEvent.click(await screen.findByRole("button", { name: "Save workflow" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]!.get("vetoEnabled")).toBeNull();
    const stages = JSON.parse(String(posted[0]!.get("stagesJson"))) as Record<string, unknown>[];
    expect(stages.every((stage) => !("vetoApproverIds" in stage))).toBe(true);
  });
});
