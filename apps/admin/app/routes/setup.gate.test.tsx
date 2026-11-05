// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// First-run setup as the Gates canvas draws it (G13, G14, G15): the gate card outside the
// admin shell, with the same steps and the same gateway calls as before.
import { fireEvent, render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import Setup, { action, handle, loader } from "./setup";

const stubBootstrap = (status: number, body: Record<string, unknown>) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).endsWith("/setup/state")) return Response.json({ needsSetup: true });
      return Response.json(body, { status });
    }),
  );

const renderSetup = () => {
  const Stub = createRoutesStub([
    { action, Component: Setup as never, loader, path: "/setup" },
    { Component: () => <p>Sign-in page</p>, path: "/sign-in" },
  ]);
  render(<Stub initialEntries={["/setup"]} />);
};

const fillAccount = async () => {
  fireEvent.change(await screen.findByLabelText("Username"), { target: { value: "admin" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "root@example.org" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pw-1" } });
  fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "pw-1" } });
  fireEvent.change(screen.getByLabelText("Setup token"), { target: { value: "right-token" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("G13: first-run setup", () => {
  it("is a gate outside the admin shell", () => {
    expect(handle).toEqual({ gate: true });
  });

  it("asks for the root administrator on the gate card", async () => {
    stubBootstrap(200, {});
    renderSetup();
    const card = await screen.findByRole("region", { name: "First-run setup" });
    expect(within(card).getByRole("img", { name: "Steward" })).toBeInTheDocument();
    expect(within(card).getByText("Create the root administrator account.")).toBeInTheDocument();
    for (const label of ["Username", "Email", "Display name", "Password", "Confirm password"])
      expect(within(card).getByLabelText(label)).toHaveAttribute("placeholder", label);
    expect(within(card).getByLabelText("Setup token")).toHaveAttribute(
      "placeholder",
      "Setup token · Provided by your system administrator",
    );
    expect(within(card).getByRole("button", { name: "Continue" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("says what's missing inline above the fields", async () => {
    stubBootstrap(200, {});
    renderSetup();
    fireEvent.click(await screen.findByRole("button", { name: "Continue" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("All fields are required.");
  });
});

describe("G14: single sign-on (optional)", () => {
  it("offers SSO now or later, with local sign-in always there", async () => {
    stubBootstrap(200, {});
    renderSetup();
    await fillAccount();
    expect(await screen.findByRole("heading", { name: "Single sign-on" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Connect your organization's identity provider now, or skip and set it up later.",
        { exact: false },
      ),
    ).toHaveTextContent("Local sign-in is always available for the root administrator");
    expect(screen.getByRole("button", { name: "Set up SSO now" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip for now" })).toHaveAttribute("type", "submit");
  });
});

describe("G15: setup complete", () => {
  it("says the root administrator is ready and goes on to sign in", async () => {
    stubBootstrap(200, { userId: "u-root" });
    renderSetup();
    await fillAccount();
    fireEvent.click(await screen.findByRole("button", { name: "Skip for now" }));
    expect(
      await screen.findByRole("heading", { name: "Your root administrator is ready." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Redirecting you to sign in…")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to sign in" })).toHaveAttribute("href", "/sign-in");
  });

  it("asks for the DNS record that finishes enabling SSO, with a copy button", async () => {
    stubBootstrap(200, {});
    const sso = {
      domainVerification: {
        dnsRecordName: "_steward-verify.example.org",
        dnsRecordValue: "steward-site-verification=3f2a9c41",
        instructions: "",
      },
      organization: { domain: "example.org" },
    };
    const Stub = createRoutesStub([
      { action: () => ({ ok: true, sso }), Component: Setup as never, loader, path: "/setup" },
    ]);
    render(<Stub initialEntries={["/setup"]} />);
    await fillAccount();
    fireEvent.click(await screen.findByRole("button", { name: "Skip for now" }));

    expect(
      await screen.findByRole("heading", { name: "Your root administrator is ready." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Finish enabling SSO: add the DNS record _steward-verify.example.org with the value shown, then go to sign in.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("steward-site-verification=3f2a9c41")).toHaveAttribute(
      "readonly",
    );
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    expect(screen.queryByText("Redirecting you to sign in…")).toBeNull();
  });

  it("says SSO wasn't fully provisioned, and why", async () => {
    stubBootstrap(200, {});
    const sso = { error: "The identity provider refused the connection." };
    const Stub = createRoutesStub([
      { action: () => ({ ok: true, sso }), Component: Setup as never, loader, path: "/setup" },
    ]);
    render(<Stub initialEntries={["/setup"]} />);
    await fillAccount();
    fireEvent.click(await screen.findByRole("button", { name: "Skip for now" }));
    expect(await screen.findByText("SSO not fully provisioned")).toBeInTheDocument();
    expect(screen.getByText("The identity provider refused the connection.")).toBeInTheDocument();
  });
});
