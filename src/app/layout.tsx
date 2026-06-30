import type { Metadata, Viewport } from "next";
import { Quicksand, Nunito } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Village Playground",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F3EC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${quicksand.variable} ${nunito.variable}`}>
      <body className="min-h-screen">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
