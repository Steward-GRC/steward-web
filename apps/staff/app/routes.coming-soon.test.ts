// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { COMING_SOON } from "@steward-web/shell/coming-soon";
import { describe, expect, it } from "vitest";

import routes from "./routes";

/** Every path the config registers, with the file that answers it. */
const filesByPath = () =>
  new Map<string, string>(routes.map((entry) => [`/${entry.path ?? ""}`, entry.file]));

describe("the staff routes", () => {
  it("answer the built screens with their own page, not the Coming soon stand-in", () => {
    const files = filesByPath();
    for (const path of ["/templates", "/audit", "/profile", "/approvals"]) {
      expect(files.get(path), path).toBeDefined();
      expect(files.get(path), path).not.toBe("routes/coming-soon.tsx");
    }
  });

  it("keep Coming soon only for the destinations still listed as not built", () => {
    const standIns = [...filesByPath()]
      .filter(([, file]) => file === "routes/coming-soon.tsx")
      .map(([path]) => path)
      .toSorted();
    expect(standIns).toEqual(Object.values(COMING_SOON).toSorted());
  });
});
