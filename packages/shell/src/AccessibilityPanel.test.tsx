// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ThemeProvider } from "@steward-web/ui";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccessibilityPanel } from "./AccessibilityPanel";

const openPanel = () =>
  render(
    <ThemeProvider>
      <AccessibilityPanel />
    </ThemeProvider>,
  );

const html = () => document.documentElement;

/** A browser that can read aloud, recording what it's asked to do. */
const speech = () => {
  const calls: string[] = [];
  const synth = {
    cancel: vi.fn(() => calls.push("cancel")),
    getVoices: () => [{ lang: "en-GB", name: "Kate", voiceURI: "kate" }],
    pause: vi.fn(() => calls.push("pause")),
    resume: vi.fn(() => calls.push("resume")),
    speak: vi.fn((utterance: { rate: number; text: string; voice: { name: string } | null }) =>
      calls.push(`speak:${utterance.text}:${utterance.rate}:${utterance.voice?.name ?? ""}`),
    ),
  };
  vi.stubGlobal("speechSynthesis", synth);
  vi.stubGlobal(
    "SpeechSynthesisUtterance",
    class {
      rate = 1;
      text: string;
      voice: unknown = null;
      constructor(text: string) {
        this.text = text;
      }
    },
  );
  return calls;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Accessibility options (H12)", () => {
  it("is titled, and says its choices save to this browser", () => {
    openPanel();
    expect(screen.getByRole("heading", { name: "Accessibility options" })).toBeVisible();
    expect(screen.getByText("Preferences save to this browser.")).toBeVisible();
  });

  it("sizes the text: Small, Default, Large or X-Large", async () => {
    openPanel();
    const sizes = screen.getByRole("radiogroup", { name: "Text size" });
    expect(within(sizes).getByRole("radio", { name: "Default" })).toBeChecked();
    await userEvent.click(within(sizes).getByRole("radio", { name: "Large" }));
    expect(html().dataset.textSize).toBe("large");
  });

  it("switches high contrast, reduced motion, readable spacing and underlined links", async () => {
    openPanel();
    await userEvent.click(screen.getByRole("switch", { name: "High contrast" }));
    expect(html()).toHaveClass("hc");
    await userEvent.click(screen.getByRole("switch", { name: "Reduce motion" }));
    expect(html()).toHaveAttribute("data-reduce-motion");
    await userEvent.click(screen.getByRole("switch", { name: "Readable spacing" }));
    expect(html()).toHaveAttribute("data-readable-spacing");
    await userEvent.click(screen.getByRole("switch", { name: "Underline links" }));
    expect(html()).toHaveAttribute("data-underline-links");
    await userEvent.click(screen.getByRole("switch", { name: "High contrast" }));
    expect(html()).not.toHaveClass("hc");
  });

  it("resets every choice", async () => {
    openPanel();
    await userEvent.click(screen.getByRole("switch", { name: "Underline links" }));
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(html()).not.toHaveAttribute("data-underline-links");
    expect(screen.getByRole("switch", { name: "Underline links" })).not.toBeChecked();
  });

  it("reads the page's main content aloud, at the chosen speed and voice", async () => {
    const calls = speech();
    const main = document.createElement("main");
    main.textContent = "Book a desk ahead.";
    document.body.append(main);
    try {
      openPanel();
      const read = screen.getByRole("group", { name: "Read aloud" });
      await userEvent.selectOptions(within(read).getByRole("combobox", { name: "Voice" }), "Kate");
      fireEvent.change(within(read).getByRole("slider", { name: "Speed" }), {
        target: { value: "1.25" },
      });
      await userEvent.click(within(read).getByRole("button", { name: "Read" }));
      await userEvent.click(within(read).getByRole("button", { name: "Pause" }));
      await userEvent.click(within(read).getByRole("button", { name: "Resume" }));
      await userEvent.click(within(read).getByRole("button", { name: "Stop" }));
      expect(calls).toEqual([
        "cancel",
        "speak:Book a desk ahead.:1.25:Kate",
        "pause",
        "resume",
        "cancel",
      ]);
    } finally {
      main.remove();
    }
  });

  it("says when this browser can't read aloud", () => {
    vi.stubGlobal("speechSynthesis", null);
    openPanel();
    expect(screen.getByText("Read aloud isn't available in this browser.")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Read" })).toBeNull();
  });
});
