// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ComponentStatus } from "@steward-web/api-client";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CopyDiagnostics } from "./CopyDiagnostics";

const diagnosticsResponse = Response.json({
  data: {
    diagnostics: {
      actor: { actingAs: null, id: "u-1", roles: ["site-admin"], username: "admin-one" },
      appliance: null,
      gateway: { commit: "g1", name: "gateway", status: ComponentStatus.Ok, version: "v1.0.0" },
      generatedAt: "2026-01-01T00:00:00Z",
      release: "v0.1.0",
      services: [],
      thirdParty: [],
      traceId: "trace-1",
    },
  },
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const renderButton = () =>
  render(
    <MemoryRouter initialEntries={["/policies/42"]}>
      <CopyDiagnostics />
    </MemoryRouter>,
  );

describe("CopyDiagnostics", () => {
  it("reads the diagnostics query over /query and copies the report to the clipboard", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(diagnosticsResponse.clone());
    vi.stubGlobal("fetch", fetchSpy);
    const writeText = vi.fn<(text: string) => Promise<void>>().mockImplementation(async () => {});
    vi.stubGlobal("navigator", { clipboard: { writeText }, userAgent: "test-agent" });

    renderButton();
    await userEvent.click(screen.getByRole("button", { name: "Copy diagnostics" }));

    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
    const call = writeText.mock.calls[0];
    expect(call).toBeDefined();
    const [copiedText] = call!;
    expect(copiedText).toContain("Steward diagnostics");
    expect(copiedText).toContain("Route: /policies/42");
    expect(copiedText).toContain("Actor id: u-1");
    expect(copiedText).toContain("Gateway version: v1.0.0");

    const fetchCall = fetchSpy.mock.calls[0] as [string, RequestInit] | undefined;
    expect(fetchCall).toBeDefined();
    expect(fetchCall![0]).toBe("/query");
  });

  it("marks Steward unavailable, never failing the copy, when the read errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const writeText = vi.fn<(text: string) => Promise<void>>().mockImplementation(async () => {});
    vi.stubGlobal("navigator", { clipboard: { writeText }, userAgent: "test-agent" });

    renderButton();
    await userEvent.click(screen.getByRole("button", { name: "Copy diagnostics" }));

    await waitFor(() => expect(writeText).toHaveBeenCalled());
    const call = writeText.mock.calls[0];
    expect(call).toBeDefined();
    const [copiedText] = call!;
    expect(copiedText).toContain("Steward: unavailable");
  });

  it("shows the fallback text area when the clipboard refuses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(diagnosticsResponse.clone()));
    const writeText = vi.fn().mockRejectedValue(new Error("clipboard refused"));
    vi.stubGlobal("navigator", { clipboard: { writeText }, userAgent: "test-agent" });

    renderButton();
    await userEvent.click(screen.getByRole("button", { name: "Copy diagnostics" }));

    const textarea = await screen.findByRole<HTMLTextAreaElement>("textbox");
    expect(textarea.value).toContain("Steward diagnostics");
  });
});
