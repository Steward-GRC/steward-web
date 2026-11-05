// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { shellConfigFromEnvironment } from "./shellConfig.server";

describe("shellConfigFromEnvironment", () => {
  it("reads the environment, organisation, docs and admin settings", () => {
    expect(
      shellConfigFromEnvironment({
        STEWARD_ADMIN_URL: "https://steward.example/admin",
        STEWARD_DOCS_URL: "https://docs.steward.example",
        STEWARD_ENVIRONMENT: "test",
        STEWARD_ORGANISATION: " Example Organisation ",
      }),
    ).toEqual({
      adminUrl: "https://steward.example/admin",
      docsUrl: "https://docs.steward.example",
      environment: "test",
      organisation: "Example Organisation",
    });
  });

  it("shows no environment banner in production or when unset, and no organisation slot", () => {
    expect(shellConfigFromEnvironment({})).toEqual({
      adminUrl: "/admin",
      docsUrl: "https://steward-grc.com",
      environment: null,
      organisation: null,
    });
    expect(
      shellConfigFromEnvironment({ STEWARD_ENVIRONMENT: "Production" }).environment,
    ).toBeNull();
  });
});
