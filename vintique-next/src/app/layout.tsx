import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata: Metadata = {
  title: "Vintique - Vintage Shop",
  description: "Discover vintage style",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el" suppressHydrationWarning>
      <body>
        <ThemeRegistry>
          <CartProvider>
            <AuthProvider>{children}</AuthProvider>
          </CartProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
