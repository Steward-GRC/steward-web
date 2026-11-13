// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType, PolicyStatus, Sensitivity } from "@steward-web/api-client";
import { Toaster } from "@steward-web/ui";
import { type PolicyDetail } from "@steward-web/ui/domain";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { AdminPolicyReader } from "./AdminPolicyReader";

const published: PolicyDetail = {
  ack: null,
  appendices: [],
  body: [{ depth: 1, kind: "heading", sectionKey: "purpose", text: "Purpose" }],
  bodyText: "",
  bodyUnreadable: false,
  canBreakGlass: false,
  category: "Workplace",
  categorySlug: "workplace",
  contacts: [],
  contentObfuscated: false,
  currentVersionId: "v-1",
  definitions: [],
  documentType: DocumentType.Policy,
  history: [],
  id: "p-desk",
  number: "POL-FACILITIES-000001",
  ownerName: "Dave",
  priorVersion: null,
  published: "2026-10-02T12:00:00Z",
  references: [],
  related: [],
  revision: null,
  sensitivity: Sensitivity.Standard,
  status: PolicyStatus.Published,
  subcategory: "Facilities",
  subcategorySlug: "facilities",
  summary: null,
  title: "Desk Booking Policy",
  updated: "2026-10-02T12:00:00Z",
  version: "1.0.0",
};

const draft: PolicyDetail = {
  ...published,
  currentVersionId: null,
  published: null,
  status: PolicyStatus.Draft,
  title: "Visitor Sign-in Policy",
};

type Action = (fields: Record<string, string>) => unknown;

const SECTIONS = [
  { documentTypes: "NONE", id: "c-workplace", path: "Workplace" },
  { documentTypes: "BOTH", id: "c-travel", path: "Workplace › Travel" },
  { documentTypes: "PROCEDURES", id: "c-conduct", path: "People › Conduct" },
];

const PEOPLE = [{ email: "carol@example.org", id: "u-carol", name: "Carol" }];

const openReader = (
  detail: PolicyDetail,
  { action, isSiteAdmin = true }: { action?: Action; isSiteAdmin?: boolean } = {},
) => {
  const posted: Record<string, string>[] = [];
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const body = await request.formData();
        const fields = Object.fromEntries(
          [...body.entries()].map(([key, value]) => [key, String(value)]),
        );
        posted.push(fields);
        return action?.(fields) ?? { intent: fields["intent"], ok: true };
      },
      Component: () => (
        <AdminPolicyReader detail={detail} isSiteAdmin={isSiteAdmin} viewerName="Alice" />
      ),
      path: "/policies/:number",
    },
    { Component: () => <p>The catalog</p>, path: "/policies" },
    { Component: () => <p>The moved policy</p>, path: "/policies/POL-TRAVEL-000002" },
    { loader: () => ({ sections: SECTIONS }), path: "/resources/sections" },
    { loader: () => ({ people: PEOPLE }), path: "/resources/user-search" },
  ]);
  // The toasts live at the app root, so they outlast a navigation away from the reader.
  render(
    <>
      <Stub initialEntries={[`/policies/${detail.number}`]} />
      <Toaster />
    </>,
  );
  return posted;
};

const chooseAction = async (name: string) => {
  await userEvent.click(screen.getByRole("button", { name: "Admin actions" }));
  await userEvent.click(await screen.findByRole("menuitem", { name }));
};

describe("AdminPolicyReader (A11)", () => {
  it("keeps the everyday Actions menu as it was and gives the governance tasks their own Admin actions button (#103)", async () => {
    openReader(published);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    const everyday = await screen.findByRole("menu");
    expect(
      within(everyday)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Print / Export", "History & approvals"]);
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Admin actions" }));
    const menu = await screen.findByRole("menu");
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Export PDF", "Magic link", "Change author", "Move to section", "Retire", "Delete"]);
  });

  it("leaves Change author and Move to section to site admins", async () => {
    openReader(published, { isSiteAdmin: false });
    await userEvent.click(screen.getByRole("button", { name: "Admin actions" }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).queryByRole("menuitem", { name: "Change author" })).toBeNull();
    expect(within(menu).queryByRole("menuitem", { name: "Move to section" })).toBeNull();
    expect(within(menu).getByRole("menuitem", { name: "Retire" })).toBeInTheDocument();
  });

  it("retires the policy after D10, then returns to the catalog", async () => {
    const posted = openReader(published);
    await chooseAction("Retire");
    const dialog = await screen.findByRole("dialog", { name: "Retire this policy?" });
    expect(
      within(dialog).getByText(
        /Retiring Desk Booking Policy \(POL-FACILITIES-000001\) hides it from the catalog and cancels any outstanding acknowledgements\./,
      ),
    ).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Retire policy" }));
    expect(await screen.findByText("The catalog")).toBeInTheDocument();
    expect(posted).toEqual([{ intent: "retire" }]);
    expect(await screen.findByText("Desk Booking Policy is retired.")).toBeInTheDocument();
  });

  it("won't delete a published policy (D4)", async () => {
    openReader(published);
    await chooseAction("Delete");
    const dialog = await screen.findByRole("dialog", { name: "Permanently delete this policy?" });
    expect(
      within(dialog).getByText(
        "This removes the policy, its draft, and any appendices. This can't be undone.",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Published policies cannot be deleted.")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Delete policy" })).toBeDisabled();
  });

  it("deletes a never-published policy, then returns to the catalog", async () => {
    const posted = openReader(draft);
    await chooseAction("Delete");
    const dialog = await screen.findByRole("dialog", { name: "Permanently delete this policy?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete policy" }));
    expect(await screen.findByText("The catalog")).toBeInTheDocument();
    expect(posted).toEqual([{ intent: "delete" }]);
  });

  it("says when the gateway refuses, keeping the dialog open", async () => {
    openReader(draft, {
      action: (fields) => ({ failure: { status: 403 }, intent: fields["intent"], ok: false }),
    });
    await chooseAction("Delete");
    const dialog = await screen.findByRole("dialog", { name: "Permanently delete this policy?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete policy" }));
    expect(await within(dialog).findByText("That didn't go through.")).toBeInTheDocument();
  });

  it("changes the author to the person picked (D5)", async () => {
    const posted = openReader(draft);
    await chooseAction("Change author");
    const dialog = await screen.findByRole("dialog", { name: "Change author" });
    expect(
      within(dialog).getByText("The new author can edit drafts of Visitor Sign-in Policy."),
    ).toBeInTheDocument();
    const cta = within(dialog).getByRole("button", { name: "Change author" });
    expect(cta).toBeDisabled();
    await userEvent.type(within(dialog).getByRole("combobox", { name: "New author" }), "car");
    await userEvent.click(await within(dialog).findByRole("option", { name: /Carol/ }));
    await userEvent.click(cta);
    await waitFor(() =>
      expect(posted).toEqual([{ intent: "changeAuthor", ownerUserId: "u-carol" }]),
    );
    expect(await screen.findByText("Carol is now the author.")).toBeInTheDocument();
  });

  it("moves the policy to the section picked, then opens it at its new number (D6)", async () => {
    const posted = openReader(published, {
      action: () => ({ intent: "move", number: "POL-TRAVEL-000002", ok: true }),
    });
    await chooseAction("Move to section");
    const dialog = await screen.findByRole("dialog", { name: "Move to section" });
    expect(
      within(dialog).getByText("This renumbers the policy to the target section's sequence."),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Given when it moves")).toHaveClass("font-mono");
    await userEvent.click(
      await within(dialog).findByRole("combobox", { name: "Destination section" }),
    );
    await userEvent.click(await screen.findByRole("option", { name: "Workplace › Travel" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Move policy" }));
    expect(await screen.findByText("The moved policy")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(posted).toEqual([{ homeCategoryId: "c-travel", intent: "move" }]);
  });

  it("greys out the sections that do not hold this kind of document (#87)", async () => {
    openReader(published);
    await chooseAction("Move to section");
    const dialog = await screen.findByRole("dialog", { name: "Move to section" });
    await userEvent.click(
      await within(dialog).findByRole("combobox", { name: "Destination section" }),
    );
    expect(
      await screen.findByRole("option", { name: "Workplace (only holds other categories)" }),
    ).toHaveAttribute("data-disabled");
    expect(
      screen.getByRole("option", { name: "People › Conduct (holds procedures only)" }),
    ).toHaveAttribute("data-disabled");
    expect(screen.getByRole("option", { name: "Workplace › Travel" })).not.toHaveAttribute(
      "data-disabled",
    );
  });

  it("renders the PDF, then offers the download (D16)", async () => {
    const posted = openReader(
      { ...published, sensitivity: Sensitivity.Sensitive },
      {
        action: (fields) =>
          fields["intent"] === "exportPdf"
            ? { intent: "exportPdf", jobId: "job-7", ok: true }
            : { intent: "pdfLink", ok: true, pending: false, signedUrl: "https://files/x.pdf" },
      },
    );
    await chooseAction("Export PDF");
    const dialog = await screen.findByRole("dialog", { name: "Export PDF" });
    expect(
      within(dialog).getByText("Desk Booking Policy · watermarked (sensitive)"),
    ).toBeInTheDocument();
    expect(await within(dialog).findByText("Your PDF is ready to download.")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Download PDF" })).toHaveAttribute(
      "href",
      "https://files/x.pdf",
    );
    expect(posted).toEqual([{ intent: "exportPdf" }, { intent: "pdfLink", jobId: "job-7" }]);
  });

  it("says it's rendering while the PDF isn't ready", async () => {
    openReader(published, {
      action: (fields) =>
        fields["intent"] === "exportPdf"
          ? { intent: "exportPdf", jobId: "job-7", ok: true }
          : { intent: "pdfLink", ok: true, pending: true },
    });
    await chooseAction("Export PDF");
    const dialog = await screen.findByRole("dialog", { name: "Export PDF" });
    expect(
      await within(dialog).findByText("Rendering the document… this usually takes a few seconds."),
    ).toBeInTheDocument();
    expect(within(dialog).queryByRole("link", { name: "Download PDF" })).toBeNull();
  });

  it("creates a magic link for the version, then revokes it (D31)", async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const posted = openReader(published, {
      action: (fields) =>
        fields["intent"] === "createMagicLink"
          ? {
              expiresAt: "2026-12-05T12:00:00Z",
              intent: "createMagicLink",
              ok: true,
              token: "7c1e04b2",
              url: "https://policies.example.org/share/7c1e04b2",
            }
          : { intent: "revokeMagicLink", ok: true, token: "7c1e04b2" },
    });
    await chooseAction("Magic link");
    const sheet = await screen.findByRole("dialog", { name: "Magic links" });
    expect(
      within(sheet).getByText("Desk Booking Policy · POL-FACILITIES-000001"),
    ).toBeInTheDocument();
    expect(
      within(sheet).getByText(
        "Links issued before aren't listed here yet. They will be once the gateway can list them.",
      ),
    ).toBeInTheDocument();

    await userEvent.click(within(sheet).getByRole("button", { name: "Create for v1.0.0" }));
    expect(await within(sheet).findByText("policies.example.org/share/7c1e04b2")).toHaveClass(
      "font-mono",
    );
    expect(within(sheet).getByRole("img", { name: "QR code for the v1.0.0 link" })).toBeVisible();
    expect(within(sheet).getByText(/^Active · by Alice · /)).toBeInTheDocument();

    await userEvent.click(within(sheet).getByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalledWith("https://policies.example.org/share/7c1e04b2");

    await userEvent.click(within(sheet).getByRole("button", { name: "Revoke" }));
    expect(await within(sheet).findByText(/^Revoked · by Alice · /)).toBeInTheDocument();
    expect(within(sheet).queryByRole("button", { name: "Copy" })).toBeNull();
    expect(posted).toEqual([
      { intent: "createMagicLink" },
      { intent: "revokeMagicLink", token: "7c1e04b2" },
    ]);
  });

  it("re-issues a link, replacing the old one", async () => {
    let issued = 0;
    openReader(published, {
      action: (fields) => {
        issued += 1;
        const token = issued === 1 ? "7c1e04b2" : "9f20aa31";
        return {
          expiresAt: "2026-12-05T12:00:00Z",
          intent: fields["intent"],
          ok: true,
          ...(fields["intent"] === "reissueMagicLink" ? { replaced: fields["token"] } : {}),
          token,
          url: `https://policies.example.org/share/${token}`,
        };
      },
    });
    await chooseAction("Magic link");
    const sheet = await screen.findByRole("dialog", { name: "Magic links" });
    await userEvent.click(within(sheet).getByRole("button", { name: "Create for v1.0.0" }));
    await userEvent.click(await within(sheet).findByRole("button", { name: "Re-issue" }));
    expect(
      await within(sheet).findByText("policies.example.org/share/9f20aa31"),
    ).toBeInTheDocument();
    expect(within(sheet).queryByText("policies.example.org/share/7c1e04b2")).toBeNull();
  });

  it("offers no link or export before the first publish", async () => {
    openReader(draft);
    await userEvent.click(screen.getByRole("button", { name: "Admin actions" }));
    expect(await screen.findByRole("menuitem", { name: "Export PDF" })).toHaveAttribute(
      "data-disabled",
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "Magic link" }));
    const sheet = await screen.findByRole("dialog", { name: "Magic links" });
    expect(
      within(sheet).getByText("Publish this policy before sharing a link to it."),
    ).toBeInTheDocument();
    expect(within(sheet).queryByRole("button", { name: /Create for/ })).toBeNull();
  });

  it("picks the new author from the keyboard: Down to the matches, Enter to choose (D5)", async () => {
    const posted = openReader(draft);
    await chooseAction("Change author");
    const dialog = await screen.findByRole("dialog", { name: "Change author" });
    await userEvent.type(within(dialog).getByRole("combobox", { name: "New author" }), "car");
    await within(dialog).findByRole("option", { name: /Carol/ });
    await userEvent.keyboard("{ArrowDown}");
    expect(within(dialog).getByRole("option", { name: /Carol/ })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(within(dialog).getByRole("combobox", { name: "New author" })).toHaveValue("Carol");
    await userEvent.click(within(dialog).getByRole("button", { name: "Change author" }));
    await waitFor(() =>
      expect(posted).toEqual([{ intent: "changeAuthor", ownerUserId: "u-carol" }]),
    );
  });
});
