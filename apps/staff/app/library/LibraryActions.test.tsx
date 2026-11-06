// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { type Identity, IdentityProvider, NO_ACCESS } from "@steward-web/auth";
import { DocumentType } from "@steward-web/ui/domain";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { LibraryActions } from "./LibraryActions";

const person = (permissions: string[]): Identity => ({
  ...NO_ACCESS,
  id: "u-1",
  name: "Bob Author",
  permissions: new Set(permissions),
});

const renderFor = (identity: Identity, documentType: DocumentType, at = "/") => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <IdentityProvider identity={identity}>
          <LibraryActions documentType={documentType} />
        </IdentityProvider>
      ),
      path: "/",
    },
  ]);
  render(<Stub initialEntries={[at]} />);
};

describe("the library's header actions (U3, U4)", () => {
  it("offers an author Import and New policy", () => {
    renderFor(person(["policy.read", "policy.author"]), DocumentType.Policy);
    expect(screen.getByRole("link", { name: "Import" })).toHaveAttribute("href", "/drafts/import");
    expect(screen.getByRole("link", { name: "New policy" })).toHaveAttribute(
      "href",
      "/drafts/new/policy",
    );
  });

  it("starts a new draft in the category of the folder being viewed (#148)", () => {
    renderFor(
      person(["policy.read", "policy.author"]),
      DocumentType.Policy,
      "/?category=Workplace&subcategory=Facilities",
    );
    expect(screen.getByRole("link", { name: "New policy" })).toHaveAttribute(
      "href",
      "/drafts/new/policy?category=Workplace&subcategory=Facilities",
    );
  });

  it("offers New procedure on the procedures library", () => {
    renderFor(person(["policy.read", "policy.author"]), DocumentType.Procedure);
    expect(screen.getByRole("link", { name: "New procedure" })).toHaveAttribute(
      "href",
      "/drafts/new/procedure",
    );
  });

  it("offers a reader neither", () => {
    renderFor(person(["policy.read"]), DocumentType.Policy);
    expect(screen.queryByRole("link")).toBeNull();
  });
});
