// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { cloneElement, isValidElement, type ReactElement, type ReactNode, useId } from "react";

import { cn } from "#ui/lib/cn";

export interface FieldProps {
  /** One form control. Field wires its id, aria-describedby and aria-invalid. */
  children: ReactElement<Record<string, unknown>>;
  className?: string;
  error?: ReactNode;
  hint?: ReactNode;
  label: ReactNode;
  /** Shown after the label, for optional fields. */
  optional?: ReactNode;
}

/** A labelled form control with its hint and its error, tied together for screen readers. */
export const Field = ({ children, className, error, hint, label, optional }: FieldProps) => {
  const id = useId();
  const controlId = (children.props.id as string | undefined) ?? `${id}-control`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        id: controlId,
      })
    : children;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label className="text-sm font-semibold text-ink" htmlFor={controlId}>
        {label}
        {optional ? <span className="ml-1 font-normal text-muted">{optional}</span> : null}
      </label>
      {control}
      {hint ? (
        <p className="text-sm text-muted" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm font-medium text-danger" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
};
