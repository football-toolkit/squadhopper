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
// place, and a transition on `transform`, `opacity` and `height`. The not-*
// variants below add specificity, so these rules beat those generated ones: the
// transform-none rules cancel the generated transform, and the not-data-limited
// transition rules replace the generated transition, which is an arbitrary
// property that comes after plain utilities. The slide itself runs on the root's
// `translate` property, which the generated transform never touches. It sits on
// the root because Base UI waits only for the root's animations before it
// unmounts the popup, so the exit slide gets to play. The exit override ends in
// `!` because the generated exit rule has the same specificity and comes later in
// the CSS; it has no data-expanded condition, so the exit also slides up while
// the mouse is over the viewport (as when Close is clicked).
export const toastClasses = [
  "top-0 bottom-auto h-auto origin-top rounded-xl border-destructive bg-surface text-foreground shadow-2xl",
  "not-data-limited:data-starting-style:transform-none",
  "not-data-limited:not-data-swipe-direction:data-ending-style:transform-none!",
  "data-starting-style:-translate-y-full data-starting-style:opacity-0",
  "data-ending-style:-translate-y-full data-ending-style:opacity-0",
  "not-data-limited:transition-all not-data-limited:duration-300 not-data-limited:ease-out not-data-limited:motion-reduce:transition-none",
].join(" ");

export const contentClasses = "items-center py-1 pr-1 pl-4";

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
