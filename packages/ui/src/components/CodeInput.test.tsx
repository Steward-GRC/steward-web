// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { CodeInput, digitsOnly } from "./CodeInput";

describe("CodeInput", () => {
  it("keeps digits only, up to the length", async () => {
    const Host = () => {
      const [value, setValue] = useState("");
      return <CodeInput aria-label="Verification code" onChange={setValue} value={value} />;
    };
    render(<Host />);
    await userEvent.type(screen.getByLabelText("Verification code"), "12a3 4-567");
    expect(screen.getByLabelText("Verification code")).toHaveValue("123456");
  });

  it("strips a pasted code's separators", () => {
    expect(digitsOnly("123-456", 6)).toBe("123456");
    expect(digitsOnly(" 98 76 ", 4)).toBe("9876");
  });
});
