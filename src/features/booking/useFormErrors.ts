"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { FieldErrors } from "./schemas";

/**
 * Error display rules shared by both steps: after a submit, focus the first
 * invalid field; once a field is edited, hide its error until the next submit.
 * Pass the errors from the form's action state, and spread the result's
 * `formRef` and `onChange` onto the <form>.
 */
export function useFormErrors(errors: FieldErrors) {
  const formRef = useRef<HTMLFormElement>(null);
  // Fields edited since a submit result, remembered with that result. A new
  // submit brings a new errors object, so the old edits no longer apply.
  const [edited, setEdited] = useState({ errors, names: new Set<string>() });
  const names = edited.errors === errors ? edited.names : new Set<string>();

  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);

  return {
    formRef,
    errorFor: (name: string): string | undefined => (names.has(name) ? undefined : errors[name]),
    onChange: (event: ChangeEvent<HTMLFormElement>) => {
      const { name } = event.target as unknown as HTMLInputElement;
      if (errors[name] && !names.has(name)) setEdited({ errors, names: new Set(names).add(name) });
    },
  };
}
