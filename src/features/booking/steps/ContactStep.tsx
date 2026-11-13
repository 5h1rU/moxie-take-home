"use client";

import { useActionState, type FormEvent } from "react";
import { BottomBar, VStack } from "@/components/layout";
import { Card, Heading, TextField, Textarea } from "@/components/ui";
import { SubmitButton } from "../components/FormButtons";
import { formatPhoneInput, reformat } from "../format";
import { contactSchema, fieldErrors, readForm, type ContactData, type FieldErrors, type FormValues } from "../schemas";
import { useFormErrors } from "../useFormErrors";

type ContactState = { values: FormValues; errors: FieldErrors };

export function ContactStep({
  defaultValues,
  onSubmit,
}: {
  /** What the user entered before going to Payment and coming back. */
  defaultValues: FormValues;
  onSubmit: (contact: ContactData) => void;
}) {
  const [state, formAction] = useActionState(
    async (_previous: ContactState, formData: FormData): Promise<ContactState> => {
      const values = readForm(formData);
      const parsed = contactSchema.safeParse(values);
      if (!parsed.success) return { values, errors: fieldErrors(parsed.error) };
      onSubmit(parsed.data);
      return { values, errors: {} };
    },
    { values: defaultValues, errors: {} },
  );
  const { formRef, errorFor, onChange } = useFormErrors(state.errors);
  const { values } = state;

  return (
    <Card padding="lg" as="section">
      <form ref={formRef} action={formAction} onChange={onChange} noValidate aria-labelledby="step-heading">
        <VStack gap={24}>
          <Heading level={2} id="step-heading">
            Enter your details below
          </Heading>
          <VStack gap={16}>
            <TextField
              label="Full Name"
              name="fullName"
              autoComplete="name"
              placeholder="Jane Cooper"
              required
              defaultValue={values.fullName}
              error={errorFor("fullName")}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="jane@example.com"
              required
              defaultValue={values.email}
              error={errorFor("email")}
            />
            <TextField
              label="Phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(555) 123-4567"
              required
              defaultValue={values.phone}
              error={errorFor("phone")}
              onInput={(event: FormEvent<HTMLInputElement>) => reformat(event.currentTarget, formatPhoneInput)}
            />
            <Textarea
              label="Visit reason (optional)"
              name="visitReason"
              maxLength={500}
              placeholder="Anything we should know before your visit?"
              defaultValue={values.visitReason}
              error={errorFor("visitReason")}
            />
          </VStack>
        </VStack>
        <BottomBar>
          {/* Full width below desktop, right-aligned on desktop, as in the Figma bottom bar. */}
          <VStack align={{ base: "stretch", desktop: "end" }}>
            <SubmitButton>Continue</SubmitButton>
          </VStack>
        </BottomBar>
      </form>
    </Card>
  );
}
