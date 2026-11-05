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
  },
};

type SettingsProps = Parameters<typeof Settings>[0];

const openSettings = (overrides: Record<string, unknown> = {}) => {
  const posted: FormData[] = [];
  const loaderData = { ...BASE, ...overrides };
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const form = await request.formData();
        posted.push(form);
        return { intent: form.get("intent"), ok: true };
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
  it("has the six cards with their status pills", async () => {
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
