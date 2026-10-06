// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { createContext, type ReactNode, use } from "react";

import type { Failure } from "./failure";

/** Renders the Copy diagnostics control for a failure. The shell provides it. */
export type DiagnosticsRenderer = (failure: Failure | undefined) => ReactNode;

const DiagnosticsSlotContext = createContext<DiagnosticsRenderer | null>(null);

/**
 * Lets the shell put its Copy diagnostics button into every warning, danger and failure
 * treatment the kit draws, so no screen can forget it. The kit only holds the slot.
 */
export const DiagnosticsSlotProvider = ({
  children,
  render,
}: {
  children: ReactNode;
  render: DiagnosticsRenderer;
}) => <DiagnosticsSlotContext value={render}>{children}</DiagnosticsSlotContext>;

/** The slot itself: nothing without a provider (the kit's own tests and stories). */
export const DiagnosticsSlot = ({ failure }: { failure?: Failure }) => {
  const render = use(DiagnosticsSlotContext);
  return render ? <>{render(failure)}</> : null;
};
