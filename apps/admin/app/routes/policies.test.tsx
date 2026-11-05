// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import Policies from "./policies";

type PoliciesProps = Parameters<typeof Policies>[0];

describe("Catalog (A10)", () => {
  it("heads the shared library as the admin catalog", async () => {
    const Stub = createRoutesStub([
      {
        Component: () => (
          <Policies
            {...({ loaderData: { categories: [], policies: [] } } as unknown as PoliciesProps)}
          />
        ),
        path: "/policies",
      },
    ]);
    render(<Stub initialEntries={["/policies"]} />);
    expect(await screen.findByRole("heading", { level: 1, name: "Catalog" })).toBeInTheDocument();
    expect(screen.getByText("Every policy across the org.")).toBeInTheDocument();
  });

  it("turns on the library's column options (A10)", async () => {
    const Stub = createRoutesStub([
      {
        Component: () => (
          <Policies
            {...({ loaderData: { categories: [], policies: [] } } as unknown as PoliciesProps)}
          />
        ),
        path: "/policies",
      },
    ]);
    render(<Stub initialEntries={["/policies"]} />);
    expect(await screen.findByRole("button", { name: "Columns" })).toBeInTheDocument();
  });
});
