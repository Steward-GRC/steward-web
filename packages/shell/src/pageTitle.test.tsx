// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { PageTitle, pageTitle } from "./pageTitle";

const titles = {
  "routes/policies": "shell:titles.staff.policies",
  "routes/policy": "shell:titles.staff.policy",
};

describe("pageTitle", () => {
  it("names the deepest page that has a title, then Steward", () => {
    expect(pageTitle(titles, [{ id: "root" }, { id: "routes/policies" }])).toBe(
      "Policies · Steward",
    );
    expect(pageTitle(titles, [{ id: "root" }, { id: "routes/policy" }])).toBe("Policy · Steward");
  });

  it("falls back to Steward alone on a page without a title", () => {
    expect(pageTitle(titles, [{ id: "root" }])).toBe("Steward");
    expect(pageTitle(titles, [{ id: "root" }, { id: "routes/unknown" }])).toBe("Steward");
  });
});

describe("PageTitle", () => {
  it("titles the document after the page that is showing", async () => {
    const router = createMemoryRouter(
      [
        {
          children: [{ element: <p>page</p>, id: "routes/policies", path: "policies" }],
          element: <PageTitle titles={titles} />,
          id: "root",
          path: "/",
        },
      ],
      { initialEntries: ["/policies"] },
    );
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(document.title).toBe("Policies · Steward"));
  });
});
