import { Container, Grid, VStack } from "@/components/layout";
import { Card, Skeleton, VisuallyHidden } from "@/components/ui";

/** The two cards' shape while the booking page loads. */
export function BookingSkeleton() {
  return (
    <Container as="main">
      <Grid columns={{ base: "single", desktop: "sidebar" }} gap={{ base: 12, desktop: 30 }}>
        <Card>
          <VStack gap={16} align="center">
            <Skeleton width={80} height={80} />
            <Skeleton width={120} height={24} />
            <Skeleton height={96} />
          </VStack>
        </Card>
        <Card padding="lg">
          <VStack gap={16}>
            <Skeleton width={240} height={24} />
            <Skeleton height={72} />
            <Skeleton height={72} />
            <Skeleton height={72} />
          </VStack>
        </Card>
      </Grid>
      <VisuallyHidden role="status">Loading booking details…</VisuallyHidden>
    </Container>
  );
}
