// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { EditorViewToggle, useEditorView } from "./EditorViewToggle";

beforeEach(() => localStorage.clear());

describe("each person's own view of the changes (bug log 228)", () => {
  it("starts on the unified view", () => {
    const { result } = renderHook(() => useEditorView("u-1"));
    expect(result.current[0]).toBe("unified");
  });

  it("keeps the choice for that person on this browser", () => {
    const view = renderHook(() => useEditorView("u-1"));
    act(() => view.result.current[1]("diff"));
    expect(view.result.current[0]).toBe("diff");
    view.unmount();
    expect(renderHook(() => useEditorView("u-1")).result.current[0]).toBe("diff");
  });

  it("does not hand the choice to another person, or to a collaborator", () => {
    const view = renderHook(() => useEditorView("u-1"));
    act(() => view.result.current[1]("diff"));
    expect(renderHook(() => useEditorView("u-2")).result.current[0]).toBe("unified");
  });

  it("offers Unified and Diff, and tells which is on", async () => {
    let chosen = "";
    render(<EditorViewToggle onChange={(next) => (chosen = next)} value="unified" />);
    expect(screen.getByRole("radio", { name: "Unified" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Diff" }));
    expect(chosen).toBe("diff");
  });
});
