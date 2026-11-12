import { VStack } from "@/components/layout";
import { Avatar, Card, DescriptionList, Heading, Text, TextLink } from "@/components/ui";
import type { Business } from "@/lib/types";
import { addressLines, formatPhone } from "../format";

export function BusinessCard({ business }: { business: Business }) {
  return (
    <Card as="section">
      <VStack gap={24}>
        <VStack gap={16} align="center">
          <Avatar src={business.logoUrl} name={business.name} />
          <Heading level={2} align="center">
            {business.name}
          </Heading>
        </VStack>
        <DescriptionList
          items={[
            {
              label: "Address",
              value: (
                <VStack>
                  {addressLines(business.address).map((line) => (
                    <Text key={line} as="span">
                      {line}
                    </Text>
                  ))}
                </VStack>
              ),
            },
            { label: "Email", value: <TextLink href={`mailto:${business.email}`}>{business.email}</TextLink> },
            { label: "Phone", value: <TextLink href={`tel:${business.phone}`}>{formatPhone(business.phone)}</TextLink> },
          ]}
        />
      </VStack>
    </Card>
  );
}
