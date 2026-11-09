// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { QuickLogin, QuickLoginBar } from "./QuickLogin";

const posted = vi.fn();

const renderPicker = (users: Parameters<typeof QuickLogin>[0]["users"]) => {
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        posted(Object.fromEntries(await request.formData()));
        return null;
      },
      Component: () => <QuickLogin next="/policies" users={users} />,
      path: "/sign-in",
    },
  ]);
  return render(<Stub initialEntries={["/sign-in"]} />);
};

describe("QuickLogin", () => {
  it("is a labelled DEV picker, like Sneakers': one dropdown of the seeded accounts", async () => {
    renderPicker([
      { label: "Staff (sample)", note: "no second factor", username: "staff.sample" },
      { label: "approver.sample", username: "approver.sample" },
    ]);

    expect(await screen.findByText("Dev quick login")).toBeInTheDocument();
    expect(screen.getByText("DEV")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("combobox", { name: "Dev quick login" }));
    expect(screen.getByRole("option", { name: "Staff (sample) · no second factor" })).toBeVisible();
    expect(screen.getByRole("option", { name: "approver.sample" })).toBeVisible();
  });

  it("signs in on one pick: posts the dev-quick-login intent with the account", async () => {
    posted.mockClear();
    renderPicker([{ label: "approver.sample", username: "approver.sample" }]);
    await userEvent.click(await screen.findByRole("combobox", { name: "Dev quick login" }));
    await userEvent.click(screen.getByRole("option", { name: "approver.sample" }));
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith({
        intent: "dev-quick-login",
        next: "/policies",
        username: "approver.sample",
      }),
    );
  });

  it("renders nothing until the server lists accounts", () => {
    renderPicker([]);
    expect(screen.queryByText("Dev quick login")).not.toBeInTheDocument();
  });
});

describe("QuickLoginBar", () => {
  it("is a strip across the top that names the dev login, like the environment banner", () => {
    render(<QuickLoginBar enabled />);
    const bar = screen.getByTestId("dev-login-bar");
    expect(bar).toHaveTextContent("Dev login, test users only");
    expect(bar).toHaveClass("h-7");
    expect(bar).toHaveAttribute("data-dev-quick-login-bar");
  });

  it("renders nothing when the dev login is off", () => {
    const { container } = render(<QuickLoginBar enabled={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
