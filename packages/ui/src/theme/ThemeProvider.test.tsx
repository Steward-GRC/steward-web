// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDate, setDatePreference } from "@steward-web/i18n";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { parsePreferences, PREFERENCES_BOOT_SCRIPT, PREFERENCES_STORAGE_KEY } from "./preferences";
import { ThemeProvider, usePreferences } from "./ThemeProvider";

const Probe = () => {
  const { reset, update } = usePreferences();
  return (
    <>
      <button onClick={() => update({ textSize: "large", theme: "dark" })} type="button">
        dark
      </button>
      <button onClick={reset} type="button">
        reset
      </button>
    </>
  );
};

describe("ThemeProvider", () => {
  it("applies and saves a choice", async () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "dark" }));
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    expect(document.documentElement.dataset.textSize).toBe("large");
    expect(JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "{}")).toMatchObject({
      textSize: "large",
      theme: "dark",
    });
  });

  it("starts from what's saved and resets to the system theme", async () => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ theme: "hc" }));
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveClass("hc"));
    await userEvent.click(screen.getByRole("button", { name: "reset" }));
    await waitFor(() => expect(document.documentElement).toHaveClass("system"));
    expect(document.documentElement).not.toHaveClass("hc");
  });
});

describe("parsePreferences", () => {
  it("ignores junk", () => {
    expect(parsePreferences("not json").theme).toBe("system");
    expect(parsePreferences(JSON.stringify({ textSize: "x-small" })).textSize).toBe("x-small");
    expect(parsePreferences(JSON.stringify({ textSize: "huge", theme: "neon" }))).toMatchObject({
      textSize: "default",
      theme: "system",
    });
  });
});

describe("the boot script", () => {
  it("applies the saved theme before the first paint", () => {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ reduceMotion: true, theme: "dark" }),
    );
    new Function(PREFERENCES_BOOT_SCRIPT)();
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement).toHaveAttribute("data-reduce-motion");
  });
});

const Dates = () => {
  const { update } = usePreferences();
  return (
    <>
      <button onClick={() => update({ dateFormat: "iso" })} type="button">
        iso
      </button>
      <output>{formatDate(new Date(2026, 9, 2, 12, 0), { locale: "en" })}</output>
    </>
  );
};

describe("the date format preference", () => {
  afterEach(() => {
    setDatePreference("system");
    localStorage.clear();
  });

  it("shows dates in the system default, then in the saved choice once it is made", async () => {
    render(
      <ThemeProvider>
        <Dates />
      </ThemeProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("2 Oct 2026");
    await userEvent.click(screen.getByRole("button", { name: "iso" }));
    expect(screen.getByRole("status")).toHaveTextContent("2026-10-02");
    expect(JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "{}")).toMatchObject({
      dateFormat: "iso",
    });
  });

  it("reads the saved choice and falls back to the default for anything unknown", () => {
    expect(parsePreferences(JSON.stringify({ dateFormat: "mdy" })).dateFormat).toBe("mdy");
    expect(parsePreferences(JSON.stringify({ dateFormat: "weird" })).dateFormat).toBe("system");
    expect(parsePreferences(null).dateFormat).toBe("system");
  });
});
