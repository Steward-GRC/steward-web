// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDate } from "@steward-web/i18n";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { SecurityMethods, type SecurityMethodsProps } from "./SecurityMethods";

const passkeyApi = vi.hoisted(() => ({
  createPasskey: vi.fn(async () => ({ credentialJson: '{"id":"cred-9"}' })),
  passkeyCreationSupported: vi.fn(() => true),
}));
vi.mock("@steward-web/auth", async (original) => ({
  ...(await original<object>()),
  ...passkeyApi,
}));

const email = { enrolledAt: null, kind: "email", label: null };
const app = { enrolledAt: "2026-10-03T00:00:00Z", kind: "totp", label: "Work phone" };
const laptop = {
  createdAt: "2026-10-04T00:00:00Z",
  id: "cred-1",
  label: "Laptop",
  lastUsedAt: null,
};

const openSecurity = (
  props: SecurityMethodsProps,
  action: (form: FormData) => unknown = () => ({}),
) => {
  const posted: FormData[] = [];
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const form = await request.formData();
        posted.push(form);
        return action(form);
      },
      Component: () => <SecurityMethods {...props} />,
      path: "/profile/security",
    },
  ]);
  render(<Stub initialEntries={["/profile/security"]} />);
  return posted;
};

describe("Profile: security (U33)", () => {
  it("lists the email code as the baseline that can't be removed", async () => {
    openSecurity({ factors: [email], passkeys: [] });
    const methods = await screen.findByRole("region", { name: "Security methods" });
    const row = within(methods).getAllByRole("listitem")[0]!;
    expect(row).toHaveTextContent("Email codeBaseline · can't be removed");
    expect(within(row).queryByRole("button", { name: "Remove" })).toBeNull();
  });

  it("names the authenticator app with when it was added, to rename or remove", async () => {
    openSecurity({ factors: [email, app], passkeys: [] });
    const methods = await screen.findByRole("region", { name: "Security methods" });
    expect(methods).toHaveTextContent(
      `Work phoneAuthenticator app · added ${formatDate("2026-10-03T00:00:00Z")}`,
    );
    expect(within(methods).getAllByRole("button", { name: "Rename" })).toHaveLength(1);
  });

  it("removes the app after asking", async () => {
    const posted = openSecurity({ factors: [email, app], passkeys: [] });
    await userEvent.click(await screen.findByRole("button", { name: "Remove" }));
    const dialog = screen.getByRole("dialog", { name: "Remove Work phone?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Remove" }));
    await vi.waitFor(() => expect(posted.map((f) => f.get("intent"))).toEqual(["remove-totp"]));
  });

  it("sets up an authenticator app: the QR, then its first code", async () => {
    const posted = openSecurity({ factors: [email], passkeys: [] }, (form) =>
      form.get("intent") === "totp-begin"
        ? { totp: { otpauthUri: "otpauth://totp/Steward:erin?secret=ABC" } }
        : { problem: "code" },
    );
    await userEvent.click(await screen.findByRole("button", { name: "Set up" }));
    expect(
      await screen.findByRole("img", { name: "QR code for your authenticator app" }),
    ).toBeVisible();
    await userEvent.type(screen.getByRole("textbox", { name: "6-digit code" }), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Add the app" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("That code didn't work. Try again.");
    expect(posted.at(-1)?.get("code")).toBe("123456");
  });

  it("lists each passkey, and registers a new one through the browser", async () => {
    const posted = openSecurity({ factors: [email], passkeys: [laptop] }, (form) =>
      form.get("intent") === "passkey-begin"
        ? { passkey: { optionsJson: '{"publicKey":{}}', sessionId: "ceremony-1" } }
        : { ok: "passkey" },
    );
    const methods = await screen.findByRole("region", { name: "Security methods" });
    expect(methods).toHaveTextContent(
      `LaptopPasskey · added ${formatDate("2026-10-04T00:00:00Z")}`,
    );
    await userEvent.click(screen.getByRole("button", { name: "Register a passkey" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Passkey registered. Choose “Sign in with a passkey” the next time you sign in.",
    );
    expect(passkeyApi.createPasskey).toHaveBeenCalledWith('{"publicKey":{}}');
    const finish = posted.find((f) => f.get("intent") === "passkey-finish")!;
    expect([finish.get("sessionId"), finish.get("credentialJson")]).toEqual([
      "ceremony-1",
      '{"id":"cred-9"}',
    ]);
  });

  it("says when the browser can't create a passkey", async () => {
    passkeyApi.passkeyCreationSupported.mockReturnValueOnce(false);
    openSecurity({ factors: [email], passkeys: [] });
    expect(await screen.findByText("This browser can't create a passkey.")).toBeVisible();
  });

  it("signs out every other session and says how many", async () => {
    openSecurity({ factors: [email], passkeys: [] }, () => ({ revoked: 2 }));
    await userEvent.click(await screen.findByRole("button", { name: "Sign out everywhere else" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Signed out of 2 other sessions.");
  });
});
