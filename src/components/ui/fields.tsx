import clsx from "clsx";
import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

type FieldChrome = {
  label: string;
  /** Keeps the label for screen readers only, for fields grouped under one visible label. */
  hideLabel?: boolean;
  error?: string;
};

const controlClasses = (invalid: boolean) =>
  clsx(
    "w-full rounded-xl border-[1.5px] bg-white px-3 py-3 text-base leading-6 text-ink outline-none transition-[border-color,box-shadow]",
    "placeholder:text-muted",
    // An invalid field stays red while focused, so the error doesn't seem fixed.
    invalid
      ? "border-danger focus:shadow-[0_0_0_3px_rgb(196_43_28/0.15)]"
      : "border-input focus:border-primary focus:shadow-[0_0_0_3px_rgb(138_29_150/0.15)]",
  );

function Field({
  id,
  label,
  hideLabel,
  error,
  errorId,
  children,
}: FieldChrome & { id: string; errorId: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <label htmlFor={id} className={hideLabel ? "sr-only" : "text-sm leading-[22px] font-semibold text-description"}>
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="pt-1 text-sm leading-5 text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = FieldChrome &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "style" | "id"> & {
    /** Content inside the right edge of the input, such as the card brand. */
    endAdornment?: ReactNode;
  };

/** Uncontrolled input: give it a `name` and a `defaultValue`, and read it with FormData. */
export function TextField({ label, hideLabel, error, endAdornment, ...inputProps }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <Field id={id} errorId={errorId} label={label} hideLabel={hideLabel} error={error}>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={clsx(controlClasses(Boolean(error)), endAdornment && "pr-16")}
          {...inputProps}
        />
        {endAdornment && (
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">{endAdornment}</div>
        )}
      </div>
    </Field>
  );
}

type TextareaProps = FieldChrome & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "style" | "id">;

export function Textarea({ label, hideLabel, error, ...textareaProps }: TextareaProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <Field id={id} errorId={errorId} label={label} hideLabel={hideLabel} error={error}>
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={clsx(controlClasses(Boolean(error)), "resize-y")}
        {...textareaProps}
      />
    </Field>
  );
}

/** Groups related fields under one visible label, such as the card number, expiry, and CVV. */
export function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-0.5 text-sm leading-[22px] font-semibold text-description">{legend}</legend>
      {children}
    </fieldset>
  );
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "style" | "id" | "type"> & {
  children: ReactNode;
  error?: string;
};

/** A real checkbox input, styled. `children` is its label. */
export function Checkbox({ children, error, ...inputProps }: CheckboxProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-4">
        <span className="relative flex size-6 shrink-0 items-center justify-center">
          <input
            id={id}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={clsx(
              "peer size-5 cursor-pointer appearance-none rounded-[3px] border-2 bg-white transition-colors",
              "checked:border-primary checked:bg-primary",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              error ? "border-danger" : "border-checkbox",
            )}
            {...inputProps}
          />
          <svg
            className="pointer-events-none absolute size-3.5 text-white opacity-0 peer-checked:opacity-100"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <label htmlFor={id} className="cursor-pointer text-sm leading-6 text-description">
          {children}
        </label>
      </div>
      {error && (
        <p id={errorId} className="pl-10 text-sm leading-5 text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
