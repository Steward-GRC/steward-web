// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import UserDetail from "./users.$userId";

const ERIN = {
  deletedAt: null,
  email: "erin@example.org",
  enabled: true,
  groupIds: [],
  idpGroups: [],
  isRoot: false,
  localAccount: true,
  mergedIntoUserId: null,
  name: "Erin",
  policyOverrides: [{ effect: "DENY", policyNumber: "POL-TRAVEL-000001" }],
  roles: [],
  userId: "mock-user-erin",
  username: "erin",
};

const NOW = Date.now();
const iso = (msAgo: number) => new Date(NOW - msAgo).toISOString();

const SESSIONS = [
  {
    active: true,
    authenticatedAt: iso(60_000),
    clientIp: "192.0.2.14",
    expiresAt: new Date(NOW + 3_600_000).toISOString(),
    issuedAt: iso(60_000),
    lastSeenAt: iso(5000),
    sessionId: "s-1",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
    userId: "mock-user-erin",
  },
  {
    active: false,
    authenticatedAt: "2026-09-28T09:00:00Z",
    clientIp: "198.51.100.22",
    expiresAt: "2026-09-29T09:00:00Z",
    issuedAt: "2026-09-28T09:00:00Z",
    lastSeenAt: "2026-09-28T10:00:00Z",
    sessionId: "s-2",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    userId: "mock-user-erin",
  },
];

const PREVIEW = {
  blocksDelete: false,
  counts: {
    breakGlassGrants: 0,
    groupMemberships: 2,
    idpGroups: 1,
    managedGroups: 0,
    ownedPolicies: 3,
    pendingApprovals: 0,
    permissions: 0,
    policyOverrides: 1,
    raciGrants: 2,
    roles: 1,
  },
  items: [],
  locallyAuthenticable: true,
  userId: "mock-user-erin",
  warnings: [],
};

const BASE = {
  deletionPreview: PREVIEW,
  factors: [
    { enrolledAt: "2026-10-02T09:00:00Z", id: "totp", kind: "totp", label: "Work phone" },
    { enrolledAt: null, id: "email", kind: "email", label: null },
  ],
  people: [
    { id: "mock-user-dave", name: "Dave" },
    { id: "mock-user-alice", name: "Alice" },
  ],
  policies: [
    { number: "POL-TRAVEL-000001", title: "Travel Booking Policy" },
    { number: "POL-EXPENSES-000002", title: "Expense Claims Policy" },
  ],
  rootName: "Alice",
  sessions: SESSIONS,
  user: ERIN,
  viewerIsRoot: true,
};

type DetailProps = Parameters<typeof UserDetail>[0];

const openDetail = (
  tab: string,
  overrides: Record<string, unknown> = {},
  answer: (form: FormData) => object = (form) => ({ intent: form.get("intent"), ok: true }),
) => {
  const posted: FormData[] = [];
  const loaderData = { ...BASE, ...overrides };
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const form = await request.formData();
        posted.push(form);
        return answer(form);
      },
      Component: () => <UserDetail {...({ loaderData } as unknown as DetailProps)} />,
      path: "/users/:userId",
    },
  ]);
  render(<Stub initialEntries={[`/users/mock-user-erin?tab=${tab}`]} />);
  return posted;
};

const last = (posted: FormData[]) => posted.at(-1)!;

describe("the user detail header and tabs (A17 to A20)", () => {
  it("reads 'Erin · erin@example.org · Reader' with the four tabs", async () => {
    openDetail("profile");
    expect(await screen.findByRole("heading", { level: 1, name: "Erin" })).toBeInTheDocument();
    expect(screen.getByText("erin@example.org · Reader")).toBeInTheDocument();
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Profile",
      "Security",
      "Roles & access",
      "Advanced",
    ]);
    expect(screen.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true");
  });
});

describe("Profile (A17)", () => {
  it("resets the password and shows the new one once (D24)", async () => {
    const posted = openDetail("profile", {}, (form) =>
      form.get("intent") === "reset-password"
        ? { intent: "reset-password", ok: true, password: "a-new-test-password" }
        : { intent: form.get("intent"), ok: true },
    );
    await userEvent.click(await screen.findByRole("button", { name: "Generate & reset" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("reset-password"));

    const dialog = await screen.findByRole("dialog", { name: "New password for Erin" });
    expect(
      within(dialog).getByText("Copy this now — it won't be shown again."),
    ).toBeInTheDocument();
    const field = within(dialog).getByLabelText("Password");
    expect(field).toHaveAttribute("type", "password");
    expect(field).toHaveValue("a-new-test-password");
    await userEvent.click(within(dialog).getByRole("button", { name: "Show" }));
    expect(field).toHaveAttribute("type", "text");
    await userEvent.click(within(dialog).getByRole("button", { name: "I've copied it" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("sends the welcome email again", async () => {
    const posted = openDetail("profile");
    await userEvent.click(await screen.findByRole("button", { name: "Resend welcome email" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("resend-welcome"));
  });

  it("shows a directory account's name and email read-only, with the reason (#109)", async () => {
    openDetail("profile", { user: { ...ERIN, localAccount: false } });
    expect(
      await screen.findByText(
        "Display name, email and password are managed in the directory and can't be edited here. Change them there.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Display name")).toHaveValue("Erin");
    expect(screen.getByLabelText("Display name")).toBeDisabled();
    expect(screen.getByLabelText("Email")).toHaveValue("erin@example.org");
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Generate & reset" })).not.toBeInTheDocument();
  });

  it("keeps a local account's name and email editable (#109)", async () => {
    openDetail("profile");
    expect(await screen.findByLabelText("Display name")).toBeEnabled();
    expect(screen.getByLabelText("Email")).toBeEnabled();
  });
});

describe("Security (A18)", () => {
  it("lists the second factors with Rename and Reset, and the email code without them", async () => {
    const posted = openDetail("security");
    const list = await screen.findByRole("list", { name: "Second factors" });
    const [totp, email] = within(list).getAllByRole("listitem");
    expect(within(totp!).getByText("Work phone")).toBeInTheDocument();
    expect(within(totp!).getByText("Authenticator app · Added 2 Oct 2026")).toBeInTheDocument();
    expect(within(email!).getByText("Email code")).toBeInTheDocument();
    expect(within(email!).queryByRole("button")).not.toBeInTheDocument();

    await userEvent.click(within(totp!).getByRole("button", { name: "Reset" }));
    const dialog = screen.getByRole("dialog", { name: "Reset Work phone?" });
    expect(
      within(dialog).getByText(
        "This removes the method — the user must set it up again the next time they sign in.",
      ),
    ).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Reset" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("reset-factor"));
    expect(last(posted).get("methodId")).toBe("totp");
  });

  it("renames a factor", async () => {
    const posted = openDetail("security");
    await userEvent.click(await screen.findByRole("button", { name: "Rename" }));
    const dialog = screen.getByRole("dialog", { name: "Rename Work phone" });
    const field = within(dialog).getByLabelText("Name");
    await userEvent.clear(field);
    await userEvent.type(field, "Old phone");
    await userEvent.click(within(dialog).getByRole("button", { name: "Rename" }));
    await vi.waitFor(() => expect(last(posted).get("label")).toBe("Old phone"));
    expect(last(posted).get("intent")).toBe("rename-factor");
  });

  it("says when only the email code is left", async () => {
    openDetail("security", { factors: [BASE.factors[1]] });
    expect(
      await screen.findByText(
        "No authenticator or passkey enrolled — this user relies on their email code only.",
      ),
    ).toBeInTheDocument();
  });
});

describe("Roles & access (A19)", () => {
  it("shows the reader baseline, the three elevated roles and the policy exceptions", async () => {
    const posted = openDetail("roles");
    expect(
      await screen.findByText("Baseline — every enabled user is a Reader."),
    ).toBeInTheDocument();
    for (const role of ["Site admin", "Template admin", "Compliance admin"]) {
      expect(screen.getByRole("checkbox", { name: role })).not.toBeChecked();
    }
    const exceptions = screen.getByRole("list", { name: "Policy access" });
    expect(within(exceptions).getByText("Travel Booking Policy")).toBeInTheDocument();
    expect(within(exceptions).getByText("Deny")).toBeInTheDocument();

    await userEvent.click(
      within(exceptions).getByRole("button", {
        name: "Remove the exception for Travel Booking Policy",
      }),
    );
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("remove-exception"));
    expect(last(posted).get("policyNumber")).toBe("POL-TRAVEL-000001");
  });

  it("adds an exception", async () => {
    const posted = openDetail("roles", { user: { ...ERIN, policyOverrides: [] } });
    expect(
      await screen.findByText("No exceptions — this user can see every policy."),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("combobox", { name: "Policy" }));
    await userEvent.click(await screen.findByRole("option", { name: "Expense Claims Policy" }));
    await userEvent.click(screen.getByRole("radio", { name: "Allow" }));
    await userEvent.click(screen.getByRole("button", { name: "Add exception" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("add-exception"));
    expect(last(posted).get("policyNumber")).toBe("POL-EXPENSES-000002");
    expect(last(posted).get("effect")).toBe("ALLOW");
  });

  it("says root has all permissions instead of the toggles", async () => {
    openDetail("roles", { user: { ...ERIN, isRoot: true, roles: ["site-admin"] } });
    expect(await screen.findByText("Root has all permissions.")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});

describe("Advanced (A20)", () => {
  it("acts as the user with a reason (D19)", async () => {
    const posted = openDetail("advanced");
    expect(
      await screen.findByText("See exactly what Erin sees, for up to 30 minutes."),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Act as Erin" }));
    const dialog = screen.getByRole("dialog", { name: "Act as Erin?" });
    const go = within(dialog).getByRole("button", { name: "Act as Erin" });
    expect(go).toBeDisabled();
    await userEvent.type(
      within(dialog).getByLabelText("Reason (required)"),
      "Erin can't see the Travel category.",
    );
    await userEvent.click(go);
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("act-as"));
    expect(last(posted).get("reason")).toBe("Erin can't see the Travel category.");
  });

  it("lists sessions as status, browser and address, and time; Log out user asks first (D23)", async () => {
    const posted = openDetail("advanced");
    const sessions = await screen.findByRole("list", { name: "Sessions" });
    const [active, expired] = within(sessions).getAllByRole("listitem");
    expect(within(active!).getByText("Active")).toBeInTheDocument();
    expect(within(active!).getByText("Firefox · Linux")).toBeInTheDocument();
    expect(within(active!).getByText("192.0.2.14")).toBeInTheDocument();
    expect(within(expired!).getByText("Expired")).toBeInTheDocument();
    expect(within(expired!).getByText("Safari · iOS")).toBeInTheDocument();
    expect(within(expired!).getByText("28 Sept")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Log out user" }));
    const dialog = screen.getByRole("dialog", { name: "Log out Erin?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Log out user" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("revoke-sessions"));
  });

  it("lets only the current root transfer root, through an emailed code (D22, D18)", async () => {
    const posted = openDetail("advanced");
    expect(
      await screen.findByText(
        "There is only one root. Making this user the root moves the seat from you, and you stay a site admin.",
      ),
    ).toBeInTheDocument();
    await userEvent.click(await screen.findByRole("button", { name: "Make this user the root" }));
    const dialog = screen.getByRole("dialog", { name: "Transfer root to Erin?" });
    expect(
      within(dialog).getByText(
        "There is only one root. Erin takes the seat and you stop being root in the same step. You stay a site admin.",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Next: confirm with an email code.")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Transfer root" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("send-step-up"));

    const stepUp = await screen.findByRole("dialog", { name: "Confirm it's you" });
    await userEvent.type(within(stepUp).getByRole("textbox"), "482113");
    await userEvent.click(within(stepUp).getByRole("button", { name: "Confirm" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("make-root"));
    expect(last(posted).get("otp")).toBe("482113");
  });

  it("names the current root when someone else views it", async () => {
    openDetail("advanced", { viewerIsRoot: false });
    expect(
      await screen.findByText("Only the current root (Alice) can do this."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Make this user the root" })).toBeNull();
  });

  it("deletes after the preview, the reassignment and the typed email (D20, D17)", async () => {
    const posted = openDetail("advanced");
    await userEvent.click(await screen.findByRole("button", { name: "Delete user" }));
    const dialog = screen.getByRole("dialog", { name: "Delete Erin?" });
    expect(within(dialog).getByText("Owned policies")).toBeInTheDocument();
    expect(within(dialog).getByText("Rule grants")).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole("combobox", { name: "Re-assign all to" }));
    await userEvent.click(await screen.findByRole("option", { name: "Dave" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Re-assign" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("reassign"));
    expect(last(posted).get("toUserId")).toBe("mock-user-dave");

    await userEvent.click(within(dialog).getByRole("button", { name: "Continue to delete" }));
    const confirm = screen.getByRole("dialog", { name: "Delete Erin?" });
    const remove = within(confirm).getByRole("button", { name: "Delete user" });
    expect(remove).toBeDisabled();
    await userEvent.type(
      within(confirm).getByLabelText("Type erin@example.org to confirm"),
      "erin@example.org",
    );
    await userEvent.click(remove);
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("delete"));
  });

  it("won't continue while the delete is blocked, and says what to clear", async () => {
    openDetail("advanced", {
      deletionPreview: {
        ...PREVIEW,
        blocksDelete: true,
        counts: { ...PREVIEW.counts, pendingApprovals: 1 },
        items: [
          {
            blocksDelete: true,
            detail: "Final approval",
            kind: "PENDING_APPROVAL",
            label: "Expense Claims Policy",
            refId: "r-1",
          },
        ],
      },
    });
    await userEvent.click(await screen.findByRole("button", { name: "Delete user" }));
    const dialog = screen.getByRole("dialog", { name: "Delete Erin?" });
    expect(within(dialog).getByText("This account can't be deleted yet")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Clear these first: Expense Claims Policy · Final approval"),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Continue to delete" })).toBeDisabled();
  });
});
