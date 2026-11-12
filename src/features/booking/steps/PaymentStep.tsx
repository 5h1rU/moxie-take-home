"use client";

import { useActionState, useState, type FormEvent } from "react";
import { BottomBar, HStack, Show, VStack } from "@/components/layout";
import { Alert, Card, CardBrandIcon, Checkbox, Divider, Fieldset, Heading, Text, TextField } from "@/components/ui";
import type { AppointmentSelection, Booking, BookingPage, CardBrand, CreateBooking } from "@/lib/types";
import { detectBrand, formatCardNumber, formatExpiry, onlyDigits } from "../card";
import { BackButton, SubmitButton } from "../components/FormButtons";
import { reformat } from "../format";
import { buildBookingRequest } from "../request";
import { fieldErrors, paymentSchema, readForm, type ContactData, type FieldErrors, type FormValues } from "../schemas";
import { tokenizeCard } from "../tokenize";
import { useFormErrors } from "../useFormErrors";

type PaymentState = { values: FormValues; errors: FieldErrors; formError?: string };

const initialState: PaymentState = { values: {}, errors: {} };

export function PaymentStep({
  page,
  selection,
  contact,
  createBooking,
  onBack,
  onConfirmed,
}: {
  page: BookingPage;
  selection: AppointmentSelection;
  contact: ContactData;
  createBooking: CreateBooking;
  onBack: () => void;
  onConfirmed: (booking: Booking) => void;
}) {
  // One key per booking attempt. A retry after a network error reuses it, so
  // the backend can't create the same booking twice.
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [brand, setBrand] = useState<CardBrand>("unknown");

  const [state, formAction] = useActionState(
    async (_previous: PaymentState, formData: FormData): Promise<PaymentState> => {
      // The values, card number and CVV included, stay in this browser tab.
      const values = readForm(formData);
      const parsed = paymentSchema.safeParse(values);
      if (!parsed.success) return { values, errors: fieldErrors(parsed.error) };

      const card = await tokenizeCard(parsed.data);
      const request = buildBookingRequest({
        page,
        selection,
        contact,
        card,
        billingPostalCode: parsed.data.postalCode,
        acceptedAt: new Date(),
      });
      console.log("Booking request", request);

      const result = await createBooking(request, idempotencyKey);
      if (!result.ok) {
        return { values, errors: result.fieldErrors ?? {}, formError: result.fieldErrors ? undefined : result.message };
      }
      console.log("Booking confirmed", result.booking);
      onConfirmed(result.booking);
      return initialState;
    },
    initialState,
  );
  const { formRef, errorFor, onChange } = useFormErrors(state.errors);
  const { values } = state;

  return (
    <Card padding="lg" as="section">
      <form ref={formRef} action={formAction} onChange={onChange} noValidate aria-labelledby="step-heading">
        <VStack gap={24}>
          <Show below="desktop">
            <HStack>
              <BackButton onClick={onBack} />
            </HStack>
          </Show>
          <VStack gap={16}>
            <Heading level={2} id="step-heading">
              Secure your appointment by card
            </Heading>
            <Text variant="bodySmall" tone="description">
              A credit or debit card is required to book your appointment.
            </Text>
          </VStack>

          <Fieldset legend="Card information">
            <TextField
              label="Card number"
              hideLabel
              name="cardNumber"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 1234 1234 1234"
              required
              defaultValue={values.cardNumber}
              error={errorFor("cardNumber")}
              endAdornment={<CardBrandIcon brand={brand} />}
              onInput={(event: FormEvent<HTMLInputElement>) => {
                reformat(event.currentTarget, formatCardNumber);
                setBrand(detectBrand(onlyDigits(event.currentTarget.value)));
              }}
            />
            <HStack gap={8} align="start">
              <TextField
                label="Expiry date"
                hideLabel
                name="expiry"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM / YY"
                required
                defaultValue={values.expiry}
                error={errorFor("expiry")}
                onInput={(event: FormEvent<HTMLInputElement>) => reformat(event.currentTarget, formatExpiry)}
              />
              <TextField
                label="Security code (CVV)"
                hideLabel
                name="cvv"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="CVV"
                maxLength={4}
                required
                defaultValue={values.cvv}
                error={errorFor("cvv")}
                onInput={(event: FormEvent<HTMLInputElement>) => reformat(event.currentTarget, onlyDigits)}
              />
            </HStack>
          </Fieldset>

          <TextField
            label="Billing zip code"
            hideLabel
            name="postalCode"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="Billing zip code"
            maxLength={5}
            required
            defaultValue={values.postalCode}
            error={errorFor("postalCode")}
            onInput={(event: FormEvent<HTMLInputElement>) => reformat(event.currentTarget, onlyDigits)}
          />

          <Checkbox
            name="acceptPolicy"
            required
            defaultChecked={values.acceptPolicy === "on"}
            error={errorFor("acceptPolicy")}
          >
            {page.cancellationPolicy.text}
          </Checkbox>

          <Divider />

          {state.formError && <Alert>{state.formError}</Alert>}
          <SubmitButton fullWidth>Book appointment</SubmitButton>
          <Text variant="bodySmall" tone="description">
            By creating this appointment, you acknowledge you will receive automated transactional messages from this
            merchant.
          </Text>
        </VStack>

        <Show above="desktop">
          <BottomBar>
            <HStack>
              <BackButton onClick={onBack} />
            </HStack>
          </BottomBar>
        </Show>
      </form>
    </Card>
  );
}
