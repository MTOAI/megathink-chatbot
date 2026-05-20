import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MegaBot — Course & Tutor Finder | Mega Think Online",
  description:
    "Find the right IB, DSE, IGCSE or Primary tutor on Mega Think Online.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
