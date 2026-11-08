// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AboutDiagnostics } from "./AboutDiagnostics";

const open = (version: null | object) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => (version ? Response.json(version) : new Response("nope", { status: 500 }))),
  );
  const Stub = createRoutesStub([
    { Component: () => <AboutDiagnostics onOpenChange={() => {}} open />, path: "/" },
  ]);
  render(<Stub />);
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("About and diagnostics shows the builds (steward-web#217)", () => {
  it("names this app's commit and the mock's, to compare with main", async () => {
    open({ app: "staff", commit: "c0ea2a7", mock: { commit: "5d39b5c" }, version: "dev" });
    expect(await screen.findByText("Web build: c0ea2a7")).toBeInTheDocument();
    expect(await screen.findByText("Mock build: 5d39b5c")).toBeInTheDocument();
  });

  it("leaves the mock line out against a real gateway", async () => {
    open({ app: "admin", commit: "c0ea2a7", mock: null, version: "dev" });
    expect(await screen.findByText("Web build: c0ea2a7")).toBeInTheDocument();
    expect(screen.queryByText(/^Mock build/)).toBeNull();
  });

  it("shows the compiled version line even when the build route fails", async () => {
    open(null);
    expect(await screen.findByText(/^Version /)).toBeInTheDocument();
    expect(screen.queryByText(/^Web build/)).toBeNull();
  });
});
