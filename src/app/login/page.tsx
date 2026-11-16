import type { Metadata } from "next";
import { PitchLayout } from "@/components/pitch-layout";
import { Card } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";
import { APP_NAME } from "@/lib/app-name";
import { authMessages } from "@/lib/messages/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: `Log in · ${APP_NAME}`,
};

export default function Page() {
  return (
    <PitchLayout>
      <div className="flex w-full flex-col items-center gap-4 md:max-w-md">
        <Card className="w-full gap-4 rounded-2xl border border-border bg-card px-6 pt-8 pb-9 shadow-2xl ring-0 md:px-10 md:pt-10 md:pb-11">
          <div className="flex flex-col items-center gap-2 text-center">
            <Wordmark />
            <p className="text-sm text-muted-foreground">
              {authMessages.tagline}
            </p>
          </div>
          <LoginForm />
        </Card>
        <p className="text-xs text-muted-foreground">
          {authMessages.signUpsClosed}
        </p>
      </div>
    </PitchLayout>
  );
}
