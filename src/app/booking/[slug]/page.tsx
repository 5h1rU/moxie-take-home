import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BookingFlow } from "@/features/booking/BookingFlow";
import { getBookingPage, getSelection } from "@/lib/api";
import { createBooking } from "./actions";

export async function generateMetadata({ params }: PageProps<"/booking/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getBookingPage(slug);
  return { title: page ? `Book an appointment at ${page.business.name}` : "Business not found" };
}

/**
 * The "loader": loads the business and the visitor's selection on the server.
 * loading.tsx is the Suspense boundary for the whole page, including
 * BookingFlow's useSearchParams.
 */
export default async function BookingPage({ params, searchParams }: PageProps<"/booking/[slug]">) {
  const [{ slug }, { step }] = await Promise.all([params, searchParams]);
  // Entered details live only in browser memory, so a page load on Payment (a
  // refresh or a pasted link) has none: start at step one. Moving between steps
  // uses history.pushState, which doesn't reach the server.
  if (step === "payment") redirect(`/booking/${encodeURIComponent(slug)}`);

  const [page, selection] = await Promise.all([getBookingPage(slug), getSelection(slug)]);
  if (!page || !selection) notFound();

  return <BookingFlow page={page} selection={selection} createBooking={createBooking} />;
}
