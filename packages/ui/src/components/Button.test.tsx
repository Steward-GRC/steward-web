import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("is a plain button by default, so it never submits a form by accident", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("blocks clicks and reports busy while an action runs", async () => {
    const onClick = vi.fn();
    render(
      <Button busy onClick={onClick}>
        Publish
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Publish" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders a link with the button's look", () => {
    render(
      <Button asChild variant="secondary">
        <a href="/policies">Back to policies</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Back to policies" })).toHaveClass("border");
  });
});
