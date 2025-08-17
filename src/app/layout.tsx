// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";
import AuthRedirect from "../components/AuthRedirect";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PayBoy - Accept Multiple Payment Types",
  description: "Accept PYUSD, PayPal, Venmo, and email payments all in one platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthRedirect />
          {children}
        </Providers>
      </body>
    </html>
  );
}
