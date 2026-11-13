import clsx from "clsx";
import type { ReactNode } from "react";

type ButtonProps = {
  children?: ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "text";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

/** Takes its width from the layout around it: a stretching stack makes it full width. */
export function Button({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        "inline-flex cursor-pointer items-center justify-center gap-2 text-base leading-6 font-semibold tracking-[0.02em] transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "disabled:cursor-not-allowed",
        variant === "primary" &&
          "rounded-2xl bg-primary px-9 py-4 text-white hover:bg-primary-strong disabled:bg-primary/60",
        variant === "text" &&
          // The negative margin keeps the label aligned with the content edge while the padding keeps the hit area.
          "-mx-2 rounded-lg px-2 py-2 text-primary hover:underline disabled:text-muted disabled:no-underline",
      )}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="size-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
