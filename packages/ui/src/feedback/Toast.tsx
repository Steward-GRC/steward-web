import { useTranslation } from "@steward-web/i18n";
import { AlertTriangle, CheckCircle2, Info, type LucideIcon, OctagonAlert, X } from "lucide-react";
import { type ReactNode } from "react";
import { Toaster as Sonner, toast } from "sonner";

import { cn } from "#ui/lib/cn";

import type { Failure } from "./failure";

import { DiagnosticsSlot } from "./DiagnosticsSlot";

export type ToastTone = "error" | "info" | "success" | "warning";

const icons: Record<ToastTone, { colour: string; icon: LucideIcon }> = {
  error: { colour: "text-danger", icon: OctagonAlert },
  info: { colour: "text-info", icon: Info },
  success: { colour: "text-ok", icon: CheckCircle2 },
  warning: { colour: "text-warn", icon: AlertTriangle },
};

export interface ToastCardProps {
  description?: ReactNode;
  failure?: Failure;
  onClose: () => void;
  title: ReactNode;
  tone: ToastTone;
}

/** One toast. Warning and error toasts carry Copy diagnostics as part of the variant. */
export const ToastCard = ({ description, failure, onClose, title, tone }: ToastCardProps) => {
  const { t } = useTranslation("common");
  const { colour, icon: Icon } = icons[tone];
  const carriesDiagnostics = tone === "warning" || tone === "error";
  return (
    <div
      className="flex w-[22rem] max-w-[calc(100vw-2rem)] gap-3 rounded-lg border border-border bg-surface p-4 text-ink shadow-[var(--shadow-3)]"
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", colour)} />
      <div className="grid min-w-0 flex-1 gap-1">
        <p className="font-semibold">{title}</p>
        {description ? <p className="text-base text-muted">{description}</p> : null}
        {carriesDiagnostics ? (
          <div className="mt-1">
            <DiagnosticsSlot failure={failure} />
          </div>
        ) : null}
      </div>
      <button
        aria-label={t("actions.close")}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-sunken"
        onClick={onClose}
        type="button"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
};

export interface NotifyOptions {
  description?: ReactNode;
  failure?: Failure;
}

const show =
  (tone: ToastTone) =>
  (title: ReactNode, options: NotifyOptions = {}) =>
    toast.custom(
      (id) => (
        <ToastCard
          description={options.description}
          failure={options.failure}
          onClose={() => toast.dismiss(id)}
          title={title}
          tone={tone}
        />
      ),
      // A toast that holds Copy diagnostics stays until it's closed, so it never times out
      // while someone is reaching for the button.
      { duration: tone === "warning" || tone === "error" ? Number.POSITIVE_INFINITY : 5000 },
    );

/** Show a toast: bottom centre, with a close button on every tone. */
export const notify = {
  error: show("error"),
  info: show("info"),
  success: show("success"),
  warning: show("warning"),
};

/** Mount once at the app root. */
export const Toaster = () => <Sonner position="bottom-center" toastOptions={{ unstyled: true }} />;
