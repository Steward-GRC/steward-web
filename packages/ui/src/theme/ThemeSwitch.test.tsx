// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { PREFERENCES_STORAGE_KEY } from "./preferences";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeSwitch } from "./ThemeSwitch";

const renderSwitch = () =>
  render(
    <ThemeProvider>
      <ThemeSwitch />
    </ThemeProvider>,
  );

describe("ThemeSwitch", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("offers light, dark, high contrast and follow my system, in that order", () => {
    renderSwitch();
    const group = screen.getByRole("radiogroup", { name: "Theme" });
    const names = within(group)
      .getAllByRole("radio")
      .map((radio) => radio.textContent);
    expect(names).toEqual(["Light", "Dark", "High contrast", "Follow my system"]);
  });

  it("follows the system until someone picks a theme", async () => {
    renderSwitch();
    await waitFor(() => expect(document.documentElement).toHaveClass("system"));
    expect(screen.getByRole("radio", { name: "Follow my system" })).toBeChecked();
  });

  it("switches the page to the chosen theme and saves it to this browser", async () => {
    renderSwitch();
    await userEvent.click(screen.getByRole("radio", { name: "Dark" }));
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    expect(document.documentElement).not.toHaveClass("system");
    expect(JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "{}")).toMatchObject({
      theme: "dark",
    });

    await userEvent.click(screen.getByRole("radio", { name: "High contrast" }));
    await waitFor(() => expect(document.documentElement).toHaveClass("hc"));
    expect(document.documentElement).not.toHaveClass("dark");

    await userEvent.click(screen.getByRole("radio", { name: "Light" }));
    await waitFor(() => expect(document.documentElement).toHaveClass("light"));
  });

  it("starts on the saved theme", async () => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ theme: "hc" }));
    renderSwitch();
    await waitFor(() => expect(screen.getByRole("radio", { name: "High contrast" })).toBeChecked());
  });
});
