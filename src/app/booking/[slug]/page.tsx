import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingFlow } from "@/features/booking/BookingFlow";
import { BookingSkeleton } from "@/features/booking/components/BookingSkeleton";
import { getBookingPage, getSelection } from "@/lib/api";
import { createBooking } from "./actions";

export async function generateMetadata({ params }: PageProps<"/booking/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getBookingPage(slug);
  return { title: page ? `Book an appointment at ${page.business.name}` : "Business not found" };
}

/** The "loader": loads the business and the visitor's selection on the server. */
export default async function BookingPage({ params }: PageProps<"/booking/[slug]">) {
  const { slug } = await params;
  const [page, selection] = await Promise.all([getBookingPage(slug), getSelection(slug)]);
  if (!page || !selection) notFound();

  return (
    // BookingFlow reads the ?step= search param, which needs a Suspense boundary.
    <Suspense fallback={<BookingSkeleton />}>
      <BookingFlow page={page} selection={selection} createBooking={createBooking} />
    </Suspense>
  );
}
