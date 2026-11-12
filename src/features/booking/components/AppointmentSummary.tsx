import { HStack, VStack } from "@/components/layout";
import { Card, Divider, Text } from "@/components/ui";
import type { Booking, Business } from "@/lib/types";
import { formatAppointmentTime, formatDuration, formatMoney } from "../format";

/** What was booked, built from the booking the server returned. */
export function AppointmentSummary({ booking, business }: { booking: Booking; business: Business }) {
  return (
    <Card as="section">
      <VStack gap={16}>
        <VStack gap={4}>
          <Text variant="bodySmall" tone="description">
            Appointment
          </Text>
          <Text>{formatAppointmentTime(booking.startsAt, business.timezone)}</Text>
          <Text variant="bodySmall" tone="muted">
            with {booking.provider.name}
          </Text>
        </VStack>
        <VStack gap={16}>
          <Text variant="bodySmall" tone="description">
            Services
          </Text>
          <VStack gap={16} as="ul">
            {booking.services.map((service, index) => (
              <VStack key={`${service.id}-${index}`} as="li" gap={4}>
                <Text>{service.name}</Text>
                <Text variant="bodySmall" tone="muted">
                  {formatDuration(service.durationMinutes)} • {formatMoney(service.priceCents, business.currency)}
                </Text>
              </VStack>
            ))}
          </VStack>
        </VStack>
        <Divider />
        <HStack justify="between">
          <Text variant="label">Total</Text>
          <Text variant="label">{formatMoney(booking.totalCents, business.currency)}</Text>
        </HStack>
      </VStack>
    </Card>
  );
}
