// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// SSO through the staff app (#54): /auth/sso/* reaches the gateway, and the gateway's own
// return paths (/home, /login) land on this app's home and sign-in.
import { createStaticHandler, type LoaderFunction } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as home from "./resources.gateway-home";
import * as login from "./resources.gateway-login";
import * as sso from "./resources.sso";

const ORIGIN = "https://steward.example";

const handler = () =>
  createStaticHandler([
    {
      children: [
        { id: "home", loader: home.loader as LoaderFunction, path: "home" },
        { id: "login", loader: login.loader as LoaderFunction, path: "login" },
        {
          action: sso.action as LoaderFunction,
          id: "sso",
          loader: sso.loader as LoaderFunction,
          path: "auth/sso/*",
        },
      ],
      id: "root",
      path: "/",
    },
  ]);

const open = async (path: string) => {
  const result = await handler().queryRoute(new Request(`${ORIGIN}${path}`));
  return result as Response;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SSO in the staff app", () => {
  it("passes /auth/sso/* to the gateway and relays its answer", async () => {
    const fetchSpy = vi.fn(
      async (_url: string) =>
        new Response(null, {
          headers: { location: "/home", "set-cookie": "steward_sid=s-1; Path=/; HttpOnly" },
          status: 302,
        }),
    );
    vi.stubGlobal("fetch", fetchSpy);
    const answer = await open("/auth/sso/start?connection=example-oidc&identifier=erin");
    expect(String(fetchSpy.mock.calls[0]?.[0])).toMatch(
      /\/auth\/sso\/start\?connection=example-oidc&identifier=erin$/,
    );
    expect(answer.status).toBe(302);
    expect(answer.headers.get("location")).toBe("/");
    expect(answer.headers.get("set-cookie")).toMatch(/^steward_sid=s-1/);
  });

  it("lands the gateway's /home on this app's home", async () => {
    const answer = await open("/home");
    expect(answer.headers.get("location")).toBe("/");
  });

  it("lands the gateway's /login on sign-in, keeping what it says", async () => {
    const answer = await open("/login?pendingMfa=p-1&mfaFactors=totp%2Cemail");
    expect(answer.headers.get("location")).toBe("/sign-in?pendingMfa=p-1&mfaFactors=totp%2Cemail");
  });
});
