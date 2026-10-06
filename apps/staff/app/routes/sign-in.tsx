// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { buildSubmitBody, SignIn } from "@steward-web/auth";
import { fetchLoginFlow, identityFromRequest, submitLogin } from "@steward-web/auth/server";
import { data, redirect } from "react-router";

import type { Route } from "./+types/sign-in";

const setCookieHeaders = (cookies: readonly string[]): Headers => {
  const headers = new Headers();
  for (const cookie of cookies) headers.append("set-cookie", cookie);
  return headers;
};

/** Only an in-app relative path is a safe redirect target; anything else falls back to "/". */
const safeNext = (next: null | string): string =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const identity = await identityFromRequest(request);
  if (identity.id !== "") throw redirect("/");

  const cookie = request.headers.get("cookie") ?? undefined;
  const { flow, setCookie } = await fetchLoginFlow(cookie);
  return data({ flow }, { headers: setCookieHeaders(setCookie) });
};

export const action = async ({ request }: Route.ActionArgs) => {
  const cookie = request.headers.get("cookie") ?? undefined;
  const typed = Object.fromEntries(await request.formData()) as Record<string, string>;

  // The flow's own fields (the CSRF token in particular) must be fresh, so the action re-asks
  // Kratos for the current flow rather than trusting anything the form carried for them.
  const { flow } = await fetchLoginFlow(cookie);
  const result = await submitLogin(flow, buildSubmitBody(flow, typed), cookie);

  if (result.status === "failed") return data({ flow: result.flow }, { status: 400 });

  const next = safeNext(new URL(request.url).searchParams.get("next"));
  const headers = setCookieHeaders(result.setCookie);
  headers.set("location", next);
  return new Response(null, { headers, status: 303 });
};

export default function SignInRoute({ actionData, loaderData }: Route.ComponentProps) {
  return <SignIn cardTitle="Steward" flow={actionData?.flow ?? loaderData.flow} />;
}
