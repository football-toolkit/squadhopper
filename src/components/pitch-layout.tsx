import type { ReactNode } from "react";
import { Pitch } from "@/components/pitch";

type PitchLayoutProps = {
  header?: ReactNode;
  children: ReactNode;
};

// The page frame: the surface (header and pitch band) fills the top half of the
// screen, and the card overlaps the band by 48 px. h-[50svh] lives only here:
// svh, not dvh, so the band doesn't jump while a phone's address bar slides.
// The band's bottom padding is its top padding plus the overlap, so the space
// above the pitch equals the space between the pitch and the card.
export function PitchLayout({ header, children }: PitchLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex h-[50svh] min-h-min shrink-0 flex-col bg-surface">
        {header}
        <div className="flex min-h-20 flex-1 items-center justify-center border-b border-divider px-5 pt-4 pb-16">
          <Pitch className="block size-full max-h-57 max-w-92" />
        </div>
      </div>
      <main className="relative -mt-12 flex justify-center px-5 pb-8">
        {children}
      </main>
    </div>
  );
}
