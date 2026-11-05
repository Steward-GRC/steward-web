// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The profile's own reads and changes (U33–U35), each on the caller's own account: the gateway
// binds every one to the session, never to an id from the page.
import type { NotifCadence, NotifCategory } from "@steward-web/api-client";

import { updateMyProfile } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";
import { refusalOf } from "@steward-web/shell";

import type { SecurityResult } from "./SecurityMethods";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

const field = (form: FormData, key: string) => String(form.get(key) ?? "");

/** The caller's second factors and passkeys; passkeys read as null when they can't be read. */
export const securityData = async (request: Request) => {
  const cookie = cookieOf(request);
  const [factors, passkeys] = await Promise.all([
    edge.myFactors(cookie),
    edge.myPasskeys(cookie).catch(() => null),
  ]);
  return { factors, passkeys };
};

/** The gateway's code for a wrong confirming code: the app isn't enrolled, and it says why. */
const WRONG_CODE = new Set(["INVALID_ARGUMENT", "InvalidArgument"]);

/** One change on the security page, by its form's `intent`. */
export const securityAction = async (request: Request): Promise<SecurityResult> => {
  const cookie = cookieOf(request);
  const form = await request.formData();
  const intent = field(form, "intent");
  try {
    switch (intent) {
      case "passkey-begin": {
        return { passkey: await edge.beginMyPasskeyRegistration(cookie) };
      }
      case "passkey-finish": {
        await edge.finishMyPasskeyRegistration(
          field(form, "sessionId"),
          field(form, "credentialJson"),
          field(form, "label") || undefined,
          cookie,
        );
        return { ok: "passkey" };
      }
      case "remove-passkey": {
        await edge.removeMyPasskey(field(form, "credentialId"), cookie);
        return {};
      }
      case "remove-totp": {
        await edge.removeMyFactor("totp", cookie);
        return {};
      }
      case "rename": {
        await edge.renameMyMethod(field(form, "methodId"), field(form, "label").trim(), cookie);
        return {};
      }
      case "revoke-sessions": {
        return { revoked: await edge.revokeMySessions(cookie) };
      }
      case "totp-begin": {
        return { totp: await edge.beginMyTotpEnrolment(cookie) };
      }
      case "totp-confirm": {
        const done = await edge.confirmMyTotpEnrolment(field(form, "code"), cookie);
        return done ? { ok: "totp" } : { problem: "code" };
      }
      default: {
        throw new Response("Bad Request", { status: 400 });
      }
    }
  } catch (error) {
    if (error instanceof Response) throw error;
    const failure = refusalOf(error);
    if (intent === "totp-confirm" && failure.code && WRONG_CODE.has(failure.code))
      return { problem: "code" };
    return { error: failure };
  }
};

/** The caller's notification settings and type catalog, or null when they can't be read. */
export const notificationData = (request: Request) =>
  edge.notificationPreferences(cookieOf(request)).catch(() => null);

/** One change to the caller's notification settings, by its form's `intent`. */
export const notificationAction = async (request: Request) => {
  const cookie = cookieOf(request);
  const form = await request.formData();
  const cadence = field(form, "cadence") as NotifCadence;
  try {
    switch (field(form, "intent")) {
      case "set-category": {
        await edge.setCategoryCadence(field(form, "category") as NotifCategory, cadence, cookie);
        return { ok: true };
      }
      case "set-channels": {
        await edge.setNotificationChannels(
          {
            email: field(form, "email") === "true",
            inApp: field(form, "inApp") === "true",
            push: field(form, "push") === "true",
          },
          cookie,
        );
        return { ok: true };
      }
      case "set-type": {
        await edge.setTypeCadence(field(form, "kind"), cadence, cookie);
        return { ok: true };
      }
      default: {
        throw new Response("Bad Request", { status: 400 });
      }
    }
  } catch (error) {
    if (error instanceof Response) throw error;
    return { error: refusalOf(error) };
  }
};

/** The caller's saved display language ("" means match the browser). */
export const preferencesData = async (request: Request) => {
  const me = await edge.me(cookieOf(request));
  return { locale: me?.locale ?? "" };
};

/** Saves the display language to the account; "" clears it back to the browser's. */
export const preferencesAction = async (request: Request) => {
  const form = await request.formData();
  if (field(form, "intent") !== "set-locale") throw new Response("Bad Request", { status: 400 });
  try {
    await updateMyProfile(request, { locale: field(form, "locale") });
    return { ok: true };
  } catch (error) {
    return { error: refusalOf(error) };
  }
};
