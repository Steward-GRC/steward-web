// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { CodeBoxes } from "./CodeBoxes";
import { GateAlert, GateBrand, GateCard, GateOrganisation, GatePage } from "./Gate";
import { QrCode } from "./QrCode";

describe("the gate layout", () => {
  it("centres one card on the sunken page, outside any shell", () => {
    render(
      <GatePage>
        <GateCard aria-label="Sign in">
          <p>body</p>
        </GateCard>
      </GatePage>,
    );
    const card = screen.getByRole("region", { name: "Sign in" });
    expect(card).toHaveClass("max-w-[400px]", "rounded-[14px]", "bg-surface", "shadow-3");
    const page = screen.getByTestId("gate-page");
    expect(page).toHaveClass("bg-sunken");
    expect(page).toContainElement(card);
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("puts Steward at the top of a card as the mark and the outlined wordmark", () => {
    render(<GateBrand />);
    const brand = screen.getByRole("img", { name: "Steward" });
    expect(brand).toContainHTML("data-wordmark");
  });

  it("shows the organisation slot as its initials tile and its name", () => {
    render(<GateOrganisation name="Example Organisation" />);
    expect(screen.getByText("EO")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Example Organisation")).toBeInTheDocument();
  });

  it("shows an error as a calm inline alert with an icon", () => {
    render(<GateAlert id="problem">Incorrect username or password.</GateAlert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Incorrect username or password.");
    expect(alert).toHaveAttribute("id", "problem");
    expect(alert).toHaveClass("bg-danger-soft", "text-danger");
    expect(alert).toContainHTML("<svg");
  });
});

const Boxes = ({ invalid = false }: { invalid?: boolean }) => {
  const [value, setValue] = useState("");
  return (
    <form aria-label="code">
      <CodeBoxes
        invalid={invalid}
        label="Verification code"
        name="code"
        onChange={setValue}
        value={value}
      />
    </form>
  );
};

describe("CodeBoxes", () => {
  it("is one labelled one-time-code field drawn as six boxes", async () => {
    render(<Boxes />);
    const input = screen.getByLabelText("Verification code");
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("name", "code");
    expect(screen.getAllByTestId("code-box")).toHaveLength(6);

    await userEvent.type(input, "48a21");
    expect(input).toHaveValue("4821");
    expect(screen.getAllByTestId("code-box").map((box) => box.textContent)).toEqual([
      "4",
      "8",
      "2",
      "1",
      "",
      "",
    ]);
  });

  it("takes a pasted code and stops at six digits", async () => {
    render(<Boxes />);
    const input = screen.getByLabelText("Verification code");
    input.focus();
    await userEvent.paste("123 4567");
    expect(input).toHaveValue("123456");
  });

  it("marks the field invalid for screen readers", () => {
    render(<Boxes invalid />);
    expect(screen.getByLabelText("Verification code")).toHaveAttribute("aria-invalid", "true");
  });
});

describe("QrCode", () => {
  it("draws the value as a labelled QR code", () => {
    render(<QrCode label="QR code" value="otpauth://totp/Steward:alice?secret=ABC" />);
    const code = screen.getByRole("img", { name: "QR code" });
    expect(code).toContainHTML("<svg");
  });
});
