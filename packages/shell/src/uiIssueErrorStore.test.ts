// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it } from "vitest";

import {
  getLastUiIssueError,
  getRecentUiIssueErrors,
  installUiIssueErrorListeners,
  recordUiIssueError,
  resetUiIssueErrorsForTests,
} from "./uiIssueErrorStore";

afterEach(() => {
  resetUiIssueErrorsForTests();
});

describe("recordUiIssueError", () => {
  it("has no last error before anything is recorded", () => {
    expect(getLastUiIssueError()).toBeUndefined();
    expect(getRecentUiIssueErrors()).toEqual([]);
  });

  it("records the most recent error first", () => {
    recordUiIssueError("window", "first", new Date("2026-01-01T00:00:00Z"));
    recordUiIssueError("fetch", "second", new Date("2026-01-01T00:00:01Z"));
    expect(getLastUiIssueError()).toEqual({
      at: new Date("2026-01-01T00:00:01Z"),
      m: "second",
      src: "fetch",
    });
    expect(getRecentUiIssueErrors().map((error) => error.m)).toEqual(["second", "first"]);
  });

  it("keeps at most 5 entries", () => {
    for (let index = 0; index < 8; index += 1) recordUiIssueError("render", `error-${index}`);
    expect(getRecentUiIssueErrors()).toHaveLength(5);
    expect(getRecentUiIssueErrors().map((error) => error.m)).toEqual([
      "error-7",
      "error-6",
      "error-5",
      "error-4",
      "error-3",
    ]);
  });
});

describe("installUiIssueErrorListeners", () => {
  it("records a window error event", () => {
    const target = new EventTarget();
    const stop = installUiIssueErrorListeners(target);
    target.dispatchEvent(Object.assign(new Event("error"), { message: "window boom" }));
    expect(getLastUiIssueError()).toMatchObject({ m: "window boom", src: "window" });
    stop();
  });

  it("records an unhandled promise rejection", () => {
    const target = new EventTarget();
    const stop = installUiIssueErrorListeners(target);
    target.dispatchEvent(
      Object.assign(new Event("unhandledrejection"), { reason: new Error("rejected boom") }),
    );
    expect(getLastUiIssueError()).toMatchObject({ m: "rejected boom", src: "promise" });
    stop();
  });

  it("stops recording once uninstalled", () => {
    const target = new EventTarget();
    const stop = installUiIssueErrorListeners(target);
    stop();
    target.dispatchEvent(Object.assign(new Event("error"), { message: "after uninstall" }));
    expect(getLastUiIssueError()).toBeUndefined();
  });
});
