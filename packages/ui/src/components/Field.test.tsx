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

  it("keeps its rows at the top so a taller neighbour does not push the control down", () => {
    render(
      <div className="grid md:grid-cols-2">
        <Field label="Name">
          <Input />
        </Field>
        <Field hint="Lowercase letters and hyphens" label="Slug">
          <Input />
        </Field>
      </div>,
    );
    // A Field is a grid; without content-start its rows share the extra height a hinted
    // neighbour adds to the shared row, and the control drops below its neighbour's (#372).
    for (const label of ["Name", "Slug"]) {
      // oxlint-disable-next-line testing-library/no-node-access -- the wrapper has no role to query
      expect(screen.getByLabelText(label).parentElement).toHaveClass("grid", "content-start");
    }
  });
});
