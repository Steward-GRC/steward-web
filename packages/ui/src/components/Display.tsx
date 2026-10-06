// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ChevronDown } from "lucide-react";
import {
  Accordion as AccordionPrimitive,
  Avatar as AvatarPrimitive,
  Progress as ProgressPrimitive,
  Separator as SeparatorPrimitive,
  Tabs as TabsPrimitive,
} from "radix-ui";
import { type ComponentProps } from "react";

import { cn } from "#ui/lib/cn";

export const Card = ({ className, ...props }: ComponentProps<"section">) => (
  <section
    className={cn("rounded-lg border border-border bg-surface shadow-[var(--shadow-1)]", className)}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn(
      "flex items-start justify-between gap-4 border-b border-border px-5 py-4",
      className,
    )}
    {...props}
  />
);

export const CardTitle = ({ children, className, ...props }: ComponentProps<"h2">) => (
  <h2 className={cn("text-md font-semibold text-ink", className)} {...props}>
    {children}
  </h2>
);

export const CardBody = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cn("px-5 py-4", className)} {...props} />
);

/** A loading placeholder. Pair it with screen-reader text that says what's loading. */
export const Skeleton = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    aria-hidden="true"
    className={cn("animate-pulse rounded-md bg-sunken motion-reduce:animate-none", className)}
    {...props}
  />
);

export const Separator = ({
  className,
  ...props
}: ComponentProps<typeof SeparatorPrimitive.Root>) => (
  <SeparatorPrimitive.Root
    className={cn(
      "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
      className,
    )}
    {...props}
  />
);

export const Progress = ({
  className,
  value,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root>) => (
  <ProgressPrimitive.Root
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-sunken", className)}
    value={value}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full bg-primary transition-transform"
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
);

/** Initials from a display name: "Erin Example" is "EE", one word gives its first letter. */
export const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
  return (first + last).toUpperCase();
};

export const Avatar = ({
  className,
  name,
  src,
}: {
  className?: string;
  name: string;
  src?: string;
}) => (
  <AvatarPrimitive.Root
    className={cn(
      "inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-xs font-semibold text-on-primary-soft",
      className,
    )}
  >
    {src ? <AvatarPrimitive.Image alt="" className="size-full object-cover" src={src} /> : null}
    <AvatarPrimitive.Fallback aria-hidden="true">{initialsOf(name)}</AvatarPrimitive.Fallback>
  </AvatarPrimitive.Root>
);

export const Tabs = TabsPrimitive.Root;
export const TabsList = ({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List className={cn("flex gap-1 border-b border-border", className)} {...props} />
);
export const TabsTrigger = ({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      "-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-semibold text-muted hover:text-ink data-[state=active]:border-primary data-[state=active]:text-ink",
      className,
    )}
    {...props}
  />
);
export const TabsContent = ({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content className={cn("pt-4", className)} {...props} />
);

export const Accordion = AccordionPrimitive.Root;
export const AccordionItem = ({
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Item>) => (
  <AccordionPrimitive.Item className={cn("border-b border-border", className)} {...props} />
);
export const AccordionTrigger = ({
  children,
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn(
        "flex flex-1 items-center justify-between py-3 text-left text-base font-semibold [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown aria-hidden="true" className="size-4 text-muted transition-transform" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);
export const AccordionContent = ({
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) => (
  <AccordionPrimitive.Content className={cn("pb-3 text-base", className)} {...props} />
);

export const Kbd = ({ className, ...props }: ComponentProps<"kbd">) => (
  <kbd
    className={cn(
      "inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border bg-sunken px-1 font-mono text-2xs text-muted",
      className,
    )}
    {...props}
  />
);

export const Table = ({ className, ...props }: ComponentProps<"table">) => (
  <div className="w-full overflow-x-auto">
    <table className={cn("w-full border-collapse text-base", className)} {...props} />
  </div>
);
export const THead = ({ className, ...props }: ComponentProps<"thead">) => (
  <thead className={cn("bg-sunken text-left", className)} {...props} />
);
export const TH = ({ className, ...props }: ComponentProps<"th">) => (
  <th
    className={cn(
      "border-b border-border-strong px-3 py-2 text-xs font-semibold text-ink",
      className,
    )}
    {...props}
  />
);
export const TD = ({ className, ...props }: ComponentProps<"td">) => (
  <td className={cn("border-b border-border px-3 py-2 align-top", className)} {...props} />
);
