// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The welcome page as it draws (Gates G10), through Welcome's props and its own form.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import type { WelcomePerson } from "./welcomeState";

import { NAV_CHOICE_ENABLED } from "./navigationChoice";
import { Welcome, type WelcomeProps } from "./Welcome";

const erin: WelcomePerson = {
  email: "erin@example.org",
  firstName: "",
  lastName: "",
  username: "erin",
};

const renderWelcome = (props: Partial<WelcomeProps> = {}) => {
  const Stub = createRoutesStub([
    {
      action: () => null,
      Component: () => <Welcome next="/policies" person={erin} {...props} />,
      path: "/welcome",
    },
  ]);
  return render(<Stub initialEntries={["/welcome"]} />);
};

describe("G10: welcome", () => {
  it("welcomes the person and asks to finish setting up the account", async () => {
    renderWelcome();
    expect(await screen.findByRole("heading", { name: "Welcome to Steward" })).toBeInTheDocument();
    expect(screen.getByText("Let’s finish setting up your account.")).toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toHaveAttribute("name", "firstName");
    expect(screen.getByLabelText("Last name")).toHaveAttribute("name", "lastName");
    expect(screen.getByLabelText("Username")).toHaveValue("erin");
    expect(screen.getByDisplayValue("/policies")).toHaveAttribute("name", "next");
  });

  it("previews the name the person will appear as while they type", async () => {
    renderWelcome();
    await userEvent.type(await screen.findByLabelText("First name"), "Erin");
    await userEvent.type(screen.getByLabelText("Last name"), "Example");
    expect(screen.getByText(/You’ll appear as/)).toHaveTextContent(
      "You’ll appear as Erin Example.",
    );
    expect(screen.getByText("Erin Example")).toHaveClass("font-bold");
  });

  it("shows the email from the sign-in read-only", async () => {
    renderWelcome();
    const email = await screen.findByLabelText("Email (from your sign-in)");
    expect(email).toHaveValue("erin@example.org");
    expect(email).toHaveAttribute("readonly");
    expect(email).not.toHaveAttribute("name");
  });

  it("asks for an email when the sign-in sent none", async () => {
    renderWelcome({ person: { ...erin, email: "" } });
    const email = await screen.findByLabelText("Email (from your sign-in)");
    expect(email).not.toHaveAttribute("readonly");
    expect(email).toHaveAttribute("name", "email");
  });

  it("needs the terms accepted, then Get started", async () => {
    renderWelcome();
    const terms = await screen.findByRole("checkbox", { name: "I accept the Terms of Service" });
    expect(terms).toBeRequired();
    expect(terms).toHaveAttribute("name", "acceptTerms");
    expect(screen.getByRole("button", { name: "Get started" })).toHaveAttribute("type", "submit");
  });

  it.each([
    ["failed", "We couldn't finish setting up your account. Please try again."],
    ["terms", "Accept the Terms of Service to continue."],
  ] as const)("says %s inline", async (problem, text) => {
    renderWelcome({ problem });
    expect(await screen.findByRole("alert")).toHaveTextContent(text);
  });
});

describe("the navigation choice slot", () => {
  it("is off until the top nav exists", () => {
    expect(NAV_CHOICE_ENABLED).toBe(false);
  });

  it("stays hidden while it is off", async () => {
    renderWelcome();
    await screen.findByRole("heading", { name: "Welcome to Steward" });
    expect(screen.queryByRole("group", { name: "How do you like to navigate?" })).toBeNull();
  });

  it("holds the sidebar or top nav choice for when it is turned on", async () => {
    renderWelcome({ navigationChoice: true });
    const slot = await screen.findByRole("group", { name: "How do you like to navigate?" });
    expect(slot).toHaveAttribute("data-slot", "navigation-choice");
    expect(screen.getByRole("radio", { name: "Left sidebar" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Top navigation" })).not.toBeChecked();
  });
});
