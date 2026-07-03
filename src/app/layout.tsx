import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { Footer } from "@/components/Footer";

const hostGrotesk = localFont({
  src: "../fonts/HostGrotesk-Variable.ttf",
  variable: "--font-host-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hostGrotesk.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-cream font-sans text-espresso">
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
