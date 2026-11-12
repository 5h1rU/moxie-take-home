import type { ReactNode } from "react";

/**
 * Renders children only above or below the desktop breakpoint (1200px).
 * Uses `display: contents`, so it adds no box to the layout.
 */
export function Show({ children, above, below }: { children?: ReactNode } & (
  | { above: "desktop"; below?: never }
  | { below: "desktop"; above?: never }
)) {
  if (above) return <div className="hidden desktop:contents">{children}</div>;
  if (below) return <div className="contents desktop:hidden">{children}</div>;
  return null;
}

/**
 * A bar fixed to the bottom of the viewport, as in the Figma "bottom bar".
 * Its position doesn't depend on where it sits in the DOM, so a form can
 * render it inside itself and keep its buttons as form descendants.
 */
export function BottomBar({ children }: { children?: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 bg-white py-4 shadow-bar">
      <div className="mx-auto w-full max-w-[752px] px-4 desktop:max-w-[1280px] desktop:px-10">
        {children}
      </div>
    </div>
  );
}
