import { CircleAlert } from "lucide-react";
import type { RefObject } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldProps = {
  id: string;
  label: string;
  type: "email" | "password";
  autoComplete: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  /** The message under the field; the field is outlined while it's set. */
  error: string | undefined;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
};

// A labelled input with its error message, as on the login screen.
export function Field({
  id,
  label,
  type,
  autoComplete,
  placeholder,
  value,
  disabled,
  error,
  inputRef,
  onChange,
}: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        ref={inputRef}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="aria-invalid:ring-0 aria-invalid:focus-visible:ring-3 aria-invalid:focus-visible:ring-ring/50 dark:aria-invalid:border-destructive dark:aria-invalid:focus-visible:ring-ring/50"
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p
          id={errorId}
          className="flex items-center gap-1.5 text-xs text-destructive"
        >
          <CircleAlert
            data-testid="field-error-icon"
            aria-hidden="true"
            className="size-3.5"
          />
          {error}
        </p>
      )}
    </div>
  );
}
