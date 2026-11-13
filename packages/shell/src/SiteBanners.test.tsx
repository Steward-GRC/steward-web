// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { GlobalSettings } from "@steward-web/api-client";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { SiteBanners } from "./SiteBanners";

const settings = (overrides: Partial<GlobalSettings> = {}): GlobalSettings => ({
  announcement: { enabled: false, level: "info", message: "" },
  maintenance: { enabled: false, message: "" },
  workCalendar: { holidays: [], timezone: "UTC", weekdays: [1, 2, 3, 4, 5] },
  ...overrides,
});

/** The strip whose text includes `text`. */
const stripOf = (text: string) =>
  screen.getAllByRole("status").find((strip) => strip.textContent?.includes(text));

afterEach(() => localStorage.clear());

describe("SiteBanners (H5, H6)", () => {
  it("shows nothing when the settings couldn't be read", () => {
    const { container } = render(<SiteBanners settings={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows nothing while both banners are off", () => {
    const { container } = render(
      <SiteBanners
        settings={settings({
          announcement: { enabled: false, level: "info", message: "Hidden" },
          maintenance: { enabled: false, message: "Also hidden" },
        })}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the maintenance notice as a full-width warn strip with its title (H6)", () => {
    render(
      <SiteBanners
        settings={settings({
          maintenance: { enabled: true, message: "Planned downtime Sat 4 Oct, 20:00–22:00." },
        })}
      />,
    );
    const strip = stripOf("Planned downtime")!;
    expect(strip).toHaveAttribute("data-tone", "warn");
    expect(strip).toHaveClass("bg-warn");
    expect(screen.getByText("Maintenance notice").tagName).toBe("B");
  });

  it("shows an info announcement as a soft info strip with no title, dismissible (H5)", async () => {
    render(
      <SiteBanners
        settings={settings({
          announcement: {
            enabled: true,
            level: "info",
            message: "New: the Visitor Sign-in Policy is now live.",
          },
        })}
      />,
    );
    const strip = stripOf("Visitor Sign-in Policy")!;
    expect(strip).toHaveAttribute("data-tone", "info");
    expect(strip).toHaveClass("bg-info-soft");
    expect(screen.queryByText("Announcement")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Dismiss announcement" }));
    expect(screen.queryByText(/Visitor Sign-in Policy/)).toBeNull();
  });

  it("keeps a dismissed announcement hidden, but shows a new one", () => {
    localStorage.setItem("steward.announcement.dismissed", "Old news.");
    const { unmount } = render(
      <SiteBanners
        settings={settings({
          announcement: { enabled: true, level: "info", message: "Old news." },
        })}
      />,
    );
    expect(screen.queryByText("Old news.")).toBeNull();
    unmount();
    render(
      <SiteBanners
        settings={settings({
          announcement: { enabled: true, level: "info", message: "Fresh news." },
        })}
      />,
    );
    expect(screen.getByText("Fresh news.")).toBeInTheDocument();
  });

  it("shows a warning announcement as a warn strip that can't be dismissed", () => {
    render(
      <SiteBanners
        settings={settings({
          announcement: { enabled: true, level: "warning", message: "Acknowledge by Friday." },
        })}
      />,
    );
    expect(stripOf("Acknowledge by Friday.")).toHaveAttribute("data-tone", "warn");
    expect(screen.queryByRole("button", { name: "Dismiss announcement" })).toBeNull();
  });

  it("shows both at once, maintenance first", () => {
    render(
      <SiteBanners
        settings={settings({
          announcement: { enabled: true, level: "info", message: "Hello" },
          maintenance: { enabled: true, message: "Downtime" },
        })}
      />,
    );
    expect(screen.getAllByRole("status").map((strip) => strip.dataset.tone)).toEqual([
      "warn",
      "info",
    ]);
  });

  it("leaves out an enabled banner with no message", () => {
    const { container } = render(
      <SiteBanners
        settings={settings({ maintenance: { enabled: true, message: " ".repeat(3) } })}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
