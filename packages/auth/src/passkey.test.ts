// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { createPasskey, passkeyCreationSupported } from "./passkey";

afterEach(() => {
  vi.unstubAllGlobals();
});

/** A browser with the WebAuthn JSON helpers, whose create() answers `answer`. */
const browser = (answer: () => Promise<unknown>) => {
  const create = vi.fn(answer);
  vi.stubGlobal("PublicKeyCredential", {
    parseCreationOptionsFromJSON: (options: unknown) => ({ parsed: options }),
  });
  vi.stubGlobal("navigator", { credentials: { create } });
  return create;
};

describe("registering a passkey (U33)", () => {
  it("is offered only where the browser can create one from JSON options", () => {
    vi.stubGlobal("PublicKeyCredential", {});
    expect(passkeyCreationSupported()).toBe(false);
    browser(async () => null);
    expect(passkeyCreationSupported()).toBe(true);
  });

  it("hands the gateway's options to the browser and answers the new credential as JSON", async () => {
    const create = browser(async () => ({ toJSON: () => ({ id: "cred-1" }) }));
    expect(await createPasskey('{"publicKey":{"challenge":"abc"}}')).toEqual({
      credentialJson: '{"id":"cred-1"}',
    });
    expect(create).toHaveBeenCalledWith({ publicKey: { parsed: { challenge: "abc" } } });
  });

  it("says the person cancelled, or that it failed", async () => {
    browser(async () => {
      throw new DOMException("no", "NotAllowedError");
    });
    expect(await createPasskey("{}")).toEqual({ failure: "cancelled" });
    browser(async () => {
      throw new Error("boom");
    });
    expect(await createPasskey("{}")).toEqual({ failure: "failed" });
  });
});
