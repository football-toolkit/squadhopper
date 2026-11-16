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

function ErrorList() {
  const { toasts } = useToastManager();

  return toasts.map((item) => (
    <Toast
      key={item.id}
      toast={item}
      className="top-0 bottom-auto h-auto origin-top border-destructive bg-card text-foreground transition-[transform,opacity] duration-300 ease-out [transform:none] data-ending-style:-translate-y-full data-ending-style:opacity-0 data-starting-style:-translate-y-full data-starting-style:opacity-0 motion-reduce:transition-none"
    >
      <ToastContent className="items-start">
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
