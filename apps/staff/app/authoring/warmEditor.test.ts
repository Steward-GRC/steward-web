// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from "vitest";

const loaded = vi.fn();
vi.mock("@steward-web/editor-steward/client", () => {
  loaded();
  return { default: () => null };
});

import { warmEditor } from "./warmEditor";

describe("loading the editor ahead of the draft screen (bug log 177)", () => {
  it("fetches the editor's chunk once, however often it is asked", async () => {
    await warmEditor();
    await warmEditor();
    expect(loaded).toHaveBeenCalledTimes(1);
  });
});
