// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import Mcp, { loader } from "./mcp";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("the reserved MCP page (#113)", () => {
  it("is a 404 until the flag is on", async () => {
    const thrown: unknown = await loader({
      request: new Request("https://admin.steward.example/mcp"),
    } as never).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(404);
  });

  it("says what will live here and where tokens are registered", async () => {
    const Stub = createRoutesStub([{ Component: Mcp, path: "/mcp" }]);
    render(<Stub initialEntries={["/mcp"]} />);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Agent access (MCP)" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Not available yet")).toBeInTheDocument();
    expect(
      screen.getByText(/People register their own agent tokens in their profile/),
    ).toBeInTheDocument();
  });
});
