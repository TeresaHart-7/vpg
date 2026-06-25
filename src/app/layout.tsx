import type { Metadata } from "next";
import { Quicksand, Nunito } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Village Playground",
  description:
    "Registration and community platform for the Village Playground gathering — Sept 25–29, 2026 at Camp Ki-Wa-Y.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${quicksand.variable} ${nunito.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
