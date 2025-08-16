// src/app/layout.tsx
import './globals.css';
import { Providers } from '../lib/privy';

export const metadata = {
  title: 'PayBoy',
  description: 'Your Web3 payments made simple.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
