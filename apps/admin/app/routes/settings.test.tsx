// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import Settings from "./settings";

const loaderData = {
  emailServiceConfig: {
    apiKeySet: false,
    domain: "",
    enabled: false,
    fromAddress: "",
    provider: "",
    region: "",
  },
  globalSettings: {
    announcement: { enabled: true, level: "info", message: "Hello" },
    maintenance: { enabled: false, message: "" },
  },
};

type SettingsProps = Parameters<typeof Settings>[0];

const renderSettings = (answer: (intent: string) => Record<string, unknown>) => {
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const form = await request.formData();
        return answer(String(form.get("intent")));
      },
      Component: () => <Settings {...({ loaderData } as unknown as SettingsProps)} />,
      path: "/settings",
    },
  ]);
  render(<Stub initialEntries={["/settings"]} />);
};

const saveButtons = () => screen.getAllByRole("button", { name: "Save" });

describe("Settings", () => {
  it("confirms the banners were saved", async () => {
    renderSettings((intent) => ({ intent, ok: true, saved: loaderData.globalSettings }));
    await userEvent.click(saveButtons()[0]!);
    expect(await screen.findByText("Banners saved")).toBeInTheDocument();
    expect(screen.getByText(/now show across both apps/i)).toBeInTheDocument();
  });

  it("confirms the email settings were saved", async () => {
    renderSettings((intent) => ({ intent, ok: true, saved: loaderData.emailServiceConfig }));
    await userEvent.click(saveButtons()[1]!);
    expect(await screen.findByText("Email settings saved")).toBeInTheDocument();
    expect(screen.queryByText("Banners saved")).not.toBeInTheDocument();
  });

  it("shows the refusal, not a confirmation, when the save fails", async () => {
    renderSettings((intent) => ({ error: { status: 400 }, intent, ok: false }));
    await userEvent.click(saveButtons()[0]!);
    expect(await screen.findByText("Couldn't save these banners")).toBeInTheDocument();
    expect(screen.queryByText("Banners saved")).not.toBeInTheDocument();
  });
});
