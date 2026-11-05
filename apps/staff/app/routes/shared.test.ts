// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The pages people outside Steward open from a link (G16, G18, G18r). Until steward-gateway can
// look those links up without a session, G16 and G18 say so; G18r reads its result from the
// address the gateway sends the person to.
import { createStaticHandler, type LoaderFunction } from "react-router";
import { describe, expect, it } from "vitest";

import * as shared from "./share.$token";
import * as ssoTest from "./sso-test";
import * as result from "./sso-test.result";

const ORIGIN = "https://steward.example";

const handler = () =>
  createStaticHandler([
    {
      children: [
        { id: "shared", loader: shared.loader as LoaderFunction, path: "share/:token" },
        { id: "sso-test", loader: ssoTest.loader as LoaderFunction, path: "sso-test" },
        { id: "result", loader: result.loader as LoaderFunction, path: "sso-test/result" },
      ],
      id: "root",
      path: "/",
    },
  ]);

const dataAt = async (path: string, id: string) => {
  const answer = await handler().query(new Request(`${ORIGIN}${path}`));
  if (answer instanceof Response) throw new Error("expected the page");
  return answer.loaderData[id];
};

describe("pages opened from a link", () => {
  it("are gates outside the app shell", () => {
    for (const page of [shared, ssoTest, result]) expect(page.handle).toEqual({ gate: true });
  });

  it("G16 says the gateway can't open a shared link yet", async () => {
    expect(await dataAt("/share/tok-1", "shared")).toEqual({ view: "unavailable" });
  });

  it("G18 says the gateway can't look a test link up yet", async () => {
    expect(await dataAt("/sso-test?token=tok-1", "sso-test")).toEqual({ view: "unavailable" });
  });

  it("G18r reads the outcome and the reason from its address", async () => {
    expect(await dataAt("/sso-test/result?test=passed", "result")).toEqual({
      outcome: "passed",
    });
    expect(await dataAt("/sso-test/result?test=failed&reason=sso_no_email", "result")).toEqual({
      outcome: "failed",
      reason: "sso_no_email",
    });
    expect(await dataAt("/sso-test/result?test=expired", "result")).toEqual({
      outcome: "expired",
    });
    expect(await dataAt("/sso-test/result?test=nonsense", "result")).toEqual({
      outcome: "failed",
    });
  });
});
