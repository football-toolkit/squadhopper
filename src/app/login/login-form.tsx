"use client";

import { LogIn } from "lucide-react";
import { unstable_isUnrecognizedActionError } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { closeError, showError } from "@/components/error-toaster";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { AuthErrorCode } from "@/lib/auth/types";
import type { LoginFieldErrors } from "@/lib/auth/validate-login";
import { validateLogin } from "@/lib/auth/validate-login";
import { authMessages } from "@/lib/messages/auth";
import { goTo, reloadPage } from "@/lib/navigation";
import { logIn } from "./actions";
import { Field } from "./field";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginFieldErrors>({});
  const [isPending, startTransition] = useTransition();
  // After a successful login the page is about to be replaced: stay pending.
  const [done, setDone] = useState(false);
  const lastPopup = useRef<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const busy = isPending || done;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    // Every click closes the last popup, even if the field check stops it.
    if (lastPopup.current) {
      closeError(lastPopup.current);
      lastPopup.current = null;
    }

    const checked = validateLogin({ email, password });
    if (!checked.ok) {
      setErrors(checked.errors);
      (checked.errors.email ? emailRef : passwordRef).current?.focus();
      return;
    }
    setErrors({});

    startTransition(async () => {
      let code: AuthErrorCode | null;
      try {
        const result = await logIn({
          email: checked.email,
          password: checked.password,
        });
        code = result.ok ? null : result.code;
      } catch (e) {
        if (unstable_isUnrecognizedActionError(e)) {
          // This page is from an older build, so the server doesn't know its
          // action. A reload gets the current one; trying again never would.
          setDone(true);
          reloadPage();
          return;
        }
        code = "unavailable";
      }
      if (code === null) {
        setDone(true);
        goTo("/", { replace: true });
        return;
      }
      if (code === "invalid_credentials") setPassword("");
      lastPopup.current = showError(authMessages.errors[code]);
    });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field
        id="email"
        label={authMessages.emailLabel}
        type="email"
        autoComplete="email"
        placeholder={authMessages.emailPlaceholder}
        value={email}
        disabled={busy}
        error={errors.email && authMessages[errors.email]}
        inputRef={emailRef}
        onChange={(value) => {
          setEmail(value);
          setErrors((prev) => ({ ...prev, email: undefined }));
        }}
      />
      <Field
        id="password"
        label={authMessages.passwordLabel}
        type="password"
        autoComplete="current-password"
        placeholder={authMessages.passwordPlaceholder}
        value={password}
        disabled={busy}
        error={errors.password && authMessages[errors.password]}
        inputRef={passwordRef}
        onChange={(value) => {
          setPassword(value);
          setErrors((prev) => ({ ...prev, password: undefined }));
        }}
      />
      <Button
        type="submit"
        disabled={busy}
        className="h-12 w-full px-8 font-heading text-xl font-extrabold italic uppercase"
      >
        {busy ? (
          <>
            <Spinner
              aria-hidden="true"
              className="motion-reduce:animate-none"
            />
            {authMessages.loggingIn}
          </>
        ) : (
          <>
            <LogIn data-testid="log-in-icon" aria-hidden="true" />
            {authMessages.logIn}
          </>
        )}
      </Button>
    </form>
  );
}
