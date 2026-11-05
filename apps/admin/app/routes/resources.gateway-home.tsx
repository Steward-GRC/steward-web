// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { redirect } from "react-router";

/** The gateway's SSO callback sends a signed-in person to /home; this app's home is its root. */
export const loader = () => redirect("/");
