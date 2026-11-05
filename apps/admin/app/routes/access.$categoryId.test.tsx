// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { AckTrigger, RaciGrant, RaciSubjectKind } from "@steward-web/api-client";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { AccessView } from "../access/access.server";

import CategoryAccessRoute from "./access.$categoryId";

const rule = (
  subjectKind: RaciSubjectKind,
  subjectRef: string,
  grants: [RaciGrant, RaciGrant, RaciGrant, RaciGrant],
) => ({
  ack: grants[1],
  approve: grants[2],
  author: grants[3],
  read: grants[0],
  subjectKind,
  subjectRef,
});

const A = RaciGrant.Allow;
const D = RaciGrant.Deny;
const B = RaciGrant.Blank;

const VIEW: AccessView = {
  ackTrigger: AckTrigger.OnChange,
  canEdit: true,
  categoryId: "c-expenses",
  inherited: [{ from: "Finance", rules: [rule(RaciSubjectKind.Everyone, "", [A, B, B, B])] }],
  name: "Expenses",
  names: { "mock-user-erin": "Erin" },
  owners: [
    { from: null, id: "mock-user-dave", name: "Dave" },
    { from: "Finance", id: "mock-user-grace", name: "Grace" },
  ],
  path: ["Finance", "Expenses"],
  people: [
    { email: "bob@example.org", id: "mock-user-bob", name: "Bob" },
    { email: "erin@example.org", id: "mock-user-erin", name: "Erin" },
  ],
  rules: [
    rule(RaciSubjectKind.Group, "Finance team", [A, A, A, A]),
    rule(RaciSubjectKind.User, "mock-user-erin", [B, B, D, D]),
    rule(RaciSubjectKind.Group, "All staff", [A, B, B, B]),
  ],
};

const DECISION = {
  ack: true,
  ackReason: "rule #1 allow group Finance team",
  approve: false,
  approveReason: "↳ Finance #1 deny user mock-user-erin",
  author: true,
  authorReason: "owner (auto read/approve/author)",
  read: true,
  readReason: "rule #1 allow group Finance team",
};

type RouteProps = Parameters<typeof CategoryAccessRoute>[0];

const SIMULATED: object = { decision: DECISION };

const renderAccess = (view: AccessView | null = VIEW, simulation = SIMULATED) => {
  const posted: FormData[] = [];
  const simulated: URLSearchParams[] = [];
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const form = await request.formData();
        posted.push(form);
        return form.get("intent") === "save-rules"
          ? { intent: "save-rules", ok: true, rules: JSON.parse(String(form.get("rules"))) }
          : { intent: String(form.get("intent")), ok: true };
      },
      Component: () => (
        <CategoryAccessRoute {...({ loaderData: { view } } as unknown as RouteProps)} />
      ),
      path: "/access/:categoryId",
    },
    {
      loader: ({ request }) => {
        simulated.push(new URL(request.url).searchParams);
        return simulation;
      },
      path: "/resources/access-simulate",
    },
  ]);
  render(<Stub initialEntries={["/access/c-expenses"]} />);
  return { posted, simulated };
};

const rows = () => screen.getAllByRole("row").slice(1);

describe("the category access page (A5)", () => {
  it("opens with the category's path, the title and the subtitle", () => {
    renderAccess();
    expect(screen.getByText("Finance › Expenses")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Category access" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Per-category RACI firewall rules — who can read, acknowledge, approve, and author.",
      ),
    ).toBeInTheDocument();
  });

  it("lists the direct owners with a remove button and the inherited ones locked", async () => {
    const { posted } = renderAccess();
    expect(screen.getByText("Grace · Inherited from Finance (read-only).")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove Grace as an owner" }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Edit rules" }));
    await userEvent.click(screen.getByRole("button", { name: "Remove Dave as an owner" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]!.get("intent")).toBe("remove-owner");
    expect(posted[0]!.get("userId")).toBe("mock-user-dave");
  });

  it("saves the acknowledgement trigger as soon as it changes", async () => {
    const { posted } = renderAccess();
    const trigger = screen.getByRole("radiogroup", { name: "Acknowledgement trigger" });
    expect(within(trigger).getByRole("radio", { name: "On change" })).toBeChecked();
    expect(screen.getByText("Saved · re-asks on Major versions")).toBeInTheDocument();

    await userEvent.click(within(trigger).getByRole("radio", { name: "On publish" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]!.get("intent")).toBe("ack-trigger");
    expect(posted[0]!.get("ackTriggers")).toBe("ON_PUBLISH");
  });

  it("shows each rule's subject and its four cells, then the inherited rows, locked", () => {
    renderAccess();
    const table = screen.getByRole("table", { name: "Rules" });
    const header = within(table)
      .getAllByRole("columnheader")
      .map((cell) => cell.textContent);
    expect(header).toEqual([
      "#",
      "",
      "Subject",
      "Read R",
      "Acknowledge A",
      "Approve C",
      "Author I",
    ]);

    const [first, second, , inherited] = rows();
    expect(within(first!).getByText("Group")).toBeInTheDocument();
    expect(within(first!).getByText("Finance team")).toBeInTheDocument();
    expect(
      within(first!).getByRole("button", { name: "Read for Finance team: Allow" }),
    ).toHaveTextContent("Allow");
    expect(
      within(first!).getByRole("button", { name: "Read for Finance team: Allow" }),
    ).toContainElement(within(first!).getAllByTestId("grant-allow")[0]!);
    expect(within(second!).getByText("Person")).toBeInTheDocument();
    expect(within(second!).getByText("Erin")).toBeInTheDocument();
    expect(
      within(second!).getByRole("button", { name: "Approve for Erin: Deny" }),
    ).toHaveTextContent("Deny");
    expect(within(second!).getByRole("button", { name: "Read for Erin: Blank" })).toHaveTextContent(
      "·",
    );

    expect(within(inherited!).getByText("Everyone", { selector: "b" })).toBeInTheDocument();
    expect(within(inherited!).getByText("from Finance")).toBeInTheDocument();
    expect(within(inherited!).getByLabelText("Inherited")).toBeInTheDocument();
    expect(within(inherited!).queryByRole("button")).not.toBeInTheDocument();
    expect(within(inherited!).getByText("Read: Allow")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Default: deny anything left blank · rules inherit down; own rules override ancestor rules.",
      ),
    ).toBeInTheDocument();
    const legend = screen.getByRole("note", { name: "Legend" });
    expect(legend).toHaveTextContent("click or Space cycles · → →");
    expect(within(legend).getAllByTestId("grant-allow")).toHaveLength(2);
  });

  it("keeps the cells still until editing starts", async () => {
    renderAccess();
    expect(screen.getByRole("button", { name: "Read for Finance team: Allow" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Save rules" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Edit rules" }));
    expect(screen.getByRole("button", { name: "Read for Finance team: Allow" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Save rules" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.getByRole("button", { name: "Read for Finance team: Allow" })).toBeDisabled();
  });

  it("cycles a cell on a click and on Space: allow, deny, blank", async () => {
    renderAccess();
    await userEvent.click(screen.getByRole("button", { name: "Edit rules" }));
    await userEvent.click(screen.getByRole("button", { name: "Read for Finance team: Allow" }));
    const cell = screen.getByRole("button", { name: "Read for Finance team: Deny" });
    cell.focus();
    await userEvent.keyboard(" ");
    expect(
      screen.getByRole("button", { name: "Read for Finance team: Blank" }),
    ).toBeInTheDocument();
  });

  it("reorders with the keyboard, marks the moved row and saves the new order", async () => {
    const { posted } = renderAccess();
    await userEvent.click(screen.getByRole("button", { name: "Edit rules" }));
    screen.getByRole("button", { name: "Move rule 2 up" }).focus();
    await userEvent.keyboard("{Enter}");

    const [first, second] = rows();
    expect(within(first!).getByText("Erin")).toBeInTheDocument();
    expect(within(first!).getByText("moved up")).toBeInTheDocument();
    expect(within(second!).getByText("Finance team")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Move rule 1 up" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Save rules" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]!.get("intent")).toBe("save-rules");
    const saved = JSON.parse(String(posted[0]!.get("rules"))) as { subjectRef: string }[];
    expect(saved.map((entry) => entry.subjectRef)).toEqual([
      "mock-user-erin",
      "Finance team",
      "All staff",
    ]);
    await vi.waitFor(() => expect(screen.queryByText("moved up")).not.toBeInTheDocument());
  });

  it("adds a rule for a group at the bottom of the category's own rules", async () => {
    renderAccess();
    await userEvent.click(screen.getByRole("button", { name: "Edit rules" }));
    await userEvent.click(screen.getByRole("button", { name: "+ Add rule" }));
    const dialog = screen.getByRole("dialog", { name: "Add rule" });
    await userEvent.click(within(dialog).getByRole("radio", { name: "Group" }));
    await userEvent.type(within(dialog).getByLabelText("Group name"), "Auditors");
    await userEvent.click(within(dialog).getByRole("button", { name: "Add rule" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const fourth = rows()[3]!;
    expect(within(fourth).getByText("Auditors")).toBeInTheDocument();
    expect(within(fourth).getByRole("button", { name: "Read for Auditors: Blank" })).toBeEnabled();
  });

  it("removes a rule", async () => {
    renderAccess();
    await userEvent.click(screen.getByRole("button", { name: "Edit rules" }));
    await userEvent.click(screen.getByRole("button", { name: "Remove rule 3" }));
    expect(screen.queryByText("All staff")).not.toBeInTheDocument();
  });

  it("says default deny applies when the category has no rules of its own", () => {
    renderAccess({ ...VIEW, rules: [] });
    expect(screen.getByText("No rules — default deny applies to everyone.")).toBeInTheDocument();
  });

  it("is view only for a template admin: a pill and every control disabled", () => {
    renderAccess({ ...VIEW, canEdit: false });
    expect(screen.getByText("View only")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit rules" })).not.toBeInTheDocument();
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
    expect(screen.getByRole("button", { name: "Read for Finance team: Allow" })).toBeDisabled();
  });

  it("says when the category doesn't exist", () => {
    renderAccess(null);
    expect(screen.getByText("Category not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to the directory" })).toHaveAttribute(
      "href",
      "/groups",
    );
  });
});

describe("the simulator (A5)", () => {
  it("starts on everyone's baseline and explains each verdict", async () => {
    const { simulated } = renderAccess();
    const simulator = screen.getByRole("region", { name: "Simulator" });
    expect(within(simulator).getByText("LIVE · before save")).toBeInTheDocument();
    expect(within(simulator).getByRole("combobox", { name: "Person" })).toHaveTextContent(
      "Everyone (baseline)",
    );

    const read = await within(simulator).findByRole("group", { name: "Read / view" });
    expect(within(read).getByText("Yes")).toBeInTheDocument();
    expect(within(read).getByTestId("grant-allow")).toBeInTheDocument();
    expect(within(read).getByText("via membership in Finance team · rule #1")).toBeInTheDocument();
    const approve = within(simulator).getByRole("group", { name: "Can approve" });
    expect(within(approve).getByText("No")).toBeInTheDocument();
    expect(within(approve).getByTestId("grant-deny")).toBeInTheDocument();
    expect(within(approve).getByText("Finance rule #1 · Erin")).toBeInTheDocument();
    const author = within(simulator).getByRole("group", { name: "Can author" });
    expect(within(author).getByText("owner-granted")).toBeInTheDocument();

    expect(simulated[0]!.get("category")).toBe("c-expenses");
    expect(simulated[0]!.get("user")).toBe("");
  });

  it("reruns with the unsaved rules as they change, and for the person picked", async () => {
    const { simulated } = renderAccess();
    await vi.waitFor(() => expect(simulated).toHaveLength(1));

    await userEvent.click(screen.getByRole("button", { name: "Edit rules" }));
    await userEvent.click(screen.getByRole("button", { name: "Read for All staff: Allow" }));
    await vi.waitFor(() => expect(simulated).toHaveLength(2));
    const draft = JSON.parse(simulated[1]!.get("rules")!) as { read: string }[];
    expect(draft[2]!.read).toBe("DENY");

    await userEvent.click(screen.getByRole("combobox", { name: "Person" }));
    await userEvent.click(await screen.findByRole("option", { name: "Bob · bob@example.org" }));
    await vi.waitFor(() => expect(simulated.at(-1)!.get("user")).toBe("mock-user-bob"));
  });

  it("says so when the simulator couldn't run, and keeps the page", async () => {
    renderAccess(VIEW, { failure: { status: 503 } });
    const simulator = screen.getByRole("region", { name: "Simulator" });
    expect(await within(simulator).findByText("Couldn't run the simulator")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Rules" })).toBeInTheDocument();
  });
});
