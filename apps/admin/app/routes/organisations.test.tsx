// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { asPhone } from "../test/phone";
import Organizations from "./organisations";

const ORGS = [
  {
    domain: "partner.example.net",
    enabled: false,
    orgName: "Partner Org",
    protocol: "saml",
    testPassed: false,
    verified: true,
  },
  {
    domain: "example.org",
    enabled: true,
    orgName: "Example Organisation",
    protocol: "oidc",
    testPassed: true,
    verified: true,
  },
];

const CERT = {
  active: true,
  certPem: "-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----",
  notAfter: "2027-10-02T12:00:00Z",
  serial: "4F:2A:91",
  spMetadataXml: "<EntityDescriptor/>",
};

type OrganizationsProps = Parameters<typeof Organizations>[0];

const openOrganizations = (organisations: object[] = ORGS, spCertificate: null | object = CERT) => {
  const posted: FormData[] = [];
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        posted.push(await request.formData());
        return { intent: "rotate-certificate", ok: true };
      },
      Component: () => (
        <Organizations
          {...({
            loaderData: { organisations, spCertificate },
          } as unknown as OrganizationsProps)}
        />
      ),
      path: "/organisations",
    },
  ]);
  render(<Stub initialEntries={["/organisations"]} />);
  return posted;
};

describe("Organizations (A23) with single sign-on not set up", () => {
  it("still lists the organisations and says single sign-on is not set up", async () => {
    openOrganizations(ORGS, null);
    expect(await screen.findByText("Partner Org")).toBeInTheDocument();
    expect(screen.getByText("SP certificate")).toBeInTheDocument();
    expect(screen.getByText("Single sign-on is not set up on this server.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Force rotate" })).not.toBeInTheDocument();
  });
});

describe("Organizations (A23)", () => {
  it("has the title, the subtitle and + New organization", async () => {
    openOrganizations();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Organizations" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("SAML/OIDC single sign-on connections, one per domain."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ New organization" })).toHaveAttribute(
      "href",
      "/organisations/new",
    );
  });

  it("lists domain, organization, protocol and the Verified, Tested and Active badges", async () => {
    openOrganizations();
    const table = await screen.findByRole("table");
    const [, partner, example] = within(table).getAllByRole("row");
    expect(within(partner!).getByRole("link", { name: "partner.example.net" })).toHaveAttribute(
      "href",
      "/organisations/partner.example.net",
    );
    expect(within(partner!).getByText("SAML")).toBeInTheDocument();
    expect(within(partner!).getByText("Verified")).toBeInTheDocument();
    expect(within(partner!).getByText("Not tested")).toBeInTheDocument();
    expect(within(partner!).getByText("Not active")).toBeInTheDocument();
    expect(within(example!).getByText("Active")).toBeInTheDocument();
  });

  it("shows the SP certificate with copy buttons, and force rotate asks first (D28)", async () => {
    const writeText = vi.fn(async (_text: string) => {});
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const posted = openOrganizations();
    const cert = await screen.findByRole("region", { name: "SP certificate" });
    expect(within(cert).getByText("Serial 4F:2A:91")).toBeInTheDocument();
    expect(within(cert).getByText("Expires 2 Oct 2027")).toBeInTheDocument();

    await userEvent.click(within(cert).getByRole("button", { name: "Copy certificate" }));
    expect(writeText).toHaveBeenCalledWith(CERT.certPem);
    await userEvent.click(within(cert).getByRole("button", { name: "Copy SP metadata" }));
    expect(writeText).toHaveBeenCalledWith(CERT.spMetadataXml);

    await userEvent.click(within(cert).getByRole("button", { name: "Force rotate" }));
    const dialog = screen.getByRole("dialog", { name: "Force-rotate the SP certificate?" });
    expect(dialog).toHaveAttribute("data-tone", "danger");
    await userEvent.click(within(dialog).getByRole("button", { name: "Rotate certificate" }));
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]!.get("intent")).toBe("rotate-certificate");
  });

  it("says when there are no organizations", async () => {
    openOrganizations([]);
    expect(await screen.findByText("No organizations yet")).toBeInTheDocument();
  });
});

describe("Organizations on a phone (7-responsive.s3)", () => {
  it("lists each domain as a card with its organization and its badges", async () => {
    asPhone();
    openOrganizations();
    const list = await screen.findByRole("list", { name: "Organizations" });
    expect(screen.queryByRole("table")).toBeNull();
    const [partner, example] = within(list).getAllByRole("listitem");
    expect(within(partner!).getByRole("link", { name: "partner.example.net" })).toHaveAttribute(
      "href",
      "/organisations/partner.example.net",
    );
    // The domain, the organization's name, then the protocol and the three badges.
    expect(partner!.textContent).toBe(
      "partner.example.netPartner OrgSAMLVerifiedNot testedNot active",
    );
    expect(example).toHaveTextContent("example.org");
  });

  it("narrows the cards from the search", async () => {
    asPhone();
    openOrganizations();
    await userEvent.type(
      await screen.findByRole("searchbox", { name: "Search organizations" }),
      "partner",
    );
    expect(
      within(screen.getByRole("list", { name: "Organizations" })).getAllByRole("listitem"),
    ).toHaveLength(1);
  });
});
