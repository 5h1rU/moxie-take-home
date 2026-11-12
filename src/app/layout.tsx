import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Book an appointment",
  description: "Book your appointment online.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next/font exposes the font as a CSS variable class; it isn't a Tailwind class.
    // eslint-disable-next-line react/forbid-dom-props
    <html lang="en" className={nunitoSans.variable}>
      <body>{children}</body>
    </html>
  );
}
