"use client";

import { LogOut } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authMessages } from "@/lib/messages/auth";
import { goTo } from "@/lib/navigation";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  // After logging out the page is about to be replaced: stay pending.
  const [done, setDone] = useState(false);
  const busy = isPending || done;

  function onClick() {
    if (busy) return;
    startTransition(async () => {
      try {
        // A route at one fixed address, so it works from every page,
        // the 404 page included (see src/app/logout/route.ts).
        await fetch("/logout", { method: "POST" });
      } catch {
        // Nothing to show here: the login gate decides, and /login loads
        // either way. Rethrowing would put up Next's error page.
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
