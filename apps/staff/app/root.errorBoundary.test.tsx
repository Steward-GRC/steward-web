// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { NO_ACCESS } from "@steward-web/auth";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { ErrorBoundary } from "./root";

const rootData = {
  devUiIssueCopy: false,
  gatePreview: undefined,
  identity: {
    ...NO_ACCESS,
    email: "erin@example.org",
    firstName: "Erin",
    id: "user-erin",
    lastName: "Reader",
    name: "Erin Reader",
    permissions: new Set(["policy.read"]),
    roles: ["reader"],
    username: "erin",
  },
  quickLoginOn: false,
  shell: {
    categories: [],
    config: {
      adminUrl: "/admin",
      docsUrl: "https://steward-grc.com",
      environment: null,
      organisation: "Example Organisation",
      staffUrl: "/",
    },
    counts: {},
    reporting: false,
  },
  siteSettings: null,
};

const renderAt = (path: string) => {
  const router = createMemoryRouter(
    [
      {
        children: [
          {
            loader: () => {
              throw new Response("Not Found", { status: 404 });
            },
            path: "*",
          },
        ],
        ErrorBoundary,
        id: "root",
        loader: () => rootData,
        path: "/",
      },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
};

describe("the staff app's error boundary", () => {
  it("shows Not found inside the shell, with its header and navigation (#30)", async () => {
    renderAt("/nowhere");
    expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /main|primary|sidebar/i })).toBeInTheDocument();
  });
});
