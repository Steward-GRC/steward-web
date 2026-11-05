// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useId, useState } from "react";

import { digitsOnly } from "#ui/components/CodeInput";
import { cn } from "#ui/lib/cn";

export interface CodeBoxesProps {
  /** Ties the field to the error that explains it. */
  describedBy?: string;
  invalid?: boolean;
  /** The field's accessible name; the boxes themselves are only drawn. */
  label: string;
  length?: number;
  name?: string;
  onChange: (value: string) => void;
  value: string;
}

/**
 * The six-box verification code (G6): one real one-time-code input laid over six drawn boxes,
 * so typing, pasting and the platform's code autofill all work as one field. The box the next
 * digit goes into gets the 2 px plum ring while the field has focus. A wrong code is said in
 * the alert under the boxes; the boxes keep their control borders, as G6 draws them.
 */
export const CodeBoxes = ({
  describedBy,
  invalid,
  label,
  length = 6,
  name,
  onChange,
  value,
}: CodeBoxesProps) => {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const current = Math.min(value.length, length - 1);
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <div aria-hidden="true" className="grid grid-cols-6 gap-1">
        {Array.from({ length }, (_, index) => (
          <span
            className={cn(
              "flex h-10 items-center justify-center rounded-md font-mono text-lg font-medium text-ink",
              focused && index === current
                ? "border-2 border-primary"
                : "border border-control",
            )}
            data-testid="code-box"
            key={index}
          >
            {value[index] ?? ""}
          </span>
        ))}
      </div>
      <input
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        autoComplete="one-time-code"
        className="absolute inset-0 size-full cursor-text bg-transparent text-transparent caret-transparent opacity-0"
        id={id}
        inputMode="numeric"
        maxLength={length}
        name={name}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(digitsOnly(event.target.value, length))}
        onFocus={() => setFocused(true)}
        onPaste={(event) => {
          event.preventDefault();
          onChange(digitsOnly(event.clipboardData.getData("text"), length));
        }}
        pattern={String.raw`\d{${length}}`}
        value={value}
      />
    </div>
  );
};
