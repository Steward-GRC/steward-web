// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { COMING_SOON_PATHS } from "@steward-web/shell";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import routes from "../routes";
import ComingSoon, { loader } from "./coming-soon";

describe("the coming-soon page", () => {
  it("answers not found, so nothing treats a planned page as a real one", async () => {
    const result = await loader();
    expect(result.init?.status).toBe(404);
  });

  it("says the page is coming", () => {
    render(<ComingSoon />);
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(screen.getByText(/still being built/)).toBeInTheDocument();
  });

  it("stands in for every planned destination the shell links to", () => {
    const comingSoon = routes
      .filter((entry) => entry.file === "routes/coming-soon.tsx")
      .map((entry) => `/${entry.path}`);
    expect(comingSoon.toSorted()).toEqual([...COMING_SOON_PATHS].toSorted());
  });
});
