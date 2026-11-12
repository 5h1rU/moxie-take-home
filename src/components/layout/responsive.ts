/**
 * A prop value that can change at the design's breakpoint.
 * `base` applies below 1200px, `desktop` from 1200px.
 */
export type Responsive<T> = T | { base?: T; desktop?: T };

/** Spacing scale used in the Figma file, in pixels. */
export type Space = 0 | 2 | 4 | 8 | 12 | 16 | 24 | 30 | 36 | 48 | 60;

type Tables<T extends PropertyKey> = {
  base: Record<T, string>;
  desktop: Record<T, string>;
};

/**
 * Maps a responsive prop to Tailwind classes through lookup tables.
 * The tables hold complete class names because Tailwind finds classes by
 * scanning source text: a class built at runtime would be missing from the CSS.
 */
export function responsiveClasses<T extends PropertyKey>(
  value: Responsive<T> | undefined,
  tables: Tables<T>,
): string[] {
  if (value === undefined) return [];
  if (typeof value !== "object") return [tables.base[value]];
  const classes: string[] = [];
  if (value.base !== undefined) classes.push(tables.base[value.base]);
  if (value.desktop !== undefined) classes.push(tables.desktop[value.desktop]);
  return classes;
}

export const gapClasses: Tables<Space> = {
  base: {
    0: "gap-0",
    2: "gap-0.5",
    4: "gap-1",
    8: "gap-2",
    12: "gap-3",
    16: "gap-4",
    24: "gap-6",
    30: "gap-7.5",
    36: "gap-9",
    48: "gap-12",
    60: "gap-15",
  },
  desktop: {
    0: "desktop:gap-0",
    2: "desktop:gap-0.5",
    4: "desktop:gap-1",
    8: "desktop:gap-2",
    12: "desktop:gap-3",
    16: "desktop:gap-4",
    24: "desktop:gap-6",
    30: "desktop:gap-7.5",
    36: "desktop:gap-9",
    48: "desktop:gap-12",
    60: "desktop:gap-15",
  },
};
