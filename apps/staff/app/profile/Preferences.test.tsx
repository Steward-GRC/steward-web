// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ThemeProvider } from "@steward-web/ui";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { Preferences } from "./Preferences";

const openPreferences = (locale?: string) => {
  const posted: FormData[] = [];
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        posted.push(await request.formData());
        return null;
      },
      Component: () => (
        <ThemeProvider>
          <Preferences locale={locale} />
        </ThemeProvider>
      ),
      path: "/profile/preferences",
    },
  ]);
  render(<Stub initialEntries={["/profile/preferences"]} />);
  return posted;
};

describe("Profile: preferences (U34)", () => {
  it("holds the theme choice", async () => {
    openPreferences();
    const theme = await screen.findByRole("region", { name: "Theme" });
    expect(within(theme).getByRole("radiogroup", { name: "Theme" })).toBeVisible();
  });

  it("matches the browser's language until one is chosen", async () => {
    openPreferences();
    const language = await screen.findByRole("region", { name: "Language" });
    expect(within(language).getByRole("combobox", { name: "Display language" })).toHaveTextContent(
      "Match my browser · English",
    );
  });

  it("saves a chosen language to the account, and clears it back to the browser's", async () => {
    const posted = openPreferences();
    await userEvent.click(await screen.findByRole("combobox", { name: "Display language" }));
    await userEvent.click(screen.getByRole("option", { name: "English" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(Object.fromEntries(posted[0]!)).toEqual({ intent: "set-locale", locale: "en" });
  });

  it("shows the saved language", async () => {
    openPreferences("en");
    expect(await screen.findByRole("combobox", { name: "Display language" })).toHaveTextContent(
      "English",
    );
  });
});
