import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { PitchLayout } from "@/components/pitch-layout";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME } from "@/lib/app-name";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Page not found · ${APP_NAME}`,
};

// Keep this synchronous, with no runtime data or Suspense, so an unknown URL
// gets its 404 status before streaming starts.
export default function NotFound() {
  return (
    <PitchLayout header={<AppHeader />}>
      <Card className="w-full items-center gap-4 rounded-2xl border border-border bg-card px-6 pt-8 pb-9 text-center shadow-2xl ring-0 md:max-w-160 md:px-12 md:pt-10 md:pb-11">
        <h1 className="font-heading text-4xl leading-none font-extrabold italic uppercase md:text-6xl">
          <span className="text-primary">404</span> <br />
          Page not found.
        </h1>
        <p className="text-sm text-muted-foreground md:text-lg">
          This page doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/"
          className={cn(
            buttonVariants(),
            "h-12 w-full px-8 font-heading text-xl font-extrabold italic uppercase md:w-auto",
          )}
        >
          Back to home
        </Link>
      </Card>
    </PitchLayout>
  );
}
