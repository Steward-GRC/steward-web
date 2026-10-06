// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { cn } from "#ui/lib/cn";

/** A small busy indicator. Decorative: the control it sits in carries the busy state. */
export const Spinner = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={cn("size-4 animate-spin motion-reduce:animate-none", className)}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path
      className="opacity-90"
      d="M22 12a10 10 0 0 0-10-10"
      stroke="currentColor"
      strokeWidth="3"
    />
  </svg>
);
