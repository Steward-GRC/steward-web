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
      vetoUserIds: ["mock-user-grace"],
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
      vetoUserIds: [],
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
  approverCandidates: {
    attached: true,
    users: [
      { id: "mock-user-dave", name: "Dave" },
      { id: "mock-user-grace", name: "Grace" },
      { id: "mock-user-erin", name: "Erin" },
    ],
  },
  calendar: CALENDAR,
  groupMembers: {},
  groupNames: { "g-approvers": "Approvers" },
  people: [
    { enabled: true, id: "mock-user-dave", name: "Dave" },
    { enabled: true, id: "mock-user-grace", name: "Grace" },
    { enabled: false, id: "mock-user-carol", name: "Carol" },
    { enabled: true, id: "mock-user-erin", name: "Erin" },
    { enabled: true, id: "mock-user-a", name: "Alice" },
    { enabled: true, id: "mock-user-b", name: "Bob" },
    { enabled: true, id: "mock-user-c", name: "Cara" },
  ],
  usedBy: 1,
  workflow: WORKFLOW,
};

type EditorProps = Parameters<typeof WorkflowEditor>[0];

const openEditor = (
  overrides: Record<string, unknown> = {},
  reply?: (form: FormData) => unknown,
) => {
  const posted: FormData[] = [];
  const loaderData = { ...BASE, ...overrides };
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const form = await request.formData();
        posted.push(form);
        return reply?.(form) ?? { intent: form.get("intent"), ok: true };
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

const refuse = async (refusal: unknown) => {
  const posted = openEditor({ usedBy: 0 }, (form) =>
    form.get("intent") === "delete" ? { intent: "delete", ok: false, refusal } : undefined,
  );
  await userEvent.click(await screen.findByRole("button", { name: "Delete workflow" }));
  const dialog = screen.getByRole("dialog", { name: "Delete Finance sign-off?" });
  await userEvent.click(within(dialog).getByRole("button", { name: "Delete workflow" }));
  return posted;
};

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
    const approvers = within(stage(1)).getByRole("list", { name: "Selected: Stage 1 approvers" });
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
    await userEvent.click(
      within(first).getByRole("button", { name: "Remove Carol · disabled — replace" }),
    );
    await userEvent.type(within(first).getByRole("combobox", { name: "Stage 1 approvers" }), "eri");
    await userEvent.click(await screen.findByRole("option", { name: /Erin/ }));
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

  it("saves a picked group as a unit in the same payload shape (bug 15)", async () => {
    const posted = openEditor({
      approverCandidates: {
        attached: true,
        users: [{ id: "mock-user-dave", name: "Dave" }],
      },
      groupMembers: { "g-approvers": ["mock-user-dave", "mock-user-root"] },
    });
    await screen.findByRole("heading", { level: 1 });
    await userEvent.type(
      within(stage(1)).getByRole("combobox", { name: "Stage 1 approvers" }),
      "appr",
    );
    await userEvent.click(await screen.findByRole("option", { name: /Approvers/ }));
    await userEvent.click(screen.getByRole("button", { name: "Save workflow" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    const [saved] = JSON.parse(String(posted[0]!.get("stagesJson"))) as {
      approvers: string[];
      groupUnits: { groupId: string; internalQuorum: string; memberUserIds: string[] }[];
    }[];
    expect(saved!.approvers).toEqual(["mock-user-dave", "mock-user-grace", "mock-user-carol"]);
    expect(saved!.groupUnits).toEqual([
      { groupId: "g-approvers", internalQuorum: "one", memberUserIds: ["mock-user-dave"] },
    ]);
  });

  it("asks to attach an unattached workflow to a category and offers no approvers (bug 15)", async () => {
    openEditor({ approverCandidates: { attached: false, users: [] } });
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getAllByText("Attach this workflow to a category first.")).toHaveLength(2);
    expect(screen.queryByRole("combobox", { name: "Stage 1 approvers" })).not.toBeInTheDocument();
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

  it("names the workflow in the confirm and cancels without posting", async () => {
    const posted = openEditor({ usedBy: 0 });
    await userEvent.click(await screen.findByRole("button", { name: "Delete workflow" }));
    const dialog = screen.getByRole("dialog", { name: "Delete Finance sign-off?" });
    expect(within(dialog).getByText(/can't be undone/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(posted).toHaveLength(0);
  });

  it("explains a refusal because groups use it, and offers no Archive", async () => {
    await refuse({ count: 2, kind: "categories" });
    expect(
      await screen.findByText("In use by 2 groups: change those categories first"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Archive workflow" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("uses the singular for one group", async () => {
    await refuse({ count: 1, kind: "categories" });
    expect(
      await screen.findByText("In use by 1 group: change those categories first"),
    ).toBeInTheDocument();
  });

  it("explains a refusal because runs or overrides used it and offers Archive", async () => {
    const posted = await refuse({ count: 6, kind: "used" });
    expect(
      await screen.findByText(
        "This workflow has been used by 6 runs or policy overrides and cannot be deleted. Archive it instead.",
      ),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Archive workflow" }));
    await vi.waitFor(() => expect(posted).toHaveLength(2));
    expect(posted[1]!.get("intent")).toBe("archive");
  });

  it("clears the refusal when the dialog is opened again", async () => {
    await refuse({ count: 2, kind: "categories" });
    await screen.findByText("In use by 2 groups: change those categories first");
    await userEvent.click(screen.getByRole("button", { name: "Delete workflow" }));
    expect(
      screen.queryByText("In use by 2 groups: change those categories first"),
    ).not.toBeInTheDocument();
  });
});

const vetoBox = (number: number) =>
  within(stage(number)).getByRole("combobox", { name: "Veto people" });
const optionNames = () => screen.queryAllByRole("option").map((option) => option.textContent);
const savedVetoes = (form: FormData) =>
  JSON.parse(String(form.get("stagesJson"))) as Record<string, unknown>[];

describe("Veto people in the workflow editor (bug log 17)", () => {
  it("has no workflow-wide veto switch", async () => {
    openEditor();
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("checkbox", { name: /veto/i })).toBeNull();
    expect(screen.queryByText("Allow veto approvers")).toBeNull();
  });

  it("labels the picker per stage and explains that one veto ends the run", async () => {
    openEditor();
    await screen.findByRole("heading", { level: 1 });
    const box = vetoBox(1);
    const helper = within(stage(1)).getByText(/If any one of them rejects/);
    expect(helper).toHaveTextContent("must be one of this stage's approvers");
    expect(helper).toHaveTextContent("the run ends as rejected");
    expect(box).toHaveAccessibleDescription(helper.textContent!);
  });

  it("shows the people who already hold a veto as chips", async () => {
    openEditor();
    await screen.findByRole("heading", { level: 1 });
    const held = within(stage(1)).getByRole("list", { name: "Selected: Veto people" });
    expect(within(held).getByText("Grace")).toBeInTheDocument();
    expect(
      within(stage(2)).getByRole("list", { name: "Selected: Veto people" }),
    ).toBeEmptyDOMElement();
  });

  it("offers only people who are currently among the stage's approvers", async () => {
    openEditor();
    await screen.findByRole("heading", { level: 1 });
    await userEvent.click(vetoBox(1));
    // Grace already holds it; Carol is a disabled approver; Erin is not an approver at all.
    expect(optionNames()).toEqual(["Dave"]);
    await userEvent.keyboard("{Escape}");
    await userEvent.click(vetoBox(2));
    // A group seat's members count, resolved to people.
    expect(optionNames()).toEqual(["Alice", "Bob", "Cara"]);
  });

  it("saves vetoUserIds on each stage and none of the old veto fields", async () => {
    const posted = openEditor();
    await screen.findByRole("heading", { level: 1 });
    await userEvent.click(vetoBox(1));
    await userEvent.click(await screen.findByRole("option", { name: "Dave" }));
    await userEvent.click(vetoBox(2));
    await userEvent.click(await screen.findByRole("option", { name: "Bob" }));
    await userEvent.click(screen.getByRole("button", { name: "Save workflow" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    const form = posted[0]!;
    const stages = savedVetoes(form);
    expect(stages[0]?.vetoUserIds).toEqual(["mock-user-grace", "mock-user-dave"]);
    expect(stages[1]?.vetoUserIds).toEqual(["mock-user-b"]);
    for (const entry of stages) {
      expect(entry).not.toHaveProperty("vetoApproverIds");
      expect(entry).not.toHaveProperty("vetoGroupIds");
    }
    expect(form.has("vetoEnabled")).toBe(false);
  });

  it("sends an empty vetoUserIds when a stage's last veto person is removed", async () => {
    const posted = openEditor();
    await screen.findByRole("heading", { level: 1 });
    const held = within(stage(1)).getByRole("list", { name: "Selected: Veto people" });
    await userEvent.click(within(held).getByRole("button", { name: "Remove Grace" }));
    await userEvent.click(screen.getByRole("button", { name: "Save workflow" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(savedVetoes(posted[0]!)[0]?.vetoUserIds).toEqual([]);
  });

  it("drops a veto person when they leave the approver pool, and says so", async () => {
    const posted = openEditor();
    await screen.findByRole("heading", { level: 1 });
    await userEvent.click(
      within(within(stage(1)).getByRole("list", { name: "Selected: Stage 1 approvers" })).getByRole(
        "button",
        { name: "Remove Grace" },
      ),
    );
    const note = within(stage(1)).getByText(/Grace is no longer an approver of this stage/);
    expect(note).toHaveTextContent("so was removed from its veto people");
    expect(note).toHaveAttribute("role", "status");
    const held = within(stage(1)).getByRole("list", { name: "Selected: Veto people" });
    expect(within(held).queryByText("Grace")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Save workflow" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(savedVetoes(posted[0]!)[0]?.vetoUserIds).toEqual([]);
  });

  it("keeps the veto people when someone else leaves the pool", async () => {
    openEditor();
    await screen.findByRole("heading", { level: 1 });
    await userEvent.click(
      within(within(stage(1)).getByRole("list", { name: "Selected: Stage 1 approvers" })).getByRole(
        "button",
        { name: "Remove Dave" },
      ),
    );
    const held = within(stage(1)).getByRole("list", { name: "Selected: Veto people" });
    expect(within(held).getByText("Grace")).toBeInTheDocument();
    expect(within(stage(1)).queryByText(/no longer an approver/)).toBeNull();
  });
});
