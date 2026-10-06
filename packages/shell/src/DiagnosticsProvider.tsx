// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DiagnosticsSlotProvider } from "@steward-web/ui";
import { type ReactNode } from "react";

import { CopyDiagnostics } from "./CopyDiagnostics";

/**
 * Mounted once at each app's root, above everything else: it is what makes
 * `@steward-web/ui`'s `DiagnosticsSlot` (built into every warning, danger and failure
 * treatment the kit draws) render a real button, so no screen can forget it by omission.
 */
export const DiagnosticsProvider = ({ children }: { children: ReactNode }) => (
  <DiagnosticsSlotProvider render={(failure) => <CopyDiagnostics failure={failure} />}>
    {children}
  </DiagnosticsSlotProvider>
);
