// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { createRoutesStub, useLoaderData } from "react-router";
import { describe, expect, it } from "vitest";

import Drafts from "./drafts";

type Props = Parameters<typeof Drafts>[0];

const Page = () => <Drafts {...({ loaderData: useLoaderData() } as unknown as Props)} />;

describe("My drafts", () => {
  it("writes the updated date in the app's date style, not as the stored timestamp", async () => {
    const Stub = createRoutesStub([
      {
        Component: Page,
        loader: () => ({
          drafts: [
            { id: "d1", number: "POL-001", title: "Expense Claims", updated: "2026-10-02T12:00:00Z" },
            { id: "d2", number: "", title: "Untitled", updated: null },
          ],
        }),
        path: "/drafts",
      },
    ]);
    render(<Stub initialEntries={["/drafts"]} />);
    expect(await screen.findByText("2 Oct 2026")).toBeInTheDocument();
    expect(screen.queryByText("2026-10-02T12:00:00Z")).not.toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });
});
