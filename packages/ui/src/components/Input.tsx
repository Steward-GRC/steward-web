import { type ComponentProps, forwardRef } from "react";

import { cn } from "#ui/lib/cn";

const control =
  "w-full rounded-md border border-control bg-surface px-3 text-base text-ink placeholder:text-muted focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-sunken disabled:opacity-70 aria-invalid:border-danger";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input className={cn(control, "h-9", className)} ref={ref} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea className={cn(control, "min-h-24 py-2", className)} ref={ref} {...props} />
  ),
);
Textarea.displayName = "Textarea";
