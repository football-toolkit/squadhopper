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
  "top-0 bottom-auto h-auto origin-top rounded-xl border-destructive bg-surface text-foreground shadow-2xl",
  "not-data-limited:data-starting-style:transform-none",
  "not-data-expanded:not-data-limited:not-data-swipe-direction:data-ending-style:transform-none",
].join(" ");

export const contentClasses = [
  "items-center py-1 pr-1 pl-4 transition-all duration-300 ease-out motion-reduce:transition-none",
  "group-data-starting-style/toast:-translate-y-full group-data-starting-style/toast:opacity-0",
  "group-data-ending-style/toast:-translate-y-full group-data-ending-style/toast:opacity-0",
].join(" ");

// The generated viewport sits at the bottom, at most max-w-sm wide, and from sm:
// up at the right with w-full. tailwind-merge drops each generated class that
// one of these replaces, including the sm: ones (sm:inset-x-3 replaces
// sm:right-4 and sm:left-auto, sm:w-auto replaces sm:w-full), so the
// 12 px phone placement holds up to md, and from md it is 24 px top right, 400 px wide.
export const viewportClasses = [
  "inset-x-3 top-3 bottom-auto mx-0 w-auto max-w-none sm:inset-x-3 sm:w-auto",
  "md:top-6 md:right-6 md:left-auto md:w-100",
].join(" ");

function ErrorList() {
  const { toasts } = useToastManager();

  return toasts.map((item) => (
    <Toast key={item.id} toast={item} className={toastClasses}>
      <ToastContent className={contentClasses}>
        <CircleAlert
          data-testid="error-toast-icon"
          aria-hidden="true"
          className="size-5 shrink-0 text-destructive"
        />
        <ToastDescription className="min-w-0 flex-1 text-sm font-semibold text-foreground" />
        <ToastClose
          aria-label={authMessages.close}
          className="size-11 text-muted-foreground hover:text-foreground"
        >
          <X aria-hidden="true" className="size-4.5" />
        </ToastClose>
      </ToastContent>
    </Toast>
  ));
}

export function ErrorToaster() {
  return (
    <ToastProvider toastManager={toast}>
      <ToastPortal>
        <ToastViewport className={viewportClasses}>
          <ErrorList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
