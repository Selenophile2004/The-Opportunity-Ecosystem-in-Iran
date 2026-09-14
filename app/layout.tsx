import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "The Opportunity Ecosystem in Iran",
    template: "%s | ILIA",
  },
  description: "A source-backed interactive model of the Opportunity Ecosystem in Iran.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
