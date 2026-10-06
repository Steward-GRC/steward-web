// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field } from "./Field";
import { Input } from "./Input";

describe("Field", () => {
  it("labels the control and describes it with the hint and the error", () => {
    render(
      <Field error="Enter your username and password." hint="Your work username" label="Username">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText("Username");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Your work username Enter your username and password.",
    );
  });

  it("leaves a valid control unmarked", () => {
    render(
      <Field label="Email">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
  });
});
