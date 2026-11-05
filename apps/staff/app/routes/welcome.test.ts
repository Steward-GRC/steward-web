// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import * as welcome from "./welcome";

describe("staff welcome", () => {
  it("is a gate outside the app shell, served by the shared welcome loader and action", () => {
    expect(welcome.handle).toEqual({ gate: true });
    expect(typeof welcome.loader).toBe("function");
    expect(typeof welcome.action).toBe("function");
  });
});
