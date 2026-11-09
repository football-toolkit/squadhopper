import type { ReactNode } from "react";
import { Pitch } from "@/components/pitch";

type PitchLayoutProps = {
  header?: ReactNode;
  children: ReactNode;
};

// The page frame: the surface (header and pitch band) fills the top half of the
// screen, and the card overlaps the band by 48 px. h-[50svh] lives only here:
// svh, not dvh, so the band doesn't jump while a phone's address bar slides.
//
// The pitch fills an absolutely positioned box over the band's padded area,
// because Safari doesn't resolve its height: 100% inside a flex band. The box's
// bottom gap is its top gap plus the overlap, so the space above the pitch
// equals the space between the pitch and the card.
//
// min-h-44 keeps the pitch at least 96 px tall (96 + 16 above + 64 below). On
// short screens, such as a phone in landscape, the surface's min-h-min then
// lets the grey grow past half the screen; everywhere else it ends at half.
export function PitchLayout({ header, children }: PitchLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex h-[50svh] min-h-min shrink-0 flex-col bg-surface">
        {header}
        <div className="relative min-h-44 flex-1 border-b border-divider">
          <div className="absolute inset-x-5 top-4 bottom-16 flex items-center justify-center">
            <Pitch className="block size-full max-h-57 max-w-92" />
          </div>
        </div>
      </div>
      <main className="relative -mt-12 flex justify-center px-5 pb-8">
        {children}
      </main>
    </div>
  );
}
