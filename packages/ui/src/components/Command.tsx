// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { type ComponentProps } from "react";

import { cn } from "#ui/lib/cn";

export const Command = ({ className, ...props }: ComponentProps<typeof CommandPrimitive>) => (
  <CommandPrimitive
    className={cn("flex flex-col overflow-hidden text-ink", className)}
    {...props}
  />
);

export const CommandInput = ({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Input>) => (
  <div className="flex items-center gap-2 border-b border-border px-3">
    <Search aria-hidden="true" className="size-4 text-muted" />
    <CommandPrimitive.Input
      className={cn(
        "h-11 w-full bg-transparent text-base outline-none placeholder:text-muted",
        className,
      )}
      {...props}
    />
  </div>
);

export const CommandList = ({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.List>) => (
  <CommandPrimitive.List className={cn("max-h-96 overflow-y-auto p-1", className)} {...props} />
);

export const CommandEmpty = (props: ComponentProps<typeof CommandPrimitive.Empty>) => (
  <CommandPrimitive.Empty className="py-6 text-center text-base text-muted" {...props} />
);

export const CommandGroup = ({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Group>) => (
  <CommandPrimitive.Group
    className={cn(
      "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted",
      className,
    )}
    {...props}
  />
);

export const CommandItem = ({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Item>) => (
  <CommandPrimitive.Item
    className={cn(
      "flex cursor-default items-center gap-2 rounded-sm px-2 py-2 text-base outline-none select-none data-[selected=true]:bg-primary-soft data-[selected=true]:text-on-primary-soft",
      className,
    )}
    {...props}
  />
);
