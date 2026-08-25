import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthGate from "@/components/AuthGate";
import Shell from "@/components/Shell";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "iPOST HR — Boshqaruv paneli",
  description: "Vakansiyalar va arizalarni boshqarish paneli",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1f3ce6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={manrope.variable}>
      <body>
        {/* Telegram Mini App SDK */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <AuthGate>
          <Shell>{children}</Shell>
        </AuthGate>
      </body>
    </html>
  );
}
