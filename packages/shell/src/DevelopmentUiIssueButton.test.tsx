// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DEFAULT_PREFERENCES, PREFERENCES_STORAGE_KEY } from "@steward-web/ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DevelopmentUiIssueButton } from "./DevelopmentUiIssueButton";
import { getLastClicked, resetLastClickedForTests } from "./uiIssueClickTracker";
import { recordUiIssueError, resetUiIssueErrorsForTests } from "./uiIssueErrorStore";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  resetUiIssueErrorsForTests();
  globalThis.localStorage.clear();
});

const renderButton = ({ enabled = true, initialPath = "/policies/42" } = {}) => {
  const router = createMemoryRouter(
    [
      {
        element: <DevelopmentUiIssueButton app="staff" enabled={enabled} />,
        id: "routes/policy",
        path: "/policies/:number",
      },
    ],
    { initialEntries: [initialPath] },
  );
  return render(<RouterProvider router={router} />);
};

describe("DevelopmentUiIssueButton", () => {
  it("renders nothing when disabled, even though the build carried its code", () => {
    const { container } = renderButton({ enabled: false });
    expect(container).toBeEmptyDOMElement();
  });

  it("copies a schema-v1 bundle naming this route's pattern and params", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue();
    vi.stubGlobal("navigator", { clipboard: { writeText }, userAgent: "test-agent" });

    renderButton();
    await userEvent.click(screen.getByRole("button", { name: "Copy for UI issue" }));

    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
    const [copiedText] = writeText.mock.calls[0]!;
    const bundle = JSON.parse(copiedText);
    expect(bundle).toMatchObject({
      app: "staff",
      path: "/policies/:number",
      product: "steward",
      route: "routes/policy",
      ua: "test-agent",
      v: 1,
    });
    expect(bundle).not.toHaveProperty("role");
    // "42" is a policy number, not a ULID or UUID, so it never reaches params.
    expect(bundle).not.toHaveProperty("params");
  });

  it("includes the last clicked element's data-testid, never its text", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue();
    vi.stubGlobal("navigator", { clipboard: { writeText }, userAgent: "test-agent" });

    document.body.innerHTML = '<button data-testid="secret-reveal">my-secret</button>';
    renderButton();
    await userEvent.click(screen.getByTestId("secret-reveal"));
    await userEvent.click(screen.getByRole("button", { name: "Copy for UI issue" }));

    const [copiedText] = writeText.mock.calls[0]!;
    const bundle = JSON.parse(copiedText);
    expect(bundle.clicked).toBe("[data-testid=secret-reveal]");
    expect(copiedText).not.toContain("my-secret");
  });

  it("includes a previously recorded error, redacted, as lastErr", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue();
    vi.stubGlobal("navigator", { clipboard: { writeText }, userAgent: "test-agent" });
    recordUiIssueError("fetch", "failed for shane.froebel@example.com");

    renderButton();
    await userEvent.click(screen.getByRole("button", { name: "Copy for UI issue" }));

    const [copiedText] = writeText.mock.calls[0]!;
    const bundle = JSON.parse(copiedText);
    expect(bundle.lastErr.src).toBe("fetch");
    expect(bundle.lastErr.m).not.toContain("shane.froebel@example.com");
  });

  it("reads the saved theme preference", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue();
    vi.stubGlobal("navigator", { clipboard: { writeText }, userAgent: "test-agent" });
    globalThis.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_PREFERENCES, theme: "dark" }),
    );

    renderButton();
    await userEvent.click(screen.getByRole("button", { name: "Copy for UI issue" }));

    const [copiedText] = writeText.mock.calls[0]!;
    expect(JSON.parse(copiedText).theme).toBe("dark");
  });

  it("shows the fallback text area when the clipboard refuses", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("clipboard refused"));
    vi.stubGlobal("navigator", { clipboard: { writeText }, userAgent: "test-agent" });

    renderButton();
    await userEvent.click(screen.getByRole("button", { name: "Copy for UI issue" }));

    const textarea = await screen.findByRole<HTMLTextAreaElement>("textbox");
    expect(JSON.parse(textarea.value)).toMatchObject({ product: "steward" });
  });

  it("never records a click inside its own fallback dialog, which renders outside its container", async () => {
    resetLastClickedForTests();
    const writeText = vi.fn().mockRejectedValue(new Error("clipboard refused"));
    vi.stubGlobal("navigator", { clipboard: { writeText }, userAgent: "test-agent" });

    document.body.innerHTML = '<button data-testid="page-action">Save</button>';
    renderButton();
    await userEvent.click(screen.getByTestId("page-action"));
    await userEvent.click(screen.getByRole("button", { name: "Copy for UI issue" }));
    await userEvent.click(await screen.findByRole("textbox"));

    expect(getLastClicked()).toBe("[data-testid=page-action]");
  });

  it("mounts the marker the release-bundle check looks for, so a dev build is its positive control", () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn() }, userAgent: "test-agent" });
    renderButton();
    expect(document.body.innerHTML).toContain(
      'data-steward-dev-ui-issue="steward-dev-ui-issue-copy"',
    );
  });
});
