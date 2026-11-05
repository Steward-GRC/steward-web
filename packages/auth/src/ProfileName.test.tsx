// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { type Identity, NO_ACCESS } from "./identity";
import { IdentityProvider } from "./IdentityContext";
import { ProfileName } from "./ProfileName";

const identity = (overrides: Partial<Identity> = {}): Identity => ({
  ...NO_ACCESS,
  email: "bob@example.org",
  id: "u-1",
  username: "ada",
  ...overrides,
});

// ProfileName renders a react-router <Form>, which needs a data router to render at all;
// createRoutesStub gives it one without a real loader or action.
const renderAt = (identityValue: Identity, props: Parameters<typeof ProfileName>[0] = {}) => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <IdentityProvider identity={identityValue}>
          <ProfileName {...props} />
        </IdentityProvider>
      ),
      path: "/profile",
    },
  ]);
  render(<Stub initialEntries={["/profile"]} />);
};

describe("ProfileName", () => {
  it("prefills the first and last name fields from the signed-in identity", () => {
    renderAt(identity({ firstName: "Bob", lastName: "Author" }));
    expect(screen.getByLabelText("First name")).toHaveValue("Bob");
    expect(screen.getByLabelText("Last name")).toHaveValue("Author");
    expect(screen.getByText(/Bob Author/)).toBeInTheDocument();
  });

  it("shows the empty-state preview when neither name part is set yet", () => {
    renderAt(identity());
    expect(screen.getByText("Enter your first and last name.")).toBeInTheDocument();
  });

  it("shows the save error banner the route's action reported", () => {
    renderAt(identity({ firstName: "Bob", lastName: "Author" }), { error: { status: 400 } });
    expect(screen.getByText("We couldn't save your name. Please try again.")).toBeInTheDocument();
  });
});
