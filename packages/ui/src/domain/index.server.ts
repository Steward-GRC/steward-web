// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Server-only surface, imported as `@steward-web/ui/domain/server`. A loader that needs the
// library catalog imports this entry, never `@steward-web/ui/domain` (which must stay safe to
// bundle for the browser).
export { listCategories, listPolicies } from "./policies.server";
