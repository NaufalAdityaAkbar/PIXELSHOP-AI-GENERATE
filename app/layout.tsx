import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "PixelShop | Dashboard Admin",
  description: "AI-powered ecommerce dashboard for UMKM Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#1c1410] text-[#f5e8d5]">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
