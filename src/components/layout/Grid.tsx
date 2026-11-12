import clsx from "clsx";
import type { ReactNode } from "react";
import { gapClasses, responsiveClasses, type Responsive, type Space } from "./responsive";

/**
 * Column templates the design uses. `sidebar` is the desktop booking layout:
 * the 450px business card next to a step card that takes the remaining width.
 */
type Columns = "single" | "sidebar";

const columnClasses = {
  base: { single: "grid-cols-1", sidebar: "grid-cols-[450px_minmax(0,1fr)]" },
  tablet: { single: "tablet:grid-cols-1", sidebar: "tablet:grid-cols-[450px_minmax(0,1fr)]" },
  desktop: { single: "desktop:grid-cols-1", sidebar: "desktop:grid-cols-[450px_minmax(0,1fr)]" },
} as const;

type GridProps = {
  children?: ReactNode;
  columns?: Responsive<Columns>;
  gap?: Responsive<Space>;
  as?: "div" | "section" | "main";
};

export function Grid({ children, columns = "single", gap = 0, as: Element = "div" }: GridProps) {
  return (
    <Element
      className={clsx(
        "grid items-start",
        responsiveClasses(columns, columnClasses),
        responsiveClasses(gap, gapClasses),
      )}
    >
      {children}
    </Element>
  );
}
