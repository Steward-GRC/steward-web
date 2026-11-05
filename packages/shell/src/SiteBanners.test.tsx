// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { GlobalSettings } from "@steward-web/api-client";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteBanners } from "./SiteBanners";

const settings = (overrides: Partial<GlobalSettings> = {}): GlobalSettings => ({
  announcement: { enabled: false, level: "info", message: "" },
  maintenance: { enabled: false, message: "" },
  ...overrides,
});

/** The banner (a status region) whose text includes `text`, by its tone. */
const toneOf = (text: string) =>
  screen.getAllByRole("status").find((banner) => banner.textContent?.includes(text))?.dataset.tone;

describe("SiteBanners", () => {
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

  it("shows an enabled announcement at the info level", () => {
    render(
      <SiteBanners
        settings={settings({
          announcement: { enabled: true, level: "info", message: "New travel policy is live." },
        })}
      />,
    );
    expect(screen.getByText("Announcement")).toBeInTheDocument();
    expect(toneOf("New travel policy is live.")).toBe("info");
  });

  it("shows an announcement at the warning level as a warning", () => {
    render(
      <SiteBanners
        settings={settings({
          announcement: { enabled: true, level: "warning", message: "Acknowledge by Friday." },
        })}
      />,
    );
    expect(toneOf("Acknowledge by Friday.")).toBe("warn");
  });

  it("shows an enabled maintenance message as a maintenance warning", () => {
    render(
      <SiteBanners
        settings={settings({
          maintenance: { enabled: true, message: "Down for upgrades Saturday 02:00 UTC." },
        })}
      />,
    );
    expect(screen.getByText("Scheduled maintenance")).toBeInTheDocument();
    expect(toneOf("Down for upgrades Saturday 02:00 UTC.")).toBe("warn");
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
    const titles = screen
      .getAllByText(/Announcement|Scheduled maintenance/)
      .map((title) => title.textContent);
    expect(titles).toEqual(["Scheduled maintenance", "Announcement"]);
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
