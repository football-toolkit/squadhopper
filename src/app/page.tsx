import { AppHeader } from "@/components/app-header";
import { PitchLayout } from "@/components/pitch-layout";
import { Card } from "@/components/ui/card";

export default function Page() {
  return (
    <PitchLayout header={<AppHeader />}>
      <Card className="w-full items-center gap-4 rounded-2xl border border-border bg-card px-6 pt-8 pb-9 text-center shadow-2xl ring-0 md:max-w-160 md:px-12 md:pt-10 md:pb-11">
        <h1 className="font-heading text-4xl leading-none font-extrabold italic uppercase md:text-6xl">
          All your matches <br />
          in <span className="text-primary">one place.</span>
        </h1>
        <p className="text-sm text-muted-foreground md:text-lg">
          Every team and every tournament on one calendar.
        </p>
      </Card>
    </PitchLayout>
  );
}
