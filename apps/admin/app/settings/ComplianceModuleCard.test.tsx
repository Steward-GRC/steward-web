// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ComplianceModuleCard } from "./ComplianceModuleCard";

const open = (props: Partial<Parameters<typeof ComplianceModuleCard>[0]> = {}) => {
  const onChange = vi.fn();
  render(<ComplianceModuleCard busy={false} enabled onChange={onChange} {...props} />);
  return onChange;
};

const pill = () => within(screen.getByRole("region")).getByTestId("status-pill");

describe("ComplianceModuleCard", () => {
  it("shows On while the module is on and Off while it is off", () => {
    open();
    expect(pill()).toHaveTextContent("On");
  });

  it("shows Off while the module is off", () => {
    open({ enabled: false });
    expect(pill()).toHaveTextContent("Off");
    expect(screen.getByRole("switch", { name: "Compliance module on" })).not.toBeChecked();
  });

  it("asks before turning the module off and changes nothing on Cancel", async () => {
    const onChange = open();
    await userEvent.click(screen.getByRole("switch", { name: "Compliance module on" }));
    const dialog = await screen.findByRole("dialog", { name: "Turn the Compliance module off?" });
    expect(within(dialog).getByText(/Existing cases are kept/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("turns the module off once confirmed", async () => {
    const onChange = open();
    await userEvent.click(screen.getByRole("switch", { name: "Compliance module on" }));
    const dialog = await screen.findByRole("dialog", { name: "Turn the Compliance module off?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Turn off" }));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("asks before turning the module back on", async () => {
    const onChange = open({ enabled: false });
    await userEvent.click(screen.getByRole("switch", { name: "Compliance module on" }));
    const dialog = await screen.findByRole("dialog", { name: "Turn the Compliance module on?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Turn on" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("words a refusal from its code and never shows the server's text", () => {
    open({ errorCode: "MODULE_OFF" });
    expect(screen.getByText("The Compliance module is off, so this was refused.")).toBeVisible();
  });

  it("falls back to a generic failure for an unknown refusal", () => {
    open({ failure: { code: "PERMISSION_DENIED", status: 403 } });
    expect(screen.getByText("Couldn't change the Compliance module")).toBeVisible();
  });
});
