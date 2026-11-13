"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

/** Must render inside a <form>: shows a spinner and blocks double submits while the form's action runs. */
export function SubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {children}
    </Button>
  );
}

/** Returns to the previous step. Disabled while the form is submitting. */
export function BackButton({ onClick }: { onClick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <Button variant="text" disabled={pending} onClick={onClick}>
      ← Back
    </Button>
  );
}
