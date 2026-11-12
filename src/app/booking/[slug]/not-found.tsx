import { Container, VStack } from "@/components/layout";
import { Card, Heading, Text } from "@/components/ui";

export default function NotFound() {
  return (
    <Container size="narrow" as="main">
      <Card padding="lg">
        <VStack gap={8}>
          <Heading level={1} tone="title">
            We couldn&apos;t find this business
          </Heading>
          <Text tone="description">Check the booking link you were sent, or contact the business directly.</Text>
        </VStack>
      </Card>
    </Container>
  );
}
