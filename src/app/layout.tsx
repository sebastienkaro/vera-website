import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/Footer";
import { HubSpotChat } from "@/components/HubSpotChat";

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
      {/* The cart wraps everything: the header carries it on every route, and
          mounting it here means the drawer has exactly one home and can't be
          left off a new page. `children` stays server-rendered — it is passed
          through this client boundary, not rendered inside it — and the
          provider reads nothing at request time, so no page loses its
          prerendering by being in here. */}
      <body className="flex min-h-full flex-col bg-cream font-sans text-espresso">
        <CartProvider>
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
        {/* Sitewide, and outside the cart: the chat bubble belongs to the
            window rather than to any one page, and mounting it here is what
            keeps it from reloading on every navigation. */}
        <HubSpotChat />
      </body>
    </html>
  );
}
