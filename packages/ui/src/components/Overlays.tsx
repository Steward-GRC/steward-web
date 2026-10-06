// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { X } from "lucide-react";
import {
  Dialog as DialogPrimitive,
  DropdownMenu as MenuPrimitive,
  Popover as PopoverPrimitive,
  Tooltip as TooltipPrimitive,
} from "radix-ui";
import { type ComponentProps, type ReactNode } from "react";

import { cn } from "#ui/lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export interface DialogContentProps extends Omit<
  ComponentProps<typeof DialogPrimitive.Content>,
  "title"
> {
  /** While busy, Escape and the close button are refused, so a running action isn't orphaned. */
  busy?: boolean;
  description?: ReactNode;
  /** A dialog with input never closes on an outside click. */
  hasInput?: boolean;
  size?: "lg" | "md" | "sm";
  title: ReactNode;
}

const sizes = { lg: "max-w-3xl", md: "max-w-lg", sm: "max-w-sm" };

/**
 * A modal dialog: focus is trapped and returned, Escape closes it unless it's busy, and an
 * outside click never closes one that holds input. Below the small breakpoint it's a bottom
 * sheet.
 */
export const DialogContent = ({
  busy,
  children,
  className,
  description,
  hasInput,
  onEscapeKeyDown,
  onPointerDownOutside,
  size = "md",
  title,
  ...props
}: DialogContentProps) => {
  const { t } = useTranslation("common");
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-[rgb(29_21_32/.45)]" />
      <DialogPrimitive.Content
        aria-busy={busy || undefined}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[var(--z-dialog)] grid max-h-[90vh] gap-4 overflow-y-auto rounded-t-xl border border-border bg-surface p-6 shadow-[var(--shadow-4)] sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl",
          sizes[size],
          className,
        )}
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
          onEscapeKeyDown?.(event);
        }}
        onPointerDownOutside={(event) => {
          if (busy || hasInput) event.preventDefault();
          onPointerDownOutside?.(event);
        }}
        {...(description ? {} : { "aria-describedby": undefined })}
        {...props}
      >
        <div className="grid gap-1 pr-8">
          <DialogPrimitive.Title className="text-lg font-semibold text-ink">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="text-base text-muted">
              {description}
            </DialogPrimitive.Description>
          ) : null}
        </div>
        {children}
        <DialogPrimitive.Close
          aria-label={t("actions.close")}
          className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-sunken disabled:opacity-50"
          disabled={busy}
        >
          <X aria-hidden="true" className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
};

export const DialogFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cn("flex flex-wrap justify-end gap-2", className)} {...props} />
);

export const Menu = MenuPrimitive.Root;
export const MenuTrigger = MenuPrimitive.Trigger;
export const MenuSeparator = () => <MenuPrimitive.Separator className="my-1 h-px bg-border" />;
export const MenuLabel = ({ className, ...props }: ComponentProps<typeof MenuPrimitive.Label>) => (
  <MenuPrimitive.Label className={cn("px-2 py-1.5 text-xs text-muted", className)} {...props} />
);

export const MenuContent = ({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Content>) => (
  <MenuPrimitive.Portal>
    <MenuPrimitive.Content
      align="end"
      className={cn(
        "z-[var(--z-popover)] min-w-48 rounded-md border border-border bg-surface p-1 shadow-[var(--shadow-3)]",
        className,
      )}
      sideOffset={4}
      {...props}
    />
  </MenuPrimitive.Portal>
);

export const MenuItem = ({ className, ...props }: ComponentProps<typeof MenuPrimitive.Item>) => (
  <MenuPrimitive.Item
    className={cn(
      "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-base outline-none select-none data-[disabled]:opacity-50 data-[highlighted]:bg-primary-soft data-[highlighted]:text-on-primary-soft [&_svg]:size-4",
      className,
    )}
    {...props}
  />
);

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverContent = ({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      className={cn(
        "z-[var(--z-popover)] rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-3)]",
        className,
      )}
      sideOffset={6}
      {...props}
    />
  </PopoverPrimitive.Portal>
);

/** A short hint on hover and focus. The trigger must already have an accessible name. */
export const Tooltip = ({ children, content }: { children: ReactNode; content: ReactNode }) => (
  <TooltipPrimitive.Provider delayDuration={300}>
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          className="z-[var(--z-popover)] max-w-xs rounded-md bg-ink px-2 py-1 text-xs text-surface"
          sideOffset={4}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
);
