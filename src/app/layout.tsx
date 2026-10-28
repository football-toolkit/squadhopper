import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming soon",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
