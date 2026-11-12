import clsx from "clsx";
import type { ReactNode } from "react";

type Tone = "default" | "description" | "muted" | "primary" | "danger";

const toneClasses: Record<Tone, string> = {
  default: "text-ink",
  description: "text-description",
  muted: "text-muted",
  primary: "text-primary",
  danger: "text-danger",
};

/** Figma text styles: Body Big (16/24), Body Small (14/24), Label Big (14/22 semibold). */
const variantClasses = {
  body: "text-base leading-6",
  bodySmall: "text-sm leading-6",
  label: "text-sm leading-[22px] font-semibold",
  caption: "text-xs leading-4 font-semibold uppercase tracking-wide",
} as const;

type TextProps = {
  children?: ReactNode;
  variant?: keyof typeof variantClasses;
  tone?: Tone;
  align?: "start" | "center";
  as?: "p" | "span" | "div" | "dt" | "dd" | "legend" | "li";
  id?: string;
};

export function Text({
  children,
  variant = "body",
  tone = "default",
  align = "start",
  as: Element = "p",
  id,
}: TextProps) {
  return (
    <Element
      id={id}
      className={clsx(variantClasses[variant], toneClasses[tone], align === "center" && "text-center")}
    >
      {children}
    </Element>
  );
}
