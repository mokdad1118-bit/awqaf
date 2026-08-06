import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import "./globals.css";
import { Suspense } from 'react';
import Loading from './loading';

export const metadata: Metadata = {
  title: "نظام إدارة المساجد والعاملين - محافظة السويداء",
  description: "نظام إدارة شؤون المساجد والعاملين في مديرية أوقاف محافظة السويداء",
  icons: {
    icon: '/شعار الدولة .jpeg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-tajawal antialiased">
        <AppShell>
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </AppShell>
      </body>
    </html>
  );
}
