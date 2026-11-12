import clsx from "clsx";
import type { ReactNode } from "react";

type ContainerProps = {
  children?: ReactNode;
  /**
   * `wide`: the two-card booking layout (1200px content at 1440px, as in Figma).
   * `narrow`: the single centered column of the desktop confirmation (542px).
   * Below 1200px both are one column of up to 720px.
   */
  size?: "wide" | "narrow";
  /** Leaves room at the bottom for a fixed BottomBar, so it never covers content. */
  reserveBottomBar?: boolean;
};

/** The page's main landmark, with the page width and padding. */
export function Container({ children, size = "wide", reserveBottomBar = false }: ContainerProps) {
  return (
    <main
      className={clsx(
        "mx-auto w-full max-w-[752px] px-4 pt-4 pb-6 desktop:px-10 desktop:pt-15 desktop:pb-15",
        size === "wide" ? "desktop:max-w-[1280px]" : "desktop:max-w-[622px]",
        reserveBottomBar && "pb-32 desktop:pb-36",
      )}
    >
      {children}
    </main>
  );
}
