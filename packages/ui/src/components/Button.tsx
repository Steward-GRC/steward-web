// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { type ComponentProps, forwardRef } from "react";

import { Spinner } from "#ui/components/Spinner";
import { cn } from "#ui/lib/cn";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap transition-colors duration-[var(--dur-fast)] disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    defaultVariants: { size: "md", variant: "primary" },
    variants: {
      size: {
        icon: "size-9",
        lg: "h-10 px-5 text-base",
        md: "h-9 px-4 text-sm",
        sm: "h-8 px-3 text-sm",
      },
      variant: {
        danger: "bg-danger text-on-danger hover:opacity-90",
        ghost: "text-ink hover:bg-sunken",
        link: "h-auto px-0 text-primary underline-offset-2 hover:text-primary-hover hover:underline",
        primary: "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active",
        secondary: "border border-border-strong bg-surface text-ink hover:bg-sunken",
      },
    },
  },
);

export interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  /** Render the child element (a link) with the button's look instead of a <button>. */
  asChild?: boolean;
  /** Show a spinner, set aria-busy and block clicks while an action runs. */
  busy?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, busy, children, className, disabled, size, type, variant, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot.Root
          className={cn(buttonVariants({ size, variant }), className)}
          ref={ref}
          {...props}
        >
          {children}
        </Slot.Root>
      );
    }
    return (
      <button
        aria-busy={busy || undefined}
        className={cn(buttonVariants({ size, variant }), className)}
        disabled={disabled || busy}
        ref={ref}
        type={type ?? "button"}
        {...props}
      >
        {busy ? <Spinner /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
