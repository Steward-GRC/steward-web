// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import OrganizationSetup from "./organisations.$domain";

const ORG = {
  allowLocal: false,
  connectionAlias: "partner",
  connectionId: "c-partner",
  displayName: "Partner SSO",
  domain: "partner.example.net",
  enabled: false,
  jitEnabled: true,
  orgName: "Partner Org",
  protocol: "saml",
  secretReentryRequired: false,
  testPassed: false,
  verified: false,
};

const VERIFICATION = {
  dnsRecordName: "_steward-verify.partner.example.net",
  dnsRecordValue: "steward-site-verification=3f2a9c41b7",
  instructions: "",
  token: "3f2a9c41b7",
};

const BASE = {
  canActivateNow: false,
  canDeleteNow: true,
  groupOptions: [{ id: "g-finance", path: "Finance team" }],
  mappings: [{ id: "m-1", idpGroupClaimValue: "finance-staff", targetGroupId: "g-finance" }],
  organisation: ORG,
  verification: VERIFICATION,
};

type SetupProps = Parameters<typeof OrganizationSetup>[0];

const openSetup = (overrides: Record<string, unknown> = {}) => {
  const posted: FormData[] = [];
  const loaderData = { ...BASE, ...overrides };
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const form = await request.formData();
        posted.push(form);
        return { intent: form.get("intent"), ok: true };
      },
      Component: () => <OrganizationSetup {...({ loaderData } as unknown as SetupProps)} />,
      path: "/organisations/:domain",
    },
  ]);
  render(<Stub initialEntries={["/organisations/partner.example.net"]} />);
  return posted;
};

const steps = () =>
  within(screen.getByRole("list", { name: "Setup steps" }))
    .getAllByRole("listitem")
    .map((step) => step.textContent);

const last = (posted: FormData[]) => posted.at(-1)!;

describe("Organization setup (A24)", () => {
  it("is one page with the domain, the gates sentence and four steps", async () => {
    openSetup();
    expect(
      await screen.findByRole("heading", { level: 1, name: "partner.example.net" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Organizations")).toBeInTheDocument();
    expect(
      screen.getByText(
        "A SAML/OIDC connection is scoped to one domain. It needs both gates below — domain ownership and a passing IdP login test — before it can be activated.",
      ),
    ).toBeInTheDocument();
    expect(steps()).toEqual(["1 Details", "2 Domain verification", "3 IdP test", "4 Activate"]);
    expect(screen.getByRole("button", { name: "2 Domain verification" })).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByRole("button", { name: "4 Activate" })).toBeDisabled();
  });

  it("shows the DNS record to copy, Verify, the auto-check and Rotate token (step 2)", async () => {
    const writeText = vi.fn(async (_text: string) => {});
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const posted = openSetup();
    const card = await screen.findByRole("region", { name: "Add this DNS TXT record" });
    expect(within(card).getByLabelText("Name")).toHaveValue(VERIFICATION.dnsRecordName);
    expect(within(card).getByLabelText("Value")).toHaveValue(VERIFICATION.dnsRecordValue);
    await userEvent.click(within(card).getByRole("button", { name: "Copy the record value" }));
    expect(writeText).toHaveBeenCalledWith(VERIFICATION.dnsRecordValue);
    expect(within(card).getByText("Checking every 10 seconds…")).toBeInTheDocument();

    await userEvent.click(within(card).getByRole("button", { name: "Verify" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("verify-domain"));
    await userEvent.click(within(card).getByRole("button", { name: "Rotate token" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("rotate-verification"));
  });

  it("moves on to the IdP test once the domain is verified (step 3)", async () => {
    openSetup({ organisation: { ...ORG, verified: true } });
    expect(await screen.findByText("Domain ownership verified.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3 IdP test" })).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByRole("button", { name: "Run IdP test" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy remote test link" })).toBeInTheDocument();
  });

  it("activates once both gates pass (step 4)", async () => {
    const posted = openSetup({
      canActivateNow: true,
      organisation: { ...ORG, testPassed: true, verified: true },
    });
    expect(await screen.findByText("IdP test passed")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Activate" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("activate"));
  });

  it("shows a summary card once active, with Reconfigure connection and Disable", async () => {
    const posted = openSetup({
      canDeleteNow: false,
      organisation: { ...ORG, enabled: true, testPassed: true, verified: true },
    });
    const summary = await screen.findByRole("region", { name: "Partner Org" });
    expect(within(summary).getByText("Active")).toBeInTheDocument();
    expect(within(summary).getByText("SAML · Partner SSO")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Setup steps" })).not.toBeInTheDocument();

    await userEvent.click(within(summary).getByRole("button", { name: "Reconfigure connection" }));
    expect(screen.getByRole("list", { name: "Setup steps" })).toBeInTheDocument();

    await userEvent.click(within(summary).getByRole("button", { name: "Disable" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("disable"));
    expect(screen.getByRole("button", { name: "Delete organization" })).toBeDisabled();
    expect(screen.getByText("Disable the connection first.")).toBeInTheDocument();
  });

  it("removes a group mapping after asking (D29)", async () => {
    const posted = openSetup();
    const mappings = await screen.findByRole("region", { name: "Group mappings" });
    await userEvent.click(
      within(mappings).getByRole("button", { name: "Remove the mapping for finance-staff" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Remove this group mapping?" });
    expect(
      within(dialog).getByText(
        "Users asserting finance-staff will no longer be added to Finance team on sign-in.",
      ),
    ).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Remove mapping" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("delete-mapping"));
    expect(last(posted).get("mappingId")).toBe("m-1");
  });

  it("changes the protocol only after the destructive confirm (D25)", async () => {
    const posted = openSetup();
    await userEvent.click(await screen.findByRole("button", { name: "1 Details" }));
    await userEvent.click(screen.getByRole("radio", { name: "OIDC" }));
    await userEvent.click(screen.getByRole("button", { name: "Change protocol" }));
    const dialog = screen.getByRole("dialog", { name: "Switch partner.example.net to OIDC?" });
    expect(dialog).toHaveAttribute("data-tone", "danger");
    await userEvent.click(within(dialog).getByRole("button", { name: "Change protocol" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("change-protocol"));
    expect(last(posted).get("protocol")).toBe("oidc");
  });

  it("deletes a disabled organization after asking (D26)", async () => {
    const posted = openSetup();
    await userEvent.click(await screen.findByRole("button", { name: "Delete organization" }));
    const dialog = screen.getByRole("dialog", { name: "Delete partner.example.net?" });
    expect(
      within(dialog).getByText(
        "Users on this domain will no longer be able to sign in via SSO. This cannot be undone.",
      ),
    ).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete organization" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("delete"));
  });
});
