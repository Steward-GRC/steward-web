// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ChevronDown } from "lucide-react";
import {
  Accordion as AccordionPrimitive,
  Avatar as AvatarPrimitive,
  Progress as ProgressPrimitive,
  Separator as SeparatorPrimitive,
} from "radix-ui";
import { type ComponentProps, type ReactNode, useId } from "react";

import { cn } from "#ui/lib/cn";

/**
 * The one card: the surface, a firm edge and clipped corners. Give it a `title` and it names
 * itself for screen readers and shows the banded header, with `aside` beside the title.
 */
export const Card = ({
  aside,
  children,
  className,
  title,
  ...props
}: { aside?: ReactNode; title?: string } & Omit<ComponentProps<"section">, "title">) => {
  const headingId = useId();
  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={cn(
        "overflow-hidden rounded-lg border border-card-edge bg-surface shadow-[var(--shadow-1)]",
        className,
      )}
      {...props}
    >
      {title ? (
        <CardHeader data-testid="card-band">
          <h2 id={headingId}>{title}</h2>
          {aside}
        </CardHeader>
      ) : null}
      {children}
    </section>
  );
};

/** The card's band: white text on the purple band colour with the card's edge under it. */
export const CardHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn(
      "flex items-center justify-between gap-2 border-b border-card-edge bg-band px-4 py-3 text-[15px] font-semibold text-on-band [&_.text-muted]:text-on-band/80 [&_.text-primary]:text-on-band",
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

/**
 * The kit's table. Its rows sit on the card surface, never the page behind them (#112), under a
 * header one shade down. `striped` gives every second row the stripe shade (#105), for a dense
 * log; the hover shade shows over the stripes and both print.
 */
export const Table = ({
  className,
  striped = false,
  ...props
}: { striped?: boolean } & ComponentProps<"table">) => (
  <div className="relative w-full overflow-x-auto">
    <table
      className={cn(
        "w-full border-collapse bg-surface text-base [&_tbody_tr:hover]:bg-sunken print:[print-color-adjust:exact]",
        striped &&
          "[&_tbody_tr:nth-child(even)]:bg-stripe [&_tbody_tr:nth-child(even):hover]:bg-sunken",
        className,
      )}
      data-striped={striped ? "" : undefined}
      {...props}
    />
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
