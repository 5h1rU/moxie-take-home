import clsx from "clsx";
import Image from "next/image";
import type { ReactNode } from "react";

/** White surface with the Figma card border and radius. */
export function Card({
  children,
  padding = "sm",
  as: Element = "div",
}: {
  children?: ReactNode;
  /** `sm`: 16px. `lg`: 24/16px on mobile, 48/60px on desktop (the step card). */
  padding?: "sm" | "lg";
  as?: "div" | "section";
}) {
  return (
    <Element
      className={clsx(
        "min-w-0 rounded-xl border border-border bg-white",
        padding === "sm" ? "p-4" : "px-4 py-6 desktop:px-15 desktop:py-12",
      )}
    >
      {children}
    </Element>
  );
}

/** Circle avatar. Shows initials when there is no image (the Figma `photo=no` variant). */
export function Avatar({ src, name, size = 80 }: { src: string | null; name: string; size?: 80 }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
  return (
    <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-page bg-white">
      {src ? (
        <Image src={src} alt={`${name} logo`} width={size} height={size} className="size-full object-contain p-2" />
      ) : (
        <span aria-hidden="true" className="flex size-full items-center justify-center bg-primary-soft text-2xl font-bold text-primary">
          {initials}
        </span>
      )}
    </div>
  );
}

export function Divider() {
  return <hr className="border-t-[1.5px] border-border" />;
}

export function Alert({ children }: { children?: ReactNode }) {
  return (
    <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm leading-6 text-danger">
      {children}
    </div>
  );
}

export function Skeleton({ width = "100%", height }: { width?: number | "100%"; height: number }) {
  return <div aria-hidden="true" className="animate-pulse rounded-xl bg-border" style={{ width, height }} />;
}

export function TextLink({ href, children }: { href: string; children?: ReactNode }) {
  return (
    <a href={href} className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary">
      {children}
    </a>
  );
}

/** Text for screen readers only. `role="status"` announces it when it appears. */
export function VisuallyHidden({ children, role }: { children?: ReactNode; role?: "status" }) {
  return (
    <span role={role} className="sr-only">
      {children}
    </span>
  );
}

/** Label and value rows, as in the business card ("Address", "Email", "Phone"). */
export function DescriptionList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-[85px_minmax(0,1fr)] gap-x-4 gap-y-3 text-base leading-6">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-muted">{item.label}</dt>
          <dd className="min-w-0 break-words text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const brandLabels = { visa: "VISA", mastercard: "MC", amex: "AMEX", discover: "DISC" } as const;

/** The 24px icon slot at the end of the card number field. */
export function CardBrandIcon({ brand }: { brand: keyof typeof brandLabels | "unknown" }) {
  if (brand === "unknown") {
    return (
      <svg className="size-6 text-muted" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 9.5h19M6 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <span className="rounded border border-border bg-white px-1.5 py-0.5 text-[10px] leading-4 font-extrabold tracking-wide text-primary">
      {brandLabels[brand]}
      <span className="sr-only"> card</span>
    </span>
  );
}

/** Mint circle with the check illustration from the Figma confirmation. */
export function SuccessIllustration() {
  return <Image src="/success-check.svg" alt="" width={200} height={200} priority />;
}
