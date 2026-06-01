import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "منصة خبرات | لإصدار وتوثيق شهادات الخبرة",
  description: "أداة احترافية لإصدار شهادات الخبرة وتوثيقها بباركود لضمان المصداقية.",
};

import FullscreenToggle from "@/components/FullscreenToggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${tajawal.variable} font-sans bg-gray-50 text-gray-900 antialiased`}>
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              fontFamily: 'var(--font-tajawal)',
              direction: 'rtl',
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: '#16a34a',
                secondary: '#fff',
              },
            },
          }}
        />
        {children}
        <FullscreenToggle />
      </body>
    </html>
  );
}
