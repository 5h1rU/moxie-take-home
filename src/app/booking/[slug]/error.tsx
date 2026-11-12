"use client";

import { Container, VStack } from "@/components/layout";
import { Button, Card, Heading, Text } from "@/components/ui";

export default function BookingError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Container size="narrow">
      <Card padding="lg">
        <VStack gap={16} align="start">
          <Heading level={1}>We couldn&apos;t load this booking page</Heading>
          <Text tone="description">Something went wrong on our end. Please try again in a moment.</Text>
          <Button onClick={retry}>Try again</Button>
        </VStack>
      </Card>
    </Container>
  );
}
