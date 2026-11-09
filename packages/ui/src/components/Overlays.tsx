// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Check, X } from "lucide-react";
import {
  Dialog as DialogPrimitive,
  DropdownMenu as MenuPrimitive,
  Popover as PopoverPrimitive,
  Tooltip as TooltipPrimitive,
} from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";

import { Button } from "#ui/components/Button";
import { CodeInput } from "#ui/components/CodeInput";
import { cn } from "#ui/lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export interface DialogContentProps extends Omit<
  ComponentProps<typeof DialogPrimitive.Content>,
  "title"
> {
  /** While busy, Escape is refused, so a running action isn't orphaned. */
  busy?: boolean;
  description?: ReactNode;
  /** A dialog with input never closes on an outside click. */
  hasInput?: boolean;
  size?: DialogSize;
  title: ReactNode;
  tone?: DialogTone;
}

/** Standard is 480 px, wide is 760 px (Dialogs canvas). */
export type DialogSize = "standard" | "wide";

/** The top edge: none, plum (a moment of record, step-up) or red (destructive). */
export type DialogTone = "danger" | "plain" | "primary";

const DialogSizeContext = createContext<DialogSize>("standard");

const widths: Record<DialogSize, string> = {
  standard: "sm:max-w-[480px]",
  wide: "sm:max-w-[760px]",
};
const edges: Record<DialogTone, string> = {
  danger: "bg-danger",
  plain: "bg-transparent",
  primary: "bg-primary",
};
// The frame's sides: 22 px standard, 24 px wide; 20 px on a phone, where it's a bottom sheet.
const sides: Record<DialogSize, string> = { standard: "sm:px-[22px]", wide: "sm:px-6" };

/** The scrim behind every dialog and sheet: the stored `--scrim` token. */
const Scrim = () => (
  <DialogPrimitive.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--scrim)]" />
);

/**
 * The one dialog frame (Dialogs canvas): a 4 px top edge, a 19 px bold title, a one-line
 * description, a body and right-aligned actions. Focus is trapped and returned, Escape closes
 * it unless it's busy, and an outside click never closes one that holds input. Below the small
 * breakpoint it's a bottom sheet (Reader D1m): an 18 px top radius, a grab handle, a 20 px
 * title and the actions stacked full width.
 */
export const DialogContent = ({
  busy,
  children,
  className,
  description,
  hasInput,
  onEscapeKeyDown,
  onPointerDownOutside,
  size = "standard",
  title,
  tone = "plain",
  ...props
}: DialogContentProps) => (
  <DialogPrimitive.Portal>
    <Scrim />
    <DialogPrimitive.Content
      aria-busy={busy || undefined}
      className={cn(
        "fixed inset-x-0 bottom-0 z-[var(--z-dialog)] flex max-h-[90vh] flex-col overflow-y-auto rounded-t-[18px] bg-surface text-base text-ink shadow-[var(--shadow-4)] focus:outline-none sm:inset-0 sm:m-auto sm:h-fit sm:w-[calc(100vw-32px)] sm:rounded-xl",
        widths[size],
        className,
      )}
      data-size={size}
      data-tone={tone}
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
      <div aria-hidden="true" className={cn("hidden h-1 shrink-0 sm:block", edges[tone])} />
      <span
        aria-hidden="true"
        className="mt-2.5 h-1 w-10 shrink-0 self-center rounded-[2px] bg-border-strong sm:hidden"
      />
      <div
        className={cn(
          "flex flex-col gap-3 px-5 pt-3 sm:gap-2 sm:pt-5",
          size === "wide" ? "sm:pb-1.5" : "sm:pb-1",
          sides[size],
        )}
        data-dialog-header=""
      >
        <DialogPrimitive.Title className="text-xl leading-7 font-semibold sm:text-[19px] sm:leading-[1.3] sm:font-bold">
          {title}
        </DialogPrimitive.Title>
        {description ? (
          <DialogPrimitive.Description className="text-[15px] leading-[1.55] text-muted sm:text-base sm:leading-normal">
            {description}
          </DialogPrimitive.Description>
        ) : null}
      </div>
      <DialogSizeContext.Provider value={size}>{children}</DialogSizeContext.Provider>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

/** The dialog's body: fields and notes, 10 px apart (12 px in the wide frame). */
export const DialogBody = ({ className, ...props }: ComponentProps<"div">) => {
  const size = useContext(DialogSizeContext);
  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-5 pt-3 sm:gap-2.5 sm:py-2.5 [&_input:not([type=hidden],[type=checkbox],[type=radio])]:min-h-10 [&_label[for]]:font-medium",
        size === "wide" && "sm:gap-3 sm:py-3",
        sides[size],
        className,
      )}
      data-dialog-body=""
      {...props}
    />
  );
};

/**
 * The actions, right-aligned with the verb repeated: 40 px buttons, Cancel outlined. When no
 * body comes before them, they keep the empty body's 20 px so every frame has one rhythm. On a
 * phone they stack full width with the action on top (50 px) and Cancel under it (48 px).
 */
export const DialogFooter = ({ className, ...props }: ComponentProps<"div">) => {
  const size = useContext(DialogSizeContext);
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 px-5 pt-[18px] pb-7 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-2 sm:pt-2.5 sm:pb-5 sm:[&:not([data-dialog-body]~*)]:pt-[30px]",
        "[&_button]:h-12 [&_button]:rounded-lg [&_button]:text-[15px] [&_button:disabled]:opacity-45 [&>button:last-child]:h-[50px] [&>button:last-child]:text-md",
        "sm:[&_button]:h-10 sm:[&_button]:rounded-md sm:[&_button]:px-4 sm:[&_button]:text-base sm:[&>button:last-child]:h-10 sm:[&>button:last-child]:text-base",
        sides[size],
        className,
      )}
      {...props}
    />
  );
};

const noteTones = {
  danger: "bg-danger-soft text-danger",
  neutral: "bg-sunken text-ink",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
};

/** A note inside a dialog's body: "Published policies cannot be deleted.", "Copied". */
export const DialogNote = ({
  className,
  tone = "neutral",
  ...props
}: { tone?: keyof typeof noteTones } & ComponentProps<"p">) => (
  <p
    className={cn("rounded-[8px] px-3 py-2.5 text-sm leading-[1.45]", noteTones[tone], className)}
    {...props}
  />
);

export interface TypeToConfirmProps {
  /** Body content before the field, such as the merge's two account cards (D21). */
  before?: ReactNode;
  /** The actions, told whether the phrase matches; usually a footer with a disabled button. */
  children: (confirmed: boolean) => ReactNode;
  /** Submitted with the form under this name, when given. */
  name?: string;
  phrase: string;
}

/**
 * Type to confirm (D17): "Type {phrase} to confirm" in a monospace field with a red edge. The
 * phrase must match exactly before the danger button turns on. The typed value lives here, so
 * the field starts empty every time the dialog opens.
 */
export const TypeToConfirm = ({ before, children, name, phrase }: TypeToConfirmProps) => {
  const { t } = useTranslation("common");
  const id = useId();
  const [typed, setTyped] = useState("");
  return (
    <>
      <DialogBody>
        {before}
        <label className="flex flex-col gap-[5px] text-sm font-medium text-ink" htmlFor={id}>
          {t("dialog.typeToConfirm", { phrase })}
          <input
            autoCapitalize="off"
            autoComplete="off"
            className="h-10 rounded-md border-2 border-danger bg-surface px-2.5 font-mono text-base font-normal text-ink"
            id={id}
            name={name}
            onChange={(event) => setTyped(event.target.value)}
            spellCheck={false}
            value={typed}
          />
        </label>
      </DialogBody>
      {children(typed === phrase)}
    </>
  );
};

export interface StepUpDialogProps {
  busy?: boolean;
  /** A wrong or expired code, shown under the field. */
  error?: ReactNode;
  /** Shown after Resend in the note: what the code is for. */
  note?: ReactNode;
  onConfirm: (code: string) => void;
  onOpenChange: (open: boolean) => void;
  onResend: () => void;
  open: boolean;
}

const STEP_UP_LENGTH = 6;

/**
 * The step-up dialog (D18): a plum-edged "Confirm it's you" that asks for the 6-digit code
 * emailed to the person, with Resend in the note. Used before transferring root and other
 * high-risk actions; the caller sends the first code before opening it.
 */
export const StepUpDialog = ({
  busy,
  error,
  note,
  onConfirm,
  onOpenChange,
  onResend,
  open,
}: StepUpDialogProps) => {
  const { t } = useTranslation("common");
  const [code, setCode] = useState("");
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) setCode("");
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent
        busy={busy}
        description={t("dialog.stepUp.description")}
        hasInput
        title={t("dialog.stepUp.title")}
        tone="primary"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (code.length === STEP_UP_LENGTH) onConfirm(code);
          }}
        >
          <DialogBody>
            <label className="flex flex-col gap-[5px] text-sm font-medium text-ink" htmlFor={id}>
              {t("dialog.stepUp.code")}
              <CodeInput
                aria-describedby={error ? errorId : undefined}
                aria-invalid={error ? true : undefined}
                className="h-10 border-2 border-primary px-2.5 text-left text-base font-normal tracking-[.3em] aria-invalid:border-danger"
                id={id}
                length={STEP_UP_LENGTH}
                onChange={setCode}
                required
                value={code}
              />
            </label>
            {error ? (
              <p className="text-sm font-medium text-danger" id={errorId}>
                {error}
              </p>
            ) : null}
            <DialogNote>
              <button
                className="font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-45"
                disabled={busy}
                onClick={onResend}
                type="button"
              >
                {t("dialog.stepUp.resend")}
              </button>
              {note ? <> · {note}</> : null}
            </DialogNote>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={busy} variant="secondary">
                {t("actions.cancel")}
              </Button>
            </DialogClose>
            <Button busy={busy} type="submit">
              {t("dialog.stepUp.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * A sheet from the left edge (the phone menu, H3o): the dialog's focus trap and Escape, with a
 * 50% night scrim. `title` names it for screen readers; the sheet draws its own header.
 */
export const SheetContent = ({
  children,
  className,
  title,
  ...props
}: { title: ReactNode } & Omit<ComponentProps<typeof DialogPrimitive.Content>, "title">) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-[rgb(29_21_32/.5)]" />
    <DialogPrimitive.Content
      aria-describedby={undefined}
      className={cn(
        "fixed inset-y-0 left-0 z-[var(--z-dialog)] flex flex-col bg-surface text-ink shadow-[0_20px_48px_rgb(38_27_37/.25)] focus:outline-none",
        className,
      )}
      {...props}
    >
      <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

export interface SideSheetContentProps extends Omit<
  ComponentProps<typeof DialogPrimitive.Content>,
  "title"
> {
  busy?: boolean;
  description?: ReactNode;
  hasInput?: boolean;
  title: ReactNode;
}

/**
 * The side sheet (D31 magic links, D35 audit record): 420 px from the right, an 18 px bold
 * title with a 13 px line under it and a close button, over the dialog scrim. Same Escape and
 * outside-click rules as the dialog. Full width on a phone.
 */
export const SideSheetContent = ({
  busy,
  children,
  className,
  description,
  hasInput,
  onEscapeKeyDown,
  onPointerDownOutside,
  title,
  ...props
}: SideSheetContentProps) => {
  const { t } = useTranslation("common");
  return (
    <DialogPrimitive.Portal>
      <Scrim />
      <DialogPrimitive.Content
        aria-busy={busy || undefined}
        className={cn(
          "fixed inset-y-0 right-0 z-[var(--z-dialog)] flex w-full flex-col bg-surface text-base text-ink shadow-[var(--shadow-4)] focus:outline-none sm:w-[420px]",
          className,
        )}
        data-side="right"
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
        <div className="flex shrink-0 items-start gap-2.5 border-b border-border px-5 py-[18px]">
          <div className="flex min-w-0 flex-1 flex-col">
            <DialogPrimitive.Title className="text-lg leading-[1.4] font-bold">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-sm text-muted">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <DialogPrimitive.Close
            aria-label={t("actions.close")}
            className="-m-1 inline-flex size-7 items-center justify-center rounded-md text-muted hover:bg-sunken disabled:opacity-45"
            disabled={busy}
          >
            <X aria-hidden="true" className="size-4" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
};

/** The sheet's body: 16/20 padding, 12 px between blocks, scrolling on its own. */
export const SideSheetBody = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn("flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4", className)}
    {...props}
  />
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

export const MenuRadioGroup = MenuPrimitive.RadioGroup;

/** A menu choice of one, marked with a check when it's the current one. */
export const MenuRadioItem = ({
  children,
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.RadioItem>) => (
  <MenuPrimitive.RadioItem
    className={cn(
      "flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-7 text-base outline-none select-none data-[disabled]:opacity-50 data-[highlighted]:bg-primary-soft data-[highlighted]:text-on-primary-soft relative",
      className,
    )}
    {...props}
  >
    <MenuPrimitive.ItemIndicator className="absolute left-2 flex">
      <Check aria-hidden="true" className="size-4" />
    </MenuPrimitive.ItemIndicator>
    {children}
  </MenuPrimitive.RadioItem>
);

/** A menu choice that stands on its own, so several can be on at once; the menu stays open. */
export const MenuCheckboxItem = ({
  children,
  className,
  onSelect,
  ...props
}: ComponentProps<typeof MenuPrimitive.CheckboxItem>) => (
  <MenuPrimitive.CheckboxItem
    className={cn(
      "flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-7 text-base outline-none select-none data-[disabled]:opacity-50 data-[highlighted]:bg-primary-soft data-[highlighted]:text-on-primary-soft relative",
      className,
    )}
    onSelect={(event) => {
      event.preventDefault();
      onSelect?.(event);
    }}
    {...props}
  >
    <MenuPrimitive.ItemIndicator className="absolute left-2 flex">
      <Check aria-hidden="true" className="size-4" />
    </MenuPrimitive.ItemIndicator>
    {children}
  </MenuPrimitive.CheckboxItem>
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
export const Tooltip = ({
  children,
  content,
  side,
}: {
  children: ReactNode;
  content: ReactNode;
  side?: ComponentProps<typeof TooltipPrimitive.Content>["side"];
}) => (
  <TooltipPrimitive.Provider delayDuration={300}>
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          className="z-[var(--z-popover)] max-w-xs rounded-md bg-ink px-2 py-1 text-xs text-surface"
          side={side}
          sideOffset={4}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
);
