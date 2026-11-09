import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/wordmark";
import { APP_NAME } from "@/lib/app-name";

type AppHeaderProps = {
  children?: ReactNode;
};

// The surface color comes from PitchLayout. Children are actions on the right.
// The wordmark links home: no underline, and a grey focus ring, never volt.
export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="flex h-17 shrink-0 items-center justify-between border-b border-divider px-5 md:h-22 md:px-16">
      <Link
        href="/"
        aria-label={`${APP_NAME} home`}
        className="rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <Wordmark />
      </Link>
      {children}
    </header>
  );
}
