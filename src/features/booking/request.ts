import type { AppointmentSelection, BookingPage, CreateBookingRequest } from "@/lib/types";
import type { ContactData } from "./schemas";
import type { CardToken } from "./tokenize";

/**
 * Builds the booking request. Its output is what the browser logs and what the
 * Server Action receives. It sends ids, not names or prices: the server owns those.
 */
export function buildBookingRequest({
  page,
  selection,
  contact,
  card,
  billingPostalCode,
  acceptedAt,
}: {
  page: BookingPage;
  selection: AppointmentSelection;
  contact: ContactData;
  card: CardToken;
  billingPostalCode: string;
  acceptedAt: Date;
}): CreateBookingRequest {
  return {
    businessId: page.business.id,
    appointment: {
      startsAt: selection.startsAt,
      providerId: selection.provider.id,
      serviceIds: selection.services.map((service) => service.id),
    },
    client: contact,
    payment: { ...card, billingPostalCode },
    consents: {
      cancellationPolicy: {
        version: page.cancellationPolicy.version,
        acceptedAt: acceptedAt.toISOString(),
      },
    },
  };
}
