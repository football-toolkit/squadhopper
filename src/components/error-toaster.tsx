"use client";

import { CircleAlert, X } from "lucide-react";
import {
  Toast,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastViewport,
  toast,
  useToastManager,
} from "@/components/ui/toast";
import { authMessages } from "@/lib/messages/auth";

/** Shows an error popup that stays until it is closed. Returns its id. */
export function showError(message: string): string {
  return toast.add({
    description: message,
    type: "error",
    timeout: 0,
    priority: "high",
  });
}

export function closeError(id: string): void {
  toast.close(id);
}

// The generated Toast moves with a transform that starts and ends 150% below its
// place. The not-* variants below add specificity, so these transform-none rules
// beat those generated ones. The slide itself then runs on the content's
// translate property, which the generated transform never touches.
export const toastClasses = [
  "top-0 bottom-auto h-auto origin-top border-destructive bg-card text-foreground",
  "not-data-limited:data-starting-style:transform-none",
  "not-data-expanded:not-data-limited:not-data-swipe-direction:data-ending-style:transform-none",
].join(" ");

export const contentClasses = [
  "items-start transition-all duration-300 ease-out motion-reduce:transition-none",
  "group-data-starting-style/toast:-translate-y-full group-data-starting-style/toast:opacity-0",
  "group-data-ending-style/toast:-translate-y-full group-data-ending-style/toast:opacity-0",
].join(" ");

function ErrorList() {
  const { toasts } = useToastManager();

  return toasts.map((item) => (
    <Toast key={item.id} toast={item} className={toastClasses}>
      <ToastContent className={contentClasses}>
        <CircleAlert
          data-testid="error-toast-icon"
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-destructive"
        />
        <ToastDescription className="min-w-0 flex-1 text-sm text-foreground" />
        <ToastClose aria-label={authMessages.close}>
          <X aria-hidden="true" />
        </ToastClose>
      </ToastContent>
    </Toast>
  ));
}

export function ErrorToaster() {
  return (
    <ToastProvider toastManager={toast}>
      <ToastPortal>
        <ToastViewport className="inset-x-4 top-4 bottom-auto mx-0 w-auto md:right-4 md:left-auto md:w-full">
          <ErrorList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
