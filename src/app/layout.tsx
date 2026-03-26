import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImpactGolf | Play With Purpose",
  description: "A subscription-driven platform combining golf performance tracking, charity fundraising, and monthly prize draws.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
