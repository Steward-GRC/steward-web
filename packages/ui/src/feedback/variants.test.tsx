import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Banner, type BannerTone } from "./Banner";
import { DiagnosticsSlotProvider } from "./DiagnosticsSlot";
import { FailureDialog } from "./FailureDialog";
import { ReachError } from "./States";
import { ToastCard, type ToastTone } from "./Toast";

const withSlot = (ui: React.ReactNode) =>
  render(
    <DiagnosticsSlotProvider
      render={(failure) => (
        <button data-failure={failure?.code ?? ""} type="button">
          Copy diagnostics
        </button>
      )}
    >
      {ui}
    </DiagnosticsSlotProvider>,
  );

describe("the diagnostics slot in every failure treatment", () => {
  it.each<[BannerTone, boolean]>([
    ["warn", true],
    ["danger", true],
    ["info", false],
    ["ok", false],
  ])("a %s banner carries it: %s", (tone, carries) => {
    withSlot(<Banner failure={{ code: "UNAVAILABLE" }} title="Heads up" tone={tone} />);
    const button = screen.queryByRole("button", { name: "Copy diagnostics" });
    if (carries) {
      expect(button).toHaveAttribute("data-failure", "UNAVAILABLE");
    } else {
      expect(button).toBeNull();
    }
  });

  it.each<[ToastTone, boolean]>([
    ["warning", true],
    ["error", true],
    ["info", false],
    ["success", false],
  ])("a %s toast carries it: %s", (tone, carries) => {
    withSlot(<ToastCard onClose={() => {}} title="Saved" tone={tone} />);
    expect(!!screen.queryByRole("button", { name: "Copy diagnostics" })).toBe(carries);
  });

  it("the reach error carries it beside Try again", async () => {
    const onRetry = vi.fn();
    withSlot(
      <ReachError action="load your work" failure={{ requestId: "req-42" }} onRetry={onRetry} />,
    );
    const block = screen.getByRole("alert");
    expect(within(block).getByText("Couldn't load your work")).toBeInTheDocument();
    expect(within(block).getByText("Reference: req-42")).toBeInTheDocument();
    expect(within(block).getByRole("button", { name: "Copy diagnostics" })).toBeInTheDocument();
    await userEvent.click(within(block).getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("the reach error says Retrying… while the retry runs", () => {
    withSlot(<ReachError action="load your work" onRetry={() => {}} retrying />);
    expect(screen.getByRole("button", { name: "Retrying…" })).toBeDisabled();
  });

  it("the failure dialog carries it", () => {
    withSlot(<FailureDialog onOpenChange={() => {}} open title="Couldn't publish" />);
    expect(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Copy diagnostics" }),
    ).toBeInTheDocument();
  });

  it("renders nothing in the slot without a provider", () => {
    render(<Banner title="Heads up" tone="danger" />);
    expect(screen.queryByRole("button", { name: "Copy diagnostics" })).toBeNull();
  });
});

describe("Banner", () => {
  it("lets an info banner be dismissed, but not a warning", async () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<Banner onDismiss={onDismiss} title="Announcement" tone="info" />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
    rerender(<Banner onDismiss={onDismiss} title="Announcement" tone="warn" />);
    expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull();
  });
});
