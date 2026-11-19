"use client";

import { LogOut } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { closeError, showError } from "@/components/error-toaster";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authMessages } from "@/lib/messages/auth";
import { goTo } from "@/lib/navigation";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  // After logging out the page is about to be replaced: stay pending.
  const [done, setDone] = useState(false);
  const lastPopup = useRef<string | null>(null);
  const busy = isPending || done;

  function onClick() {
    if (busy) return;
    // Trying again closes the last popup.
    if (lastPopup.current) {
      closeError(lastPopup.current);
      lastPopup.current = null;
    }
    startTransition(async () => {
      let loggedOut = false;
      try {
        // A route at one fixed address, so it works from every page,
        // the 404 page included (see src/app/logout/route.ts).
        // Not following redirects: with no session (logged out in another
        // tab, or expired), the gate redirects to /login, and following that
        // would repeat the POST there and get 405. A redirect means the
        // session is already gone, which is logged out too.
        const response = await fetch("/logout", {
          method: "POST",
          redirect: "manual",
        });
        loggedOut = response.ok || response.type === "opaqueredirect";
      } catch {
        // The app can't be reached: handled below. Rethrowing would put up
        // Next's error page.
      }
      if (!loggedOut) {
        // The session is still there, so /login would only send the user
        // back. Stay on the page and say so.
        lastPopup.current = showError(authMessages.logOutFailed);
        return;
      }
      setDone(true);
      goTo("/login");
    });
  }

  return (
    <Button variant="outline" size="sm" disabled={busy} onClick={onClick}>
      {busy ? (
        <>
          <Spinner aria-hidden="true" className="motion-reduce:animate-none" />
          {authMessages.loggingOut}
        </>
      ) : (
        <>
          <LogOut data-testid="log-out-icon" aria-hidden="true" />
          {authMessages.logOut}
        </>
      )}
    </Button>
  );
}
