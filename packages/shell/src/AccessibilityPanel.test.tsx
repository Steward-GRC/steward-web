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

  it("sizes the text: X-Small, Small, Default, Large or X-Large", async () => {
    openPanel();
    const sizes = screen.getByRole("radiogroup", { name: "Text size" });
    expect(
      within(sizes)
        .getAllByRole("radio")
        .map((radio) => radio.getAttribute("value")),
    ).toEqual(["x-small", "small", "default", "large", "x-large"]);
    expect(within(sizes).getByRole("radio", { name: "Default" })).toBeChecked();
    await userEvent.click(within(sizes).getByRole("radio", { name: "Large" }));
    expect(html().dataset.textSize).toBe("large");
    await userEvent.click(within(sizes).getByRole("radio", { name: "X-Small" }));
    expect(html().dataset.textSize).toBe("x-small");
  });

  it("previews each size in its pill, in even small steps, and lets the pill grow (#155)", () => {
    openPanel();
    const sizes = screen.getByRole("radiogroup", { name: "Text size" });
    const px: number[] = [];
    for (const name of ["X-Small", "Small", "Default", "Large", "X-Large"]) {
      // The label's text sits straight in its pill.
      const pill = within(sizes).getByText(name);
      expect(pill.className).not.toMatch(/(^|\s)h-\[/);
      expect(pill.className).toMatch(/min-h-/);
      px.push(Number(/text-\[(\d+)px\]/.exec(pill.className)![1]));
    }
    const gaps = px.slice(1).map((value, index) => value - px[index]!);
    expect(new Set(gaps).size).toBe(1);
    expect(Math.max(...px)).toBeLessThanOrEqual(15);
  });

  it("sets the tab transition beside the display switches: None, Current or Smooth (#154)", async () => {
    openPanel();
    const group = screen.getByRole("radiogroup", { name: "Tab transition" });
    expect(
      within(group)
        .getAllByRole("radio")
        .map((radio) => radio.getAttribute("value")),
    ).toEqual(["none", "current", "smooth"]);
    // Nothing chosen: it follows reduced motion, which is off here.
    expect(within(group).getByRole("radio", { name: "Current" })).toBeChecked();
    await userEvent.click(within(group).getByRole("radio", { name: "Smooth" }));
    expect(html().dataset.tabTransition).toBe("smooth");
    await userEvent.click(within(group).getByRole("radio", { name: "None" }));
    expect(html().dataset.tabTransition).toBe("none");
  });

  it("fits every text size label in its pill: one label size, a pill that can grow (#155)", () => {
    openPanel();
    const sizes = screen.getByRole("radiogroup", { name: "Text size" });
    for (const name of ["X-Small", "Small", "Default", "Large", "X-Large"]) {
      // The label's text sits straight in its pill.
      const pill = within(sizes).getByText(name);
      expect(pill.className).not.toMatch(/(^|\s)h-\[/);
      expect(pill.className).toMatch(/min-h-/);
      expect(pill.className).not.toMatch(/text-(lg|base|\[10px\])/);
    }
  });

  it("sets the tab transition beside the display switches: None, Current or Smooth (#154)", async () => {
    openPanel();
    const group = screen.getByRole("radiogroup", { name: "Tab transition" });
    expect(
      within(group)
        .getAllByRole("radio")
        .map((radio) => radio.getAttribute("value")),
    ).toEqual(["none", "current", "smooth"]);
    // Nothing chosen: it follows reduced motion, which is off here.
    expect(within(group).getByRole("radio", { name: "Current" })).toBeChecked();
    await userEvent.click(within(group).getByRole("radio", { name: "Smooth" }));
    expect(html().dataset.tabTransition).toBe("smooth");
    await userEvent.click(within(group).getByRole("radio", { name: "None" }));
    expect(html().dataset.tabTransition).toBe("none");
  });

  it("picks the theme: System, Light or Dark", async () => {
    openPanel();
    const themes = screen.getByRole("radiogroup", { name: "Theme" });
    expect(within(themes).getByRole("radio", { name: "System" })).toBeChecked();
    await userEvent.click(within(themes).getByRole("radio", { name: "Dark" }));
    expect(html()).toHaveClass("dark");
    await userEvent.click(within(themes).getByRole("radio", { name: "Light" }));
    expect(html()).toHaveClass("light");
    expect(html()).not.toHaveClass("dark");
  });

  it("leaves no theme picked while high contrast is on, and a pick turns it off", async () => {
    openPanel();
    await userEvent.click(screen.getByRole("switch", { name: "High contrast" }));
    const themes = screen.getByRole("radiogroup", { name: "Theme" });
    expect(within(themes).queryByRole("radio", { checked: true })).toBeNull();
    await userEvent.click(within(themes).getByRole("radio", { name: "Dark" }));
    expect(html()).toHaveClass("dark");
    expect(html()).not.toHaveClass("hc");
    expect(screen.getByRole("switch", { name: "High contrast" })).not.toBeChecked();
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

  it("reads the document, not the tabs and banners around it, when the page marks one", async () => {
    const calls = speech();
    const main = document.createElement("main");
    main.innerHTML =
      '<nav>Definitions Related</nav><article data-read-aloud="">Wash hands often.</article>';
    document.body.append(main);
    try {
      openPanel();
      await userEvent.click(screen.getByRole("button", { name: "Read" }));
      expect(calls).toEqual(["cancel", "speak:Wash hands often.:1:"]);
    } finally {
      main.remove();
    }
  });

  it("queues a long text in sentences, so the browser doesn't cut it off", async () => {
    const calls = speech();
    const sentence = "Every visitor signs in at the front desk before entering the building.";
    const main = document.createElement("main");
    main.textContent = Array.from({ length: 12 }, () => sentence).join(" ");
    document.body.append(main);
    try {
      openPanel();
      await userEvent.click(screen.getByRole("button", { name: "Read" }));
      const spoken = calls.filter((call) => call.startsWith("speak:"));
      expect(spoken.length).toBeGreaterThan(1);
      for (const call of spoken) expect(call.length).toBeLessThan(260);
      expect(spoken.map((call) => call.split(":", 2)[1]).join(" ")).toBe(
        Array.from({ length: 12 }, () => sentence).join(" "),
      );
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
