import type { ReactNode } from "react";
import { Wordmark } from "@/components/wordmark";

type AppHeaderProps = {
  children?: ReactNode;
};

// The surface color comes from PitchLayout. Children are actions on the right.
export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="flex h-17 shrink-0 items-center justify-between border-b border-divider px-5 md:h-22 md:px-16">
      <Wordmark />
      {children}
    </header>
  );
}
