// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The pages people outside Steward open from a link (Gates G16, G18, G18r).
import { formatDate } from "@steward-web/i18n";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import {
  SharedEmailPrompt,
  SharedLinkRefused,
  SharedPolicyReader,
  SharedUnavailable,
  SsoTestLanding,
  SsoTestResult,
  SsoTestUnavailable,
} from "./SharedGates";

const inRouter = (node: React.ReactNode) => {
  const Stub = createRoutesStub([{ action: () => null, Component: () => node, path: "/" }]);
  return render(<Stub initialEntries={["/"]} />);
};

const desk = {
  category: "Workplace · Facilities",
  expiresAt: "2026-11-02T00:00:00Z",
  number: "POL-FACILITIES-000001",
  sections: [
    {
      body: "This policy explains how staff book a desk in a shared office.",
      heading: "1. Purpose",
    },
  ],
  sharedBy: "Bob",
  title: "Desk Booking Policy",
  version: "1.0.0",
};

describe("G16: the shared policy reader", () => {
  it("shows the one pinned version as a read-only shared copy", () => {
    render(<SharedPolicyReader organisation="Example Organisation" policy={desk} />);
    expect(screen.getByText("EO")).toBeInTheDocument();
    expect(screen.getByText("Example Organisation")).toBeInTheDocument();
    expect(screen.getByText("Read-only shared copy")).toBeInTheDocument();
    expect(screen.getByText("Workplace · Facilities")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Desk Booking Policy" })).toHaveClass(
      "font-serif",
    );
    expect(
      screen.getByText(
        `POL-FACILITIES-000001 · v1.0.0 · pinned · link expires ${formatDate(desk.expiresAt)}`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "1. Purpose" })).toBeInTheDocument();
    expect(screen.getByText("Shared by Bob · You can print this page")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass("doc");
  });

  it("leaves the organisation slot out when none is set", () => {
    render(<SharedPolicyReader organisation={null} policy={desk} />);
    expect(screen.queryByText("EO")).toBeNull();
  });

  it("says a revoked link is revoked, and an expired one when it expired", () => {
    const { unmount } = render(<SharedLinkRefused reason="revoked" />);
    expect(screen.getByRole("heading", { name: "This link has been revoked" })).toBeInTheDocument();
    expect(screen.getByText("Ask the person who shared it for a new link.")).toBeInTheDocument();
    unmount();
    render(<SharedLinkRefused expiredAt="2026-11-02T00:00:00Z" reason="expired" />);
    expect(
      screen.getByRole("heading", {
        name: `This link expired on ${formatDate("2026-11-02T00:00:00Z")}.`,
      }),
    ).toBeInTheDocument();
  });

  it("asks for the reader's email before a sensitive policy", async () => {
    inRouter(<SharedEmailPrompt />);
    expect(
      await screen.findByRole("heading", { name: "Enter your email to view" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This is a sensitive policy. Your email is recorded with this view, and the copy is watermarked.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByRole("button", { name: "View policy" })).toHaveAttribute("type", "submit");
  });

  it("says plainly that the gateway can't open a shared link yet", () => {
    render(<SharedUnavailable />);
    expect(
      screen.getByRole("heading", { name: "Shared links can't open yet" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no public share-link lookup/)).toBeInTheDocument();
  });
});

describe("G18: the remote SSO test", () => {
  it("tells the person whose sign-in they are testing, then starts the test", () => {
    inRouter(
      <SsoTestLanding
        domain="example.net"
        organisation="Example Organisation"
        requester="Alice"
        token="tok-1"
        validHours={24}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Test sign-in for example.net" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Alice at Example Organisation asked you to test your sign-in. Nothing is saved to your account. Link valid for 24 hours.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start test" })).toHaveAttribute(
      "href",
      "/auth/sso/start?testToken=tok-1",
    );
  });

  it("says plainly that the gateway can't look the test up yet", () => {
    render(<SsoTestUnavailable />);
    expect(screen.getByRole("heading", { name: "SSO tests can't open yet" })).toBeInTheDocument();
    expect(screen.getByText(/no public SSO-test lookup/)).toBeInTheDocument();
  });
});

describe("G18r: the remote SSO test's result", () => {
  it("passes", () => {
    render(<SsoTestResult outcome="passed" />);
    expect(
      screen.getByRole("heading", { name: "IdP test passed — you can close this page." }),
    ).toBeInTheDocument();
  });

  it("fails, saying why in words when it can", () => {
    render(<SsoTestResult outcome="failed" reason="sso_no_email" />);
    expect(screen.getByRole("heading", { name: "IdP test failed" })).toBeInTheDocument();
    expect(
      screen.getByText("Your identity provider did not return an email address."),
    ).toBeInTheDocument();
  });

  it("fails with the gateway's reason when there are no words for it", () => {
    render(<SsoTestResult outcome="failed" reason="code_exchange_failed" />);
    expect(screen.getByText("code_exchange_failed")).toHaveClass("font-mono");
  });

  it("says the link expired", () => {
    render(<SsoTestResult outcome="expired" />);
    expect(
      screen.getByRole("heading", { name: "This test link has expired." }),
    ).toBeInTheDocument();
  });
});
