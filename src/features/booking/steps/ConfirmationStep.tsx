import { VStack } from "@/components/layout";
import { Card, Heading, SuccessIllustration, Text } from "@/components/ui";
import type { Booking, Business } from "@/lib/types";
import { AppointmentSummary } from "../components/AppointmentSummary";
import { BusinessCard } from "../components/BusinessCard";

export function ConfirmationStep({ booking, business }: { booking: Booking; business: Business }) {
  return (
    <VStack gap={16}>
      <Card padding="lg" as="section">
        <VStack gap={24} align="center">
          <SuccessIllustration />
          <VStack gap={16} align="center">
            <Heading level={2} id="step-heading" tone="description" align="center">
              Your appointment has been booked!
            </Heading>
            <Text align="center">A confirmation has been sent to your email address.</Text>
          </VStack>
        </VStack>
      </Card>
      <BusinessCard business={business} />
      <AppointmentSummary booking={booking} business={business} />
    </VStack>
  );
}
