import clsx from "clsx";
import type { ReactNode } from "react";

type HeadingProps = {
  children?: ReactNode;
  level: 1 | 2 | 3;
  tone?: "title" | "description";
  align?: "start" | "center";
  /** `belowDesktop` keeps the heading for screen readers on desktop. */
  visible?: "always" | "belowDesktop";
  id?: string;
};

/** Figma "Headlines/H4": 18/24 bold. The level only sets the element. */
export function Heading({
  children,
  level,
  tone = "title",
  align = "start",
  visible = "always",
  id,
}: HeadingProps) {
  const Element = `h${level}` as const;
  return (
    <Element
      id={id}
      // Programmatic focus target when the booking step changes.
      tabIndex={-1}
      className={clsx(
        "text-lg leading-6 font-bold tracking-[0.01em] outline-none",
        tone === "title" ? "text-title" : "text-description",
        align === "center" && "text-center",
        visible === "belowDesktop" && "desktop:sr-only",
      )}
    >
      {children}
    </Element>
  );
}
