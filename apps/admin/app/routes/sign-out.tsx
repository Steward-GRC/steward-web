// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { signOutAction } from "@steward-web/auth/server";
import { redirect } from "react-router";

import type { Route } from "./+types/sign-out";

/** Sign-out is a POST (the account menu's form); a plain visit just goes to sign-in. */
export const loader = () => redirect("/sign-in");

export const action = ({ request }: Route.ActionArgs) => signOutAction(request);
