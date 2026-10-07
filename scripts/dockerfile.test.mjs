// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dockerfile = readFileSync(new URL("../Dockerfile", import.meta.url), "utf8");
const buildStage = dockerfile.slice(0, dockerfile.indexOf("AS runtime"));

describe("Dockerfile build stage", () => {
  it("passes a GITHUB_SHA build argument to the client build, so the bundle's sha is set", () => {
    const lines = buildStage.split("\n").map((line) => line.trim());
    const build = lines.findIndex((line) => line.includes("run build"));
    expect(lines.indexOf("ARG GITHUB_SHA")).toBeGreaterThan(-1);
    expect(lines.indexOf("ENV GITHUB_SHA=${GITHUB_SHA}")).toBeGreaterThan(-1);
    expect(lines.indexOf("ENV GITHUB_SHA=${GITHUB_SHA}")).toBeLessThan(build);
  });
});
