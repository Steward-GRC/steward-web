// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Whether this browser has a session, and whose: the sign-in page asks every few seconds and
// when its tab comes back, so a session made elsewhere moves it on by itself.
import { sessionStatusLoader } from "@steward-web/auth/server";

import type { Route } from "./+types/resources.session";

export const loader = ({ request }: Route.LoaderArgs) => sessionStatusLoader(request);
