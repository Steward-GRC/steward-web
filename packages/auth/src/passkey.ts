// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/**
 * The browser's half of a passkey (Gates G5, and G6's "Use your passkey"): the gateway's
 * challenge goes to the browser's own prompt, and the signed answer goes back as JSON. It uses
 * the WebAuthn JSON helpers, so a browser without them doesn't get the passkey offered at all.
 */

interface JsonPasskeyCredential {
  parseRequestOptionsFromJSON?: (options: unknown) => PublicKeyCredentialRequestOptions;
}

const passkeyApi = (): JsonPasskeyCredential | undefined =>
  (globalThis as { PublicKeyCredential?: JsonPasskeyCredential }).PublicKeyCredential;

/** Whether this browser can sign in with a passkey. */
export const passkeysSupported = (): boolean =>
  typeof passkeyApi()?.parseRequestOptionsFromJSON === "function";

/** How asking for a passkey ended, when it didn't produce one. */
export type PasskeyFailure = "cancelled" | "failed";

/**
 * Show the browser's passkey prompt for the gateway's challenge (`optionsJson`, as Kratos and
 * identity send it, with or without its `publicKey` wrapper), and answer with the signed
 * credential as JSON for the gateway, or why there is none.
 */
export const askForPasskey = async (
  optionsJson: string,
): Promise<{ credentialJson: string } | { failure: PasskeyFailure }> => {
  const parse = passkeyApi()?.parseRequestOptionsFromJSON;
  if (!parse) return { failure: "failed" };
  let credential: Credential | null;
  try {
    const options = JSON.parse(optionsJson) as { publicKey?: unknown };
    credential = await navigator.credentials.get({
      publicKey: parse(options.publicKey ?? options),
    });
  } catch (error) {
    const cancelled = error instanceof DOMException && error.name === "NotAllowedError";
    return { failure: cancelled ? "cancelled" : "failed" };
  }
  if (!credential) return { failure: "cancelled" };
  const json = (credential as unknown as { toJSON: () => unknown }).toJSON();
  return { credentialJson: JSON.stringify(json) };
};
