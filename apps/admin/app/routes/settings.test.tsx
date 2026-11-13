// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import Settings from "./settings";

const BASE = {
  ai: {
    credentialLast4: "9f2c",
    credentialSet: true,
    enabled: true,
    model: "tested default",
    provider: "ANTHROPIC",
    topK: 8,
  },
  emailServiceConfig: {
    apiKeySet: true,
    domain: "mail.example.org",
    enabled: false,
    fromAddress: "steward@example.org",
    provider: "postmark",
    region: "eu",
  },
  globalSettings: {
    announcement: { enabled: true, level: "info", message: "New: the Visitor Sign-in Policy." },
    maintenance: { enabled: false, message: "" },
    workCalendar: {
      holidays: [{ date: "2026-12-25", label: "Christmas Day" }],
      timezone: "Europe/London",
      weekdays: [1, 2, 3, 4, 5],
    },
  },
};

type SettingsProps = Parameters<typeof Settings>[0];

const openSettings = (
  overrides: Record<string, unknown> = {},
  answer: (form: FormData) => Record<string, unknown> = (form) => ({
    intent: form.get("intent"),
    ok: true,
  }),
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
      Component: () => <Settings {...({ loaderData } as unknown as SettingsProps)} />,
      path: "/settings",
    },
  ]);
  render(<Stub initialEntries={["/settings"]} />);
  return posted;
};

const card = (name: string) => screen.getByRole("region", { name });
const pill = (name: string) => within(card(name)).getByTestId("status-pill");
const last = (posted: FormData[]) => posted.at(-1)!;

describe("Settings (A28)", () => {
  it("has the seven cards with their status pills", async () => {
    openSettings();
    expect(await screen.findByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument();
    expect(pill("AI provider token")).toHaveTextContent("Set");
    expect(pill("AI features")).toHaveTextContent("On");
    expect(pill("AI retrieval")).toHaveTextContent("8 results");
    expect(pill("Outbound email")).toHaveTextContent("SMTP fallback");
    expect(pill("Global announcement")).toHaveTextContent("On · info");
    expect(pill("Maintenance notice")).toHaveTextContent("Off");
    // One gateway flag drives the lockdown (G11), so the card says that rather than "banner only".
    expect(
      within(card("Maintenance notice")).getByText(
        "Locks the staff app behind the maintenance screen with your message. Site admins keep the admin console, so they can turn it off.",
      ),
    ).toBeInTheDocument();
  });

  it("has a Working days card that summarises the calendar and posts it as JSON", async () => {
    const posted = openSettings();
    const working = await screen.findByRole("region", { name: "Working days" });
    expect(within(working).getByTestId("status-pill")).toHaveTextContent("Mon–Fri · Europe/London");
    await userEvent.click(within(working).getByRole("checkbox", { name: "Friday" }));
    await userEvent.click(within(working).getByRole("button", { name: "Save" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("save-work-calendar"));
    expect(JSON.parse(String(last(posted).get("workCalendar")))).toEqual({
      holidays: [{ date: "2026-12-25", label: "Christmas Day" }],
      timezone: "Europe/London",
      weekdays: [1, 2, 3, 4],
    });
  });

  it("replaces the token, and clears it only after the inline confirm (D36)", async () => {
    const posted = openSettings();
    const token = await screen.findByRole("region", { name: "AI provider token" });
    await userEvent.type(within(token).getByLabelText("New token"), "sk-new");
    await userEvent.click(within(token).getByRole("button", { name: "Replace token" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("ai-token"));
    expect(last(posted).get("token")).toBe("sk-new");

    await userEvent.click(within(token).getByRole("button", { name: "Clear token" }));
    expect(
      within(token).getByText(
        "Clear the token? This disables the AI integration for everyone until a new token is set.",
      ),
    ).toBeInTheDocument();
    const confirms = within(token).getAllByRole("button", { name: "Clear token" });
    await userEvent.click(confirms.at(-1)!);
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("ai-clear-token"));
  });

  it("turns AI off and sets the retrieval count", async () => {
    const posted = openSettings();
    await userEvent.click(
      await screen.findByRole("switch", { name: "AI features on for everyone" }),
    );
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("ai-enabled"));
    expect(last(posted).get("enabled")).toBe("false");

    const retrieval = card("AI retrieval");
    await userEvent.clear(within(retrieval).getByLabelText("Results per question"));
    await userEvent.type(within(retrieval).getByLabelText("Results per question"), "12");
    await userEvent.click(within(retrieval).getByRole("button", { name: "Save" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("ai-top-k"));
    expect(last(posted).get("topK")).toBe("12");
  });

  it("previews the announcement live as it's typed", async () => {
    openSettings();
    const announcement = await screen.findByRole("region", { name: "Global announcement" });
    const message = within(announcement).getByLabelText("Message");
    await userEvent.clear(message);
    await userEvent.type(message, "Office closed Friday");
    const preview = within(announcement).getByRole("region", {
      name: "Global announcement · live preview",
    });
    expect(within(preview).getByText("Office closed Friday")).toBeInTheDocument();
  });

  it("saves the banners and the email settings", async () => {
    const posted = openSettings();
    const maintenance = await screen.findByRole("region", { name: "Maintenance notice" });
    await userEvent.click(within(maintenance).getByRole("button", { name: "Save" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("save-global"));
    expect(last(posted).get("announcementMessage")).toBe("New: the Visitor Sign-in Policy.");
    expect(await within(maintenance).findByText("Saved!")).toBeInTheDocument();

    const email = card("Outbound email");
    expect(
      within(email).getByText(
        "A sending key is stored and can't be shown. Leave this blank to keep it.",
      ),
    ).toBeInTheDocument();
    await userEvent.click(within(email).getByRole("button", { name: "Save" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("save-email"));
  });

  it("shows the token as not set and offers no clear", async () => {
    openSettings({ ai: { ...BASE.ai, credentialLast4: "", credentialSet: false } });
    expect(await screen.findByText("Not set")).toBeInTheDocument();
    expect(
      within(card("AI provider token")).queryByRole("button", { name: "Clear token" }),
    ).not.toBeInTheDocument();
  });

  it("shows AI as off, and turns it on", async () => {
    const posted = openSettings({ ai: { ...BASE.ai, enabled: false } });
    expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(pill("AI features")).toHaveTextContent("Off");
    const toggle = screen.getByRole("switch", { name: "AI features on for everyone" });
    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await vi.waitFor(() => expect(last(posted).get("enabled")).toBe("true"));
  });

  it("leaves the AI cards out when the AI module doesn't answer", async () => {
    openSettings({ ai: null });
    expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "AI provider token" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "AI features" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "AI retrieval" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Outbound email" })).toBeInTheDocument();
  });
});

describe("AI settings on an appliance (#113)", () => {
  it("shows the AI cards read-only on an appliance, with a pointer to its own admin", async () => {
    openSettings({ appliance: "steward-box-1" });
    expect(
      await screen.findByText("AI is configured on the appliance (steward-box-1)."),
    ).toBeInTheDocument();
    expect(screen.getByText("Change it in the appliance's own admin.")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "AI features on for everyone" })).toBeDisabled();
    expect(screen.getByLabelText("New token")).toBeDisabled();
    expect(screen.getByLabelText("Results per question")).toBeDisabled();
  });

  it("leaves the AI cards editable when the deployment is not an appliance", async () => {
    openSettings({ appliance: null });
    expect(
      await screen.findByRole("switch", { name: "AI features on for everyone" }),
    ).toBeEnabled();
    expect(screen.getByLabelText("New token")).toBeEnabled();
    expect(screen.queryByText(/configured on the appliance/)).toBeNull();
  });
});

const HARD_RESET = {
  names: { "u-ada": "Ada Admin", "u-root": "Rosa Root" },
  requests: [
    {
      approvalExpiresAt: null,
      approvedAt: null,
      approvedBy: null,
      cancelledAt: null,
      consumedAt: null,
      consumedBy: null,
      expiresAt: "2026-11-14T10:00:00Z",
      id: "req-1",
      module: "compliance",
      reason: "End of the pilot",
      requestedAt: "2026-11-13T10:00:00Z",
      requestedBy: "u-root",
      state: "pending",
    },
  ],
  viewer: { id: "u-ada", isRoot: false },
};
const APPROVED_RESET = {
  ...HARD_RESET,
  requests: [
    {
      ...HARD_RESET.requests[0]!,
      approvedAt: "2026-11-13T11:00:00Z",
      approvedBy: "u-ada",
      state: "approved",
    },
  ],
  viewer: { id: "u-root", isRoot: true },
};

describe("Settings: the Compliance module", () => {
  it("has no Compliance or Hard reset card for someone who cannot use them", async () => {
    openSettings({ compliance: null, hardReset: null });
    await screen.findByRole("heading", { level: 1, name: "Settings" });
    expect(screen.queryByRole("region", { name: "Compliance module" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Hard reset of compliance data" }),
    ).not.toBeInTheDocument();
  });

  it("shows the module as On and posts the switch only once confirmed", async () => {
    const posted = openSettings({ compliance: { moduleEnabled: true } });
    await screen.findByRole("heading", { level: 1, name: "Settings" });
    expect(pill("Compliance module")).toHaveTextContent("On");
    await userEvent.click(screen.getByRole("switch", { name: "Compliance module on" }));
    expect(posted).toHaveLength(0);
    const dialog = await screen.findByRole("dialog", { name: "Turn the Compliance module off?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Turn off" }));
    expect(last(posted).get("intent")).toBe("compliance-module");
    expect(last(posted).get("enabled")).toBe("false");
  });

  it("shows the module as Off and turns it on", async () => {
    const posted = openSettings({ compliance: { moduleEnabled: false } });
    await screen.findByRole("heading", { level: 1, name: "Settings" });
    expect(pill("Compliance module")).toHaveTextContent("Off");
    await userEvent.click(screen.getByRole("switch", { name: "Compliance module on" }));
    const dialog = await screen.findByRole("dialog", { name: "Turn the Compliance module on?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Turn on" }));
    expect(last(posted).get("enabled")).toBe("true");
  });

  it("words a refused change from its code", async () => {
    openSettings({ compliance: { moduleEnabled: true } }, (form) => ({
      complianceError: "MODULE_OFF",
      failure: {},
      intent: form.get("intent"),
      ok: false,
    }));
    await screen.findByRole("heading", { level: 1, name: "Settings" });
    await userEvent.click(screen.getByRole("switch", { name: "Compliance module on" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Turn off" }));
    expect(
      await within(card("Compliance module")).findByText(
        "The Compliance module is off, so this was refused.",
      ),
    ).toBeVisible();
  });
});

describe("Settings: the hard reset", () => {
  it("lets another site admin approve a request from the list", async () => {
    const posted = openSettings({
      compliance: { moduleEnabled: false },
      hardReset: HARD_RESET,
    });
    await screen.findByRole("heading", { level: 1, name: "Settings" });
    const region = card("Hard reset of compliance data");
    expect(within(region).getByText(/Asked by Rosa Root/)).toBeVisible();
    await userEvent.click(within(region).getByRole("button", { name: "Approve" }));
    expect(last(posted).get("intent")).toBe("hard-reset-approve");
    expect(last(posted).get("requestId")).toBe("req-1");
  });

  it("lets root ask with a reason", async () => {
    const posted = openSettings({
      compliance: { moduleEnabled: false },
      hardReset: { ...HARD_RESET, requests: [], viewer: { id: "u-root", isRoot: true } },
    });
    await screen.findByRole("heading", { level: 1, name: "Settings" });
    await userEvent.type(screen.getByRole("textbox", { name: "Reason" }), "End of the pilot");
    await userEvent.click(screen.getByRole("button", { name: "Request hard reset" }));
    expect(last(posted).get("intent")).toBe("hard-reset-request");
    expect(last(posted).get("reason")).toBe("End of the pilot");
  });

  it("runs an approved request with the phrase and the export tick", async () => {
    const posted = openSettings({
      compliance: { moduleEnabled: false },
      hardReset: APPROVED_RESET,
    });
    await screen.findByRole("heading", { level: 1, name: "Settings" });
    await userEvent.click(screen.getByRole("button", { name: "Run the reset" }));
    const dialog = await screen.findByRole("dialog", { name: "Delete all compliance data?" });
    await userEvent.type(within(dialog).getByRole("textbox"), "RESET COMPLIANCE DATA");
    await userEvent.click(within(dialog).getByRole("checkbox"));
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Delete all compliance data" }),
    );
    expect(last(posted).get("intent")).toBe("hard-reset-execute");
    expect(last(posted).get("requestId")).toBe("req-1");
    expect(last(posted).get("confirmation")).toBe("RESET COMPLIANCE DATA");
    expect(last(posted).get("exportAcknowledged")).toBe("true");
  });

  it("shows how many cases a reset deleted", async () => {
    openSettings({ compliance: { moduleEnabled: false }, hardReset: APPROVED_RESET }, (form) => ({
      intent: form.get("intent"),
      ok: true,
      result: { approvedBy: "u-ada", casesDeleted: 42, requestedBy: "u-root" },
    }));
    await screen.findByRole("heading", { level: 1, name: "Settings" });
    await userEvent.click(screen.getByRole("button", { name: "Run the reset" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(within(dialog).getByRole("textbox"), "RESET COMPLIANCE DATA");
    await userEvent.click(within(dialog).getByRole("checkbox"));
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Delete all compliance data" }),
    );
    expect(
      await screen.findByText("42 cases were deleted. Asked by Rosa Root, approved by Ada Admin."),
    ).toBeVisible();
  });

  it("explains a legal hold in plain words", async () => {
    openSettings({ compliance: { moduleEnabled: false }, hardReset: APPROVED_RESET }, (form) => ({
      complianceError: "HARD_RESET_LEGAL_HOLD",
      failure: {},
      intent: form.get("intent"),
      ok: false,
    }));
    await screen.findByRole("heading", { level: 1, name: "Settings" });
    await userEvent.click(screen.getByRole("button", { name: "Run the reset" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(within(dialog).getByRole("textbox"), "RESET COMPLIANCE DATA");
    await userEvent.click(within(dialog).getByRole("checkbox"));
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Delete all compliance data" }),
    );
    expect(await screen.findByText(/legal hold, so nothing was deleted/)).toBeVisible();
  });
});
