import clsx from "clsx";
import type { ReactNode } from "react";

type Tone = "default" | "description" | "muted";

const toneClasses: Record<Tone, string> = {
  default: "text-ink",
  description: "text-description",
  muted: "text-muted",
};

/** Figma text styles: Body Big (16/24), Body Small (14/24), Label Big (14/22 semibold). */
const variantClasses = {
  body: "text-base leading-6",
  bodySmall: "text-sm leading-6",
  label: "text-sm leading-[22px] font-semibold",
} as const;

type TextProps = {
  children?: ReactNode;
  variant?: keyof typeof variantClasses;
  tone?: Tone;
  align?: "start" | "center";
  as?: "p" | "span";
};

export function Text({
  children,
  variant = "body",
  tone = "default",
  align = "start",
  as: Element = "p",
}: TextProps) {
  return (
    <Element
      className={clsx(variantClasses[variant], toneClasses[tone], align === "center" && "text-center")}
    >
      {children}
    </Element>
  );
}
