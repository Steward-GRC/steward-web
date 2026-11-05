// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { welcomePreview } from "@steward-web/dev-gate-preview.server";
import edge from "@steward-web/edge.server";
import { data, redirect } from "react-router";

import type { WelcomeLoaderData, WelcomeState } from "./welcomeState";

import { requireIdentity } from "./guards.server";
import { identityFromRequest } from "./requestIdentity.server";
import { safeNext } from "./signIn.server";

const field = (form: FormData, key: string): string => String(form.get(key) ?? "").trim();

/**
 * The welcome page (Gates G10) for someone signing in for the first time, usually through SSO:
 * what their sign-in already filled in. A signed-out visitor goes to sign in first, and anyone
 * already onboarded goes straight on. In a dev build, `?gate=G10` shows it with a sample person.
 */
export const welcomeLoader = async (request: Request): Promise<WelcomeLoaderData> => {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  const preview = welcomePreview(url);
  if (preview) return { next, person: preview, preview: "G10" };
  const identity = requireIdentity(await identityFromRequest(request), request.url);
  if (!identity.needsOnboarding) throw redirect(next);
  return {
    next,
    person: {
      email: identity.email,
      firstName: identity.firstName,
      lastName: identity.lastName,
      username: identity.username,
    },
  };
};

const problem = (value: WelcomeState, status: number) => data<WelcomeState>(value, { status });

/**
 * Finishes first-run onboarding through the gateway's `completeOnboarding`: the terms must be
 * accepted, and the names, username and (only when the sign-in sent none) email the person
 * confirmed go with it. The display name is derived by the gateway from the two names.
 */
export const welcomeAction = async (request: Request) => {
  const form = await request.formData();
  const next = safeNext(form.get("next") ?? new URL(request.url).searchParams.get("next"));
  if (form.get("acceptTerms") !== "on") return problem({ problem: "terms" }, 400);
  const input = Object.fromEntries(
    ["firstName", "lastName", "username", "email"]
      .map((key) => [key, field(form, key)] as const)
      .filter(([, value]) => value !== ""),
  );
  try {
    await edge.completeOnboarding(input, request.headers.get("cookie") ?? undefined);
  } catch {
    return problem({ problem: "failed" }, 502);
  }
  return redirect(next);
};
