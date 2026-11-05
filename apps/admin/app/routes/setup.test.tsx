// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// First-run setup's account step and the setup token. The gateway checks the token only
// when the bootstrap is sent, so a refused token has to bring the visitor back to the step
// where it is typed, with everything else they entered kept.
import { fireEvent, render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import Setup, { action, loader } from "./setup";

const stubBootstrap = (status: number, body: Record<string, unknown>) => {
  const fetchSpy = vi.fn(async (input: RequestInfo | URL) => {
    if (String(input).endsWith("/setup/state")) return Response.json({ needsSetup: true });
    return Response.json(body, { status });
  });
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
};

const renderSetup = () => {
  const Stub = createRoutesStub([{ action, Component: Setup as never, loader, path: "/setup" }]);
  render(<Stub initialEntries={["/setup"]} />);
};

const fillAccount = async (token: string) => {
  fireEvent.change(await screen.findByLabelText("Username"), { target: { value: "admin" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "root@example.org" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pw-1" } });
  fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "pw-1" } });
  fireEvent.change(screen.getByLabelText("Setup token"), { target: { value: token } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("first-run setup's setup token", () => {
  it("stops on the first step when the token is blank", async () => {
    const fetchSpy = stubBootstrap(200, { userId: "u-root" });
    renderSetup();
    await fillAccount(" ".repeat(3));

    expect(await screen.findByText("Enter the setup token.")).toBeInTheDocument();
    expect(screen.getByLabelText("Setup token")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("heading", { name: "First-run setup" })).toBeInTheDocument();
    expect(fetchSpy.mock.calls.some(([url]) => String(url).endsWith("/setup/bootstrap"))).toBe(
      false,
    );
  });

  it("brings a refused token back to the first step, keeping the other fields", async () => {
    stubBootstrap(403, { error: "invalid setup token" });
    renderSetup();
    await fillAccount("wrong-token");
    fireEvent.click(await screen.findByRole("button", { name: "Skip for now" }));

    expect(await screen.findByRole("heading", { name: "First-run setup" })).toBeInTheDocument();
    expect(screen.getByText("Invalid setup token.")).toBeInTheDocument();
    expect(screen.getByLabelText("Setup token")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Setup token")).toHaveValue("");
    expect(screen.getByLabelText("Username")).toHaveValue("admin");
  });

  it("finishes setup with a token the gateway accepts", async () => {
    stubBootstrap(200, { userId: "u-root" });
    renderSetup();
    await fillAccount("right-token");
    fireEvent.click(await screen.findByRole("button", { name: "Skip for now" }));

    expect(
      await screen.findByRole("heading", { name: "Your root administrator is ready." }),
    ).toBeInTheDocument();
  });
});

const post = (fields: Record<string, string>) =>
  action({
    request: new Request("https://steward.example/admin/setup", {
      body: new URLSearchParams(fields),
      method: "POST",
    }),
  } as never);

describe("the setup action", () => {
  const account = {
    confirmPassword: "pw-1",
    email: "root@example.org",
    password: "pw-1",
    username: "admin",
  };

  it("names the setup token as the field the gateway refused", async () => {
    stubBootstrap(403, { error: "invalid setup token" });
    const result = (await post({ ...account, setupToken: "wrong" })) as {
      data: Record<string, unknown>;
      init: { status: number };
    };
    expect(result.data).toMatchObject({
      field: "setupToken",
      ok: false,
      validationError: "Invalid setup token.",
    });
    expect(result.init.status).toBe(403);
  });

  it("refuses a blank token without asking the gateway", async () => {
    const fetchSpy = stubBootstrap(200, { userId: "u-root" });
    const result = (await post({ ...account, setupToken: "  " })) as {
      data: Record<string, unknown>;
    };
    expect(result.data).toMatchObject({ field: "setupToken", ok: false });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
