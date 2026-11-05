// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The dev gate preview through the sign-in loader, with the build alias pointed at the real
// preview (as the dev server or a DEV_QUICK_LOGIN=true build has it): `?gate=<frame>` shows a
// sign-in gate the mock can't reach by itself, with sample data.
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { type FakeGateway, startFakeGateway } from "./fakeGateway.testing";
import { signInLoader } from "./signIn.server";

vi.mock("@steward-web/dev-gate-preview.server", () => import("./developmentGatePreview.server"));

const ORIGIN = "https://steward.example";
let gateway: FakeGateway;
let previousGatewayUrl: string | undefined;

beforeAll(async () => {
  gateway = await startFakeGateway([]);
  previousGatewayUrl = process.env.GATEWAY_URL;
  process.env.GATEWAY_URL = gateway.queryUrl;
});

afterAll(async () => {
  process.env.GATEWAY_URL = previousGatewayUrl;
  await gateway.close();
});

const preview = (gate: string) => signInLoader(new Request(`${ORIGIN}/sign-in?gate=${gate}`));

/** The state a preview shows for one frame id. */
const stateFor = async (gate: string) => {
  const page = await preview(gate);
  return page.state;
};

describe("the dev gate preview", () => {
  it("shows G3's error state with every sign-in option on", async () => {
    const page = await preview("G3");
    expect(page.state).toEqual({
      identifier: "alice@example.org",
      problem: "invalid",
      view: "password",
    });
    expect(page.capabilities).toEqual({ passkey: true, passwordReset: true, sso: true });
    expect(page.preview).toBe("G3");
  });

  it("shows G3m with SSO still turned off", async () => {
    const page = await preview("G3m");
    expect(page.state).toEqual({ identifier: "alice@example.org", view: "password" });
    expect(page.capabilities).toEqual({ passkey: true, passwordReset: true, sso: false });
  });

  it("shows each sign-in step by its frame id", async () => {
    expect(await stateFor("G4")).toEqual({ view: "sso" });
    expect(await stateFor("G6")).toMatchObject({
      choose: true,
      factors: ["totp", "email", "passkey"],
      view: "code",
    });
    expect(await stateFor("G6-code")).toMatchObject({
      emailSent: "sent",
      factor: "email",
      problem: "wrong",
      sentTo: "a•••@example.org",
      view: "code",
    });
    expect(await stateFor("G7")).toMatchObject({ view: "enrol" });
    expect(await stateFor("G8")).toEqual({ step: "request", view: "reset" });
    expect(await stateFor("G8-code")).toMatchObject({ step: "confirm", view: "reset" });
    expect(await stateFor("G9")).toEqual({ view: "signing-in" });
  });

  it("leaves the page alone for a gate it doesn't know", async () => {
    const page = await preview("G99");
    expect(page.state).toEqual({ view: "password" });
    expect(page.preview).toBeUndefined();
  });
});
