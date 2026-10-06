// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Check, ChevronDown } from "lucide-react";
import {
  Checkbox as CheckboxPrimitive,
  RadioGroup as RadioPrimitive,
  Select as SelectPrimitive,
  Switch as SwitchPrimitive,
} from "radix-ui";
import { type ComponentProps, type ReactNode } from "react";

import { cn } from "#ui/lib/cn";

export const Checkbox = ({
  className,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>) => (
  <CheckboxPrimitive.Root
    className={cn(
      "inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-control bg-surface data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-on-primary disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator>
      <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);

export const Switch = ({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) => (
  <SwitchPrimitive.Root
    className={cn(
      "inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-control bg-sunken p-0.5 transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="block size-3.5 rounded-full bg-surface shadow-[var(--shadow-1)] transition-transform data-[state=checked]:translate-x-4" />
  </SwitchPrimitive.Root>
);

export const RadioGroup = ({ className, ...props }: ComponentProps<typeof RadioPrimitive.Root>) => (
  <RadioPrimitive.Root className={cn("grid gap-2", className)} {...props} />
);

export const RadioItem = ({
  children,
  className,
  ...props
}: { children: ReactNode } & ComponentProps<typeof RadioPrimitive.Item>) => (
  <label className="inline-flex items-center gap-2 text-base">
    <RadioPrimitive.Item
      className={cn(
        "inline-flex size-4 items-center justify-center rounded-full border border-control bg-surface data-[state=checked]:border-primary",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="block size-2 rounded-full bg-primary" />
    </RadioPrimitive.Item>
    {children}
  </label>
);

export interface SelectOption {
  disabled?: boolean;
  label: ReactNode;
  value: string;
}

export interface SelectProps extends Omit<ComponentProps<typeof SelectPrimitive.Root>, "children"> {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
  className?: string;
  id?: string;
  options: SelectOption[];
  placeholder?: ReactNode;
}

/** A single-choice dropdown. */
export const Select = ({ className, id, options, placeholder, ...props }: SelectProps) => (
  <SelectPrimitive.Root {...props}>
    <SelectPrimitive.Trigger
      aria-describedby={props["aria-describedby"]}
      aria-invalid={props["aria-invalid"]}
      aria-label={props["aria-label"]}
      className={cn(
        "inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border border-control bg-surface px-3 text-base text-ink data-[placeholder]:text-muted disabled:opacity-50",
        className,
      )}
      id={id}
    >
      <SelectPrimitive.Value placeholder={placeholder} />
      <SelectPrimitive.Icon>
        <ChevronDown aria-hidden="true" className="size-4 text-muted" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className="z-[var(--z-popover)] overflow-hidden rounded-md border border-border bg-surface shadow-[var(--shadow-3)]"
        position="popper"
        sideOffset={4}
      >
        <SelectPrimitive.Viewport className="p-1">
          {options.map((option) => (
            <SelectPrimitive.Item
              className="relative flex cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-base outline-none select-none data-[disabled]:opacity-50 data-[highlighted]:bg-primary-soft data-[highlighted]:text-on-primary-soft"
              disabled={option.disabled}
              key={option.value}
              value={option.value}
            >
              <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              <SelectPrimitive.ItemIndicator className="absolute right-2">
                <Check aria-hidden="true" className="size-4" />
              </SelectPrimitive.ItemIndicator>
            </SelectPrimitive.Item>
          ))}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  </SelectPrimitive.Root>
);
