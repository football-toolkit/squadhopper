"use client";

import { CircleAlert } from "lucide-react";
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

// The popup's place, look and slide-down are in the Toast component itself
// (src/components/ui/toast.tsx). Only the error color is added here.
function ErrorList() {
  const { toasts } = useToastManager();

  return toasts.map((item) => (
    <Toast key={item.id} toast={item} className="border-destructive">
      <ToastContent>
        <CircleAlert
          data-testid="error-toast-icon"
          aria-hidden="true"
          className="size-5 shrink-0 text-destructive"
        />
        <ToastDescription />
        <ToastClose aria-label={authMessages.close} />
      </ToastContent>
    </Toast>
  ));
}

export function ErrorToaster() {
  return (
    <ToastProvider toastManager={toast}>
      <ToastPortal>
        <ToastViewport>
          <ErrorList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
