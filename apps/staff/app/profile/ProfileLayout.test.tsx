// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { ProfileLayout } from "./ProfileLayout";

describe("Your profile's tabs (U32–U35)", () => {
  it("gives each part its own address, and marks the one open", async () => {
    const Stub = createRoutesStub([
      {
        children: [{ Component: () => <p>security page</p>, path: "security" }],
        Component: ProfileLayout,
        path: "/profile",
      },
    ]);
    render(<Stub initialEntries={["/profile/security"]} />);
    const tabs = await screen.findByRole("navigation", { name: "Profile" });
    expect(
      within(tabs)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["Name", "/profile"],
      ["Security", "/profile/security"],
      ["Preferences", "/profile/preferences"],
      ["Notifications", "/profile/notifications"],
    ]);
    expect(within(tabs).getByRole("link", { name: "Security" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByText("security page")).toBeVisible();
  });

  it("uses the same page gutter as the other pages, with no width cap (bug log 23)", async () => {
    const Stub = createRoutesStub([{ Component: ProfileLayout, path: "/profile" }]);
    render(<Stub initialEntries={["/profile"]} />);
    const page = await screen.findByTestId("profile-page");
    expect(page).toHaveClass("px-4", "sm:px-8");
    expect(page.className).not.toMatch(/max-w-|mx-auto/);
  });
});
