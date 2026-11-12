import type { CardBrand } from "@/lib/types";
import { detectBrand } from "./card";

export type CardToken = {
  paymentMethodId: string;
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
};

/**
 * Stripe's test cards that the mock backend answers with a failure.
 * See https://docs.stripe.com/testing#declined-payments.
 */
const TEST_CARD_TOKENS: Record<string, string> = {
  "4000000000000002": "pm_card_chargeDeclined",
  "4000000000000119": "pm_card_chargeDeclinedProcessingError",
};

/**
 * Stands in for Stripe Elements: in production the card number and CVV go from
 * the browser straight to the payment processor, which returns a token. Our
 * server, the request, and the logs only ever see this token and the card's
 * public details. The CVV is checked by the processor and then discarded.
 */
export async function tokenizeCard(card: {
  cardNumber: string;
  expiry: { month: number; year: number };
}): Promise<CardToken> {
  const { cardNumber, expiry } = card;
  return {
    paymentMethodId:
      TEST_CARD_TOKENS[cardNumber] ?? `pm_test_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`,
    brand: detectBrand(cardNumber),
    last4: cardNumber.slice(-4),
    expMonth: expiry.month,
    expYear: expiry.year,
  };
}
