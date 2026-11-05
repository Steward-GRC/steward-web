// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A resource route (no UI): the completion page's Export CSV link downloads the
// acknowledgement roster from here.
import type { Route } from "./+types/resources.acks-export";

import { ackExportDownload } from "../completion/completion.server";

export const loader = ({ request }: Route.LoaderArgs) => ackExportDownload(request);
