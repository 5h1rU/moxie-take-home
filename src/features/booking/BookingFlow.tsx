"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container, Grid, VStack } from "@/components/layout";
import { Heading } from "@/components/ui";
import type { AppointmentSelection, Booking, BookingPage, CreateBooking } from "@/lib/types";
import { BusinessCard } from "./components/BusinessCard";
import { formatPhone } from "./format";
import type { ContactData, FormValues } from "./schemas";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { ContactStep } from "./steps/ContactStep";
import { PaymentStep } from "./steps/PaymentStep";

type Step = "contact" | "payment" | "confirmed";

/**
 * The interactive booking flow. The step lives in the URL (?step=payment), so
 * browser back and forward work. The entered data lives only in memory: card
 * details must never reach the URL or browser storage, so a refresh on Payment
 * returns to Contact.
 */
export function BookingFlow({
  page,
  selection,
  createBooking,
}: {
  page: BookingPage;
  selection: AppointmentSelection;
  /** The Server Action, passed down by the page. */
  createBooking: CreateBooking;
}) {
  const searchParams = useSearchParams();
  const [contact, setContact] = useState<ContactData | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const wantsPayment = searchParams.get("step") === "payment";
  // Once booked, the flow ignores the URL: going back can't reopen Payment.
  const step: Step = booking ? "confirmed" : wantsPayment && contact ? "payment" : "contact";

  // A page load on ?step=payment (a refresh or a pasted link) has no contact
  // details yet, so it renders step one: make the URL say so. Only on mount:
  // later, contact details exist whenever the URL says payment.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("step") === "payment") {
      window.history.replaceState(null, "", "?step=contact");
    }
  }, []);

  // On step change, start keyboard and screen reader users at the new step's heading.
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    window.scrollTo(0, 0);
    document.getElementById("step-heading")?.focus();
  }, [step]);

  const title = (
    <Heading level={1} align="center" visible="belowDesktop">
      Book appointment
    </Heading>
  );

  if (step === "confirmed" && booking) {
    return (
      <Container size="narrow">
        <VStack gap={16}>
          {title}
          <ConfirmationStep booking={booking} business={page.business} />
        </VStack>
      </Container>
    );
  }

  return (
    <Container reserveBottomBar>
      <VStack gap={16}>
        {title}
        <Grid columns={{ base: "single", desktop: "sidebar" }} gap={{ base: 12, desktop: 30 }}>
          <BusinessCard business={page.business} />
          {step === "payment" && contact ? (
            <PaymentStep
              page={page}
              selection={selection}
              contact={contact}
              createBooking={createBooking}
              onBack={() => window.history.back()}
              onConfirmed={(confirmed) => {
                setBooking(confirmed);
                // Replace the Payment entry: the booking is done.
                window.history.replaceState(null, "", window.location.pathname);
              }}
            />
          ) : (
            <ContactStep
              defaultValues={contact ? toFormValues(contact) : {}}
              onSubmit={(submitted) => {
                setContact(submitted);
                window.history.pushState(null, "", "?step=payment");
              }}
            />
          )}
        </Grid>
      </VStack>
    </Container>
  );
}

function toFormValues(contact: ContactData): FormValues {
  return {
    fullName: contact.fullName,
    email: contact.email,
    phone: formatPhone(contact.phone),
    visitReason: contact.visitReason ?? "",
  };
}
