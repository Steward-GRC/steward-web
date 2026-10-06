// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { buildSubmitBody, errorMessages, type KratosLoginFlow } from "./kratos";

const flow = (overrides: Partial<KratosLoginFlow["ui"]> = {}): KratosLoginFlow => ({
  id: "flow-1",
  ui: {
    action: "https://kratos.example/self-service/login?flow=flow-1",
    method: "POST",
    nodes: [
      {
        attributes: {
          disabled: false,
          name: "csrf_token",
          node_type: "input",
          type: "hidden",
          value: "csrf-xyz",
        },
        group: "default",
        messages: [],
        meta: {},
      },
      {
        attributes: { disabled: false, name: "identifier", node_type: "input", type: "text" },
        group: "password",
        messages: [],
        meta: { label: { text: "Username" } },
      },
      {
        attributes: {
          disabled: false,
          name: "password",
          node_type: "input",
          type: "password",
        },
        group: "password",
        messages: [],
        meta: { label: { text: "Password" } },
      },
      {
        attributes: {
          disabled: false,
          name: "method",
          node_type: "input",
          type: "submit",
          value: "password",
        },
        group: "password",
        messages: [],
        meta: { label: { text: "Sign in" } },
      },
      {
        attributes: { disabled: false, name: "logo", node_type: "img" },
        group: "default",
        messages: [],
        meta: {},
      },
    ],
    ...overrides,
  },
});

describe("buildSubmitBody", () => {
  it("carries every input node's own value, keyed by name", () => {
    expect(buildSubmitBody(flow(), {})).toEqual({
      csrf_token: "csrf-xyz",
      method: "password",
    });
  });

  it("never carries a non-input node (img, a, text, script)", () => {
    expect(Object.keys(buildSubmitBody(flow(), {}))).not.toContain("logo");
  });

  it("lets what the visitor typed override a node's own value", () => {
    const body = buildSubmitBody(flow(), { identifier: "alex", password: "secret" });
    expect(body).toEqual({
      csrf_token: "csrf-xyz",
      identifier: "alex",
      method: "password",
      password: "secret",
    });
  });
});

describe("errorMessages", () => {
  it("is empty when nothing failed", () => {
    expect(errorMessages(flow())).toEqual([]);
  });

  it("collects form-level and per-field error messages, never info or success", () => {
    const withErrors = flow({
      messages: [{ id: 1, text: "The sign-in information is invalid", type: "error" }],
      nodes: [
        {
          attributes: { disabled: false, name: "password", node_type: "input", type: "password" },
          group: "password",
          messages: [{ id: 2, text: "Property password is missing", type: "error" }],
          meta: {},
        },
        {
          attributes: { disabled: false, name: "csrf_token", node_type: "input" },
          group: "default",
          messages: [{ id: 3, text: "ignored", type: "info" }],
          meta: {},
        },
      ],
    });

    expect(errorMessages(withErrors)).toEqual([
      "The sign-in information is invalid",
      "Property password is missing",
    ]);
  });
});
