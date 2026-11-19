"use client";

import { useEffect } from "react";
import { reloadPage } from "@/lib/navigation";

// A page restored from the back/forward cache skips the server, so it could
// show a screen the visitor can no longer see. Reload it so the gate decides.
export function BfcacheReload() {
  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) reloadPage();
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);
  return null;
}
