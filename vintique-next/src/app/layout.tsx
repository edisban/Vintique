import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import ThemeRegistry from "@/components/ThemeRegistry";
import Shell from "@/components/Shell";

const sans = Inter({ subsets: ["latin", "greek"], variable: "--font-sans" });
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Vintique | Buy & Sell Vintage and Pre-loved Fashion",
  description: "The community marketplace for vintage and pre-loved fashion. Buy one-of-a-kind pieces and sell the clothes you no longer wear. Listing is free.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <body>
        {/* Applies the saved light/dark class before paint, so there is no theme flash */}
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider>
          <ThemeRegistry>
            <CartProvider>
              <Shell>{children}</Shell>
            </CartProvider>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
