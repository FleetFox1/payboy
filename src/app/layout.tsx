import type { Metadata } from "next";
// ✅ REMOVE THIS LINE: import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

// ✅ REMOVE THIS LINE: const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PayBoy",
  description: "Accept PYUSD, PayPal, Venmo, and email payments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body> {/* ✅ REMOVE: className={inter.className} */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}