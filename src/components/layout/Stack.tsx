import clsx from "clsx";
import type { ReactNode } from "react";
import { gapClasses, responsiveClasses, type Responsive, type Space } from "./responsive";

type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify = "start" | "center" | "end" | "between";

export type StackProps = {
  children?: ReactNode;
  direction?: "row" | "column";
  gap?: Responsive<Space>;
  /** Cross-axis alignment. In a column, `stretch` (the default) gives children its full width. */
  align?: Responsive<Align>;
  justify?: Justify;
  /** Semantic element to render. Layout never costs semantics. */
  as?: "div" | "ul" | "li";
};

const alignClasses = {
  base: {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  },
  desktop: {
    start: "desktop:items-start",
    center: "desktop:items-center",
    end: "desktop:items-end",
    stretch: "desktop:items-stretch",
    baseline: "desktop:items-baseline",
  },
} as const;

const justifyClasses: Record<Justify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

/** The base flex container. Mirrors Figma auto layout. */
export function Stack({ children, direction = "column", gap = 0, align, justify, as: Element = "div" }: StackProps) {
  return (
    <Element
      className={clsx(
        "flex min-w-0",
        direction === "row" ? "flex-row" : "flex-col",
        responsiveClasses(gap, gapClasses),
        responsiveClasses(align, alignClasses),
        justify && justifyClasses[justify],
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
