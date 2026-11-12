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
  const [edited, setEdited] = useState({ errors, names: new Set<string>() });

  // A new submit result brings a new errors object: start over.
  let names = edited.names;
  if (edited.errors !== errors) {
    names = new Set();
    setEdited({ errors, names });
  }

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
