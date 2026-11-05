// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The sign-in gates as the page draws them (Gates G3, G3m, G4, G5, G6, G7, G8, G9), through
// SignIn's props and the route's own forms.
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ActionFunctionArgs, createRoutesStub, redirect } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SignInCapabilities, SignInState } from "./signInState";

import { SignIn, type SignInProps } from "./SignIn";

const NONE: SignInCapabilities = { passkey: false, passwordReset: false, sso: false };
const ALL: SignInCapabilities = { passkey: true, passwordReset: true, sso: true };

const renderSignIn = (
  props: { state: SignInState } & Partial<SignInProps>,
  action?: (parameters: ActionFunctionArgs) => unknown,
) => {
  const Stub = createRoutesStub([
    {
      action: action ?? (() => null),
      Component: () => <SignIn capabilities={NONE} next="/policies" {...props} />,
      path: "/sign-in",
    },
    { Component: () => <p>Home</p>, loader: () => new Promise(() => {}), path: "/policies" },
  ]);
  return render(<Stub initialEntries={["/sign-in?next=%2Fpolicies"]} />);
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("G3: sign in with a password", () => {
  it("leads with the organisation slot, then Steward and the tagline", async () => {
    renderSignIn({ organisation: "Example Organisation", state: { view: "password" } });
    // Drawn twice: above the card on a phone (G3m) and inside it from 640 px (G3); CSS shows one.
    expect(await screen.findAllByText("Example Organisation")).toHaveLength(2);
    expect(screen.getAllByText("EO")).toHaveLength(2);
    expect(screen.getAllByRole("img", { name: "Steward" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rules kept. Voices heard.™").length).toBeGreaterThan(0);
  });

  it("asks for the email or username and the password, and says Sign in", async () => {
    renderSignIn({ state: { view: "password" } });
    expect(await screen.findByLabelText("Email or username")).toHaveAttribute(
      "autocomplete",
      "username",
    );
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Sign in" })).toHaveAttribute("type", "submit");
    expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("/policies")).toHaveAttribute("name", "next");
    expect(screen.getByDisplayValue("login")).toHaveAttribute("name", "intent");
  });

  it("offers Forgot password? only where the gateway can reset a password", async () => {
    renderSignIn({ state: { view: "password" } });
    await screen.findByLabelText("Password");
    expect(screen.queryByRole("link", { name: "Forgot password?" })).not.toBeInTheDocument();
  });

  it("links Forgot password? to the reset step, keeping where to go next", async () => {
    renderSignIn({ capabilities: ALL, state: { view: "password" } });
    const links = await screen.findAllByRole("link", { name: "Forgot password?" });
    for (const link of links)
      expect(link).toHaveAttribute("href", "/sign-in?step=reset&next=%2Fpolicies");
  });

  it("keeps SSO under an or divider, turned off until an organisation has set it up", async () => {
    renderSignIn({ state: { view: "password" } });
    expect(await screen.findByText("or")).toBeInTheDocument();
    const sso = screen.getByRole("button", { name: "Sign in with SSO →" });
    expect(sso).toHaveAttribute("aria-disabled", "true");
    expect(sso).toHaveAccessibleDescription("No organization has finished setting up SSO yet.");
  });

  it("opens the SSO step once an organisation has set it up", async () => {
    renderSignIn({ capabilities: ALL, state: { view: "password" } });
    expect(await screen.findByRole("link", { name: "Sign in with SSO →" })).toHaveAttribute(
      "href",
      "/sign-in?step=sso&next=%2Fpolicies",
    );
  });

  it("offers a passkey only when the gateway and the browser both can", async () => {
    renderSignIn({ capabilities: ALL, state: { view: "password" } });
    await screen.findByLabelText("Password");
    expect(screen.queryByRole("button", { name: "Sign in with a passkey" })).toBeNull();

    vi.stubGlobal("PublicKeyCredential", { parseRequestOptionsFromJSON: vi.fn() });
    renderSignIn({ capabilities: ALL, state: { view: "password" } });
    expect(await screen.findByRole("button", { name: "Sign in with a passkey" })).toBeVisible();
  });

  it("shows a refusal inline above the fields and ties it to the password", async () => {
    renderSignIn({
      state: { identifier: "alice@example.org", problem: "invalid", view: "password" },
    });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Incorrect username or password.");
    expect(screen.getByLabelText("Email or username")).toHaveValue("alice@example.org");
    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("aria-invalid", "true");
    expect(password.getAttribute("aria-describedby")).toBe(alert.id);
  });

  it.each([
    ["missing", "Enter your username and password."],
    ["throttled", "Too many attempts. Wait a moment and try again."],
    ["expired", "Your sign-in timed out. Please start again."],
    ["passkey", "That passkey didn't work. Try again, or sign in with your password."],
    ["sso", "Single sign-on didn't finish. Try again, or sign in with your password."],
    [
      "ssoNotActive",
      "Your organization hasn't finished setting up single sign-on yet. Sign in with your password.",
    ],
  ] as const)("says %s as the design words it", async (problem, text) => {
    renderSignIn({ state: { problem, view: "password" } });
    expect(await screen.findByRole("alert")).toHaveTextContent(text);
  });

  it("confirms a new password before asking for it", async () => {
    renderSignIn({
      state: { identifier: "alice@example.org", notice: "passwordReset", view: "password" },
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Your password is set. Sign in with it now.",
    );
  });

  it("carries the dev quick login under the card", async () => {
    renderSignIn({ quickLogin: <p>quick login</p>, state: { view: "password" } });
    expect(await screen.findByText("quick login")).toBeInTheDocument();
  });

  it("marks the admin console's sign-in with the Admin tag", async () => {
    renderSignIn({ admin: true, state: { view: "password" } });
    expect(await screen.findAllByText("Admin")).toHaveLength(2);
  });
});

const credential = { toJSON: () => ({ id: "cred-1", type: "public-key" }) };

const stubPasskeys = (get: () => Promise<unknown>) => {
  vi.stubGlobal("PublicKeyCredential", {
    parseRequestOptionsFromJSON: vi.fn((options: unknown) => ({ parsed: options })),
  });
  Object.defineProperty(globalThis.navigator, "credentials", {
    configurable: true,
    value: { get: vi.fn(get) },
  });
};

describe("G5: sign in with a passkey", () => {
  it("asks the browser for the passkey and signs in with its answer", async () => {
    stubPasskeys(async () => credential);
    const seen: Record<string, string>[] = [];
    renderSignIn({ capabilities: ALL, state: { view: "password" } }, async ({ request }) => {
      const form = Object.fromEntries(await request.formData()) as Record<string, string>;
      seen.push(form);
      if (form.intent === "passkey-begin")
        return { passkey: { flowId: "flow-1", optionsJson: '{"publicKey":{"challenge":"x"}}' } };
      return redirect("/policies");
    });

    await userEvent.click(await screen.findByRole("button", { name: "Sign in with a passkey" }));

    await waitFor(() =>
      expect(seen.map((form) => form.intent)).toEqual(["passkey-begin", "passkey-finish"]),
    );
    expect(seen[1]).toMatchObject({
      credentialJson: '{"id":"cred-1","type":"public-key"}',
      flowId: "flow-1",
      next: "/policies",
    });
    expect(navigator.credentials.get).toHaveBeenCalledWith({
      publicKey: { parsed: { challenge: "x" } },
    });
  });

  it("says so when the person cancels the browser's prompt", async () => {
    stubPasskeys(async () => {
      throw new DOMException("cancelled", "NotAllowedError");
    });
    renderSignIn({ capabilities: ALL, state: { view: "password" } }, () => ({
      passkey: { flowId: "flow-1", optionsJson: '{"publicKey":{"challenge":"x"}}' },
    }));

    await userEvent.click(await screen.findByRole("button", { name: "Sign in with a passkey" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Passkey sign-in was cancelled.");
  });
});

const code = (extra: Partial<Extract<SignInState, { view: "code" }>> = {}): SignInState => ({
  factor: "totp",
  factors: ["totp", "email"],
  pendingId: "p-1",
  view: "code",
  ...extra,
});

describe("G6: the second factor", () => {
  it("asks which method to use when there are several", async () => {
    renderSignIn({ state: code({ choose: true, sentTo: "a•••@example.org" }) });
    const card = await screen.findByRole("region", { name: "Choose a method" });
    const app = within(card).getByRole("button", { name: "Authenticator app" });
    expect(app).toHaveAttribute("name", "intent");
    expect(app).toHaveAttribute("value", "choose");
    expect(within(card).getByRole("button", { name: "Email code" })).toHaveAttribute(
      "value",
      "email",
    );
    expect(within(card).queryByRole("button", { name: "Use your passkey" })).toBeNull();
  });

  it("lists the passkey when the gateway offers one and the browser can use it", async () => {
    vi.stubGlobal("PublicKeyCredential", { parseRequestOptionsFromJSON: vi.fn() });
    renderSignIn({ state: code({ choose: true, factors: ["totp", "email", "passkey"] }) });
    expect(await screen.findByRole("button", { name: "Use your passkey" })).toBeVisible();
  });

  it("asks for the emailed code in six boxes, with Verify and Resend code", async () => {
    renderSignIn({
      state: code({ emailSent: "sent", factor: "email", sentTo: "a•••@example.org" }),
    });
    const card = await screen.findByRole("region", { name: "Verification code" });
    expect(within(card).getByText("Sent to a•••@example.org")).toBeInTheDocument();
    expect(within(card).getAllByTestId("code-box")).toHaveLength(6);
    expect(within(card).getByRole("textbox", { name: "Verification code" })).toHaveAttribute(
      "name",
      "code",
    );
    expect(within(card).getByRole("button", { name: "Verify" })).toHaveAttribute("type", "submit");
    expect(within(card).getByRole("button", { name: "Resend code" })).toHaveAttribute(
      "value",
      "email",
    );
  });

  it("offers Send code before an email code has gone out", async () => {
    renderSignIn({ state: code({ factor: "email", factors: ["email"] }) });
    expect(await screen.findByRole("button", { name: "Send code" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Resend code" })).toBeNull();
  });

  it("asks for the authenticator's code, with a way back to the other methods", async () => {
    renderSignIn({ state: code() });
    expect(
      await screen.findByText("Enter the 6-digit code from your authenticator app."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Resend code" })).toBeNull();
    expect(screen.getByRole("button", { name: "Choose another method" })).toBeInTheDocument();
  });

  it("says a wrong code didn't work, against the boxes", async () => {
    renderSignIn({ state: code({ problem: "wrong" }) });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("That code didn't work. Try again.");
    expect(screen.getByRole("textbox", { name: "Verification code" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});

describe("G7: set up a second factor", () => {
  it("shows the QR code, the secret to type and the confirm code", async () => {
    renderSignIn({
      state: {
        otpauthUri: "otpauth://totp/Steward:alice?issuer=Steward&secret=JBSWY3DPEHPK3PXP",
        pendingId: "p-1",
        secret: "JBSW************",
        view: "enrol",
      },
    });
    expect(await screen.findByRole("heading", { name: "Authenticator app" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "QR code" })).toBeInTheDocument();
    expect(
      screen.getByText("Scan the code, or enter the secret: JBSW Y3DP EHPK 3PXP"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("6-digit code")).toHaveAttribute("autocomplete", "one-time-code");
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveAttribute("type", "submit");
  });
});

describe("G4: sign in with SSO", () => {
  it("asks for the email or username, with Continue and the way back", async () => {
    renderSignIn({ state: { view: "sso" } });
    expect(await screen.findByRole("heading", { name: "Sign in with SSO" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email or username")).toHaveAttribute("name", "identifier");
    expect(screen.getByRole("button", { name: "Continue" })).toHaveAttribute("value", "sso");
    expect(screen.getByRole("link", { name: "← Back to password sign-in" })).toHaveAttribute(
      "href",
      "/sign-in?next=%2Fpolicies",
    );
  });
});

describe("G8: reset a password", () => {
  it("asks for the email first", async () => {
    renderSignIn({ state: { step: "request", view: "reset" } });
    expect(await screen.findByRole("heading", { name: "Reset your password" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByRole("button", { name: "Send reset code" })).toHaveAttribute(
      "value",
      "reset-request",
    );
    expect(screen.getByRole("link", { name: "Back to sign in" })).toBeInTheDocument();
  });

  it("then asks for the code and the new password", async () => {
    renderSignIn({
      state: { email: "alice@example.org", problem: "code", step: "confirm", view: "reset" },
    });
    expect(await screen.findByLabelText("Verification code")).toHaveAttribute("name", "code");
    expect(screen.getByLabelText("New password")).toHaveAttribute("autocomplete", "new-password");
    expect(screen.getByDisplayValue("alice@example.org")).toHaveAttribute("name", "email");
    expect(screen.getByRole("button", { name: "Set new password" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "That code is invalid or has expired. Request a new code, then try again.",
    );
  });
});

describe("G9: signing in", () => {
  it("shows the loading mark while the session resolves", async () => {
    renderSignIn({ state: { view: "signing-in" } });
    expect(await screen.findByRole("heading", { name: "Signing in…" })).toBeInTheDocument();
  });

  it("takes over the card once the gateway has let the person in", async () => {
    renderSignIn({ state: { view: "password" } }, () => redirect("/policies"));
    await userEvent.type(await screen.findByLabelText("Email or username"), "alice");
    await userEvent.type(screen.getByLabelText("Password"), "secret");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("heading", { name: "Signing in…" })).toBeInTheDocument();
  });
});

describe("after a successful sign-in in this tab", () => {
  it("always moves on to where the person was going", async () => {
    const Stub = createRoutesStub([
      {
        action: () => redirect("/policies"),
        Component: () => (
          <SignIn capabilities={NONE} next="/policies" state={{ view: "password" }} />
        ),
        path: "/sign-in",
      },
      { Component: () => <p>Home</p>, path: "/policies" },
    ]);
    render(<Stub initialEntries={["/sign-in?next=%2Fpolicies"]} />);
    await userEvent.type(await screen.findByLabelText("Email or username"), "bob");
    await userEvent.type(screen.getByLabelText("Password"), "secret");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Home")).toBeInTheDocument();
  });
});

describe("G3: every failure says what happened", () => {
  it.each([
    ["invalid", "Incorrect username or password."],
    ["disabled", "This account is disabled. Contact your administrator."],
    ["unreachable", "Couldn't reach Steward. Try again."],
    ["quickLoginUnavailable", "Quick login isn't available on this server."],
  ] as const)("says %s calmly, inline", async (problem, message) => {
    renderSignIn({ state: { problem, view: "password" } });
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
  });
});

describe("the dev quick login's refusals", () => {
  it("shows the mock's own words when it won't sign the person in", async () => {
    renderSignIn({
      state: {
        message: "Frank Disabled is disabled.",
        problem: "quickLoginRefused",
        view: "password",
      },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("Frank Disabled is disabled.");
  });
});

/** A `/resources/session` that answers `answer`, counting the checks. */
const sessionAnswers = (answer: { name?: string; signedIn: boolean }) => {
  const checks: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      checks.push(String(input));
      return Response.json(answer);
    }),
  );
  return checks;
};

const renderWithHome = () => {
  const Stub = createRoutesStub([
    {
      Component: () => <SignIn capabilities={NONE} next="/policies" state={{ view: "password" }} />,
      path: "/sign-in",
    },
    { Component: () => <p>Home</p>, path: "/policies" },
  ]);
  return render(<Stub initialEntries={["/sign-in?next=%2Fpolicies"]} />);
};

describe("a session that appears elsewhere", () => {
  it("moves on by itself when the tab comes back and there's a session", async () => {
    const checks = sessionAnswers({ name: "Bob Author", signedIn: true });
    renderWithHome();
    await screen.findByLabelText("Email or username");
    globalThis.dispatchEvent(new Event("focus"));
    expect(await screen.findByText("Home")).toBeInTheDocument();
    expect(checks).toEqual(["/resources/session"]);
  });

  it("checks again when the tab becomes visible", async () => {
    const checks = sessionAnswers({ signedIn: false });
    renderWithHome();
    await screen.findByLabelText("Email or username");
    document.dispatchEvent(new Event("visibilitychange"));
    await waitFor(() => expect(checks).toHaveLength(1));
    expect(screen.queryByText("Home")).toBeNull();
    expect(screen.getByLabelText("Email or username")).toBeInTheDocument();
  });

  it("checks every few seconds while the tab is visible", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const checks = sessionAnswers({ signedIn: false });
      renderWithHome();
      await screen.findByLabelText("Email or username");
      await vi.advanceTimersByTimeAsync(5000);
      expect(checks).toHaveLength(1);
      await vi.advanceTimersByTimeAsync(5000);
      expect(checks).toHaveLength(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("says who is signed in, with Refresh, while the move is under way", async () => {
    sessionAnswers({ name: "Bob Author", signedIn: true });
    // The page never finishes loading, so the notice is what the person sees.
    renderSignIn({ state: { view: "password" } });
    await screen.findByLabelText("Email or username");
    globalThis.dispatchEvent(new Event("focus"));
    const notice = await screen.findByRole("status");
    expect(notice).toHaveTextContent("Signed in as Bob Author. Refresh this page.");
    expect(within(notice).getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });

  it("stays put, saying nothing, when the check itself fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    renderWithHome();
    await screen.findByLabelText("Email or username");
    globalThis.dispatchEvent(new Event("focus"));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByText("Home")).toBeNull();
  });
});
