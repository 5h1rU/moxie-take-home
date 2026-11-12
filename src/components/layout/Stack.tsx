import clsx from "clsx";
import type { ReactNode } from "react";
import { gapClasses, responsiveClasses, type Responsive, type Space } from "./responsive";

type Direction = "row" | "column";
type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify = "start" | "center" | "end" | "between";

export type StackProps = {
  children?: ReactNode;
  direction?: Responsive<Direction>;
  gap?: Responsive<Space>;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  /** Semantic element to render. Layout never costs semantics. */
  as?: "div" | "section" | "header" | "footer" | "ul" | "ol" | "li" | "dl" | "fieldset";
};

const directionClasses = {
  base: { row: "flex-row", column: "flex-col" },
  tablet: { row: "tablet:flex-row", column: "tablet:flex-col" },
  desktop: { row: "desktop:flex-row", column: "desktop:flex-col" },
} as const;

const alignClasses: Record<Align, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyClasses: Record<Justify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

/** The base flex container. Mirrors Figma auto layout. */
export function Stack({
  children,
  direction = "column",
  gap = 0,
  align,
  justify,
  wrap = false,
  as: Element = "div",
}: StackProps) {
  return (
    <Element
      className={clsx(
        "flex min-w-0",
        responsiveClasses(direction, directionClasses),
        responsiveClasses(gap, gapClasses),
        align && alignClasses[align],
        justify && justifyClasses[justify],
        wrap && "flex-wrap",
      )}
    >
      {children}
    </Element>
  );
}

/** Figma "Auto Layout Vertical". */
export function VStack(props: Omit<StackProps, "direction">) {
  return <Stack {...props} direction="column" />;
}

/** Figma "Auto Layout Horizontal". */
export function HStack(props: Omit<StackProps, "direction">) {
  return <Stack {...props} direction="row" />;
}
