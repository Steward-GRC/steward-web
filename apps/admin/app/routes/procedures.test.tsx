// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import Procedures from "./procedures";

type ProceduresProps = Parameters<typeof Procedures>[0];

describe("Procedures (A10)", () => {
  it("turns on the library's column options, as the catalog does", async () => {
    const Stub = createRoutesStub([
      {
        Component: () => (
          <Procedures
            {...({ loaderData: { categories: [], policies: [] } } as unknown as ProceduresProps)}
          />
        ),
        path: "/procedures",
      },
    ]);
    render(<Stub initialEntries={["/procedures"]} />);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Procedures" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Columns" })).toBeInTheDocument();
  });
});
