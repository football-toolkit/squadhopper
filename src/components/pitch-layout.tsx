import type { ReactNode } from "react";
import { Pitch } from "@/components/pitch";

type PitchLayoutProps = {
  header?: ReactNode;
  children: ReactNode;
};

// The page frame: the surface (header and pitch band) fills at least the top
// half of the screen, and the card overlaps the band by 48 px. min-h-[50svh]
// lives only here: svh, not dvh, so the band doesn't jump while a phone's
// address bar slides. It's a minimum, not a fixed height, because Safari
// doesn't let min-h-min beat a fixed height.
//
// The band is a column: a space, the pitch area, a space, and the 48 px under
// the card. The pitch area grows 8 times as fast as each space, so it takes
// about 80% of the free height, and the space above the pitch equals the space
// between the pitch and the card. The pitch grows with the band up to 960 px
// wide (max-w-240), a cap that belongs to the page frame, not to any card.
//
// The pitch fills an absolutely positioned box over the pitch area, because
// Safari doesn't resolve its height: 100% inside a flex band.
//
// min-h-44 keeps the pitch at least 96 px tall (16 above + 96 + 16 below + the
// 48 px overlap), and min-h-24 keeps the pitch area from shrinking below it.
// On short screens, such as a phone in landscape, the surface then grows past
// half the screen to fit the header and the band; everywhere else it ends at
// half.
export function PitchLayout({ header, children }: PitchLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <div
        data-testid="pitch-band"
        className="flex h-[50svh] min-h-min shrink-0 flex-col bg-surface"
      >
        {header}
        <div className="flex min-h-44 flex-1 flex-col border-b border-divider">
          <div className="min-h-4 grow" />
          <div className="relative min-h-24 grow-8">
            <div className="absolute inset-x-5 inset-y-0 flex items-center justify-center">
              <Pitch
                data-testid="pitch"
                className="block size-full max-w-240"
              />
            </div>
          </div>
          <div className="min-h-4 grow" />
          <div className="h-12 shrink-0" />
        </div>
      </div>
      <main className="relative -mt-12 flex justify-center px-5 pb-8">
        {children}
      </main>
    </div>
  );
}
