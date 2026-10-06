// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { type ComponentProps, forwardRef } from "react";

import { cn } from "#ui/lib/cn";

/** Keep digits only, up to the code's length. */
export const digitsOnly = (value: string, length: number): string =>
  value.replaceAll(/\D/g, "").slice(0, length);

export interface CodeInputProps extends Omit<ComponentProps<"input">, "onChange" | "value"> {
  length?: number;
  onChange: (value: string) => void;
  value: string;
}

/** A one-time code field: digits only, the platform's code autofill, spaced monospace digits. */
export const CodeInput = forwardRef<HTMLInputElement, CodeInputProps>(
  ({ className, length = 6, onChange, value, ...props }, ref) => (
    <input
      autoComplete="one-time-code"
      className={cn(
        "h-11 w-full rounded-md border border-control bg-surface px-3 text-center font-mono text-xl tracking-[.4em] text-ink focus-visible:border-primary aria-invalid:border-danger",
        className,
      )}
      inputMode="numeric"
      maxLength={length}
      onChange={(event) => onChange(digitsOnly(event.target.value, length))}
      pattern={String.raw`\d{${length}}`}
      ref={ref}
      value={value}
      {...props}
    />
  ),
);
CodeInput.displayName = "CodeInput";
