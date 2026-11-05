import type { Metadata } from "next";
import { Archivo, Geist_Mono, Public_Sans } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Rotary D9215 Foundation Dinner — Business Partners",
    template: "%s · Rotary D9215 Foundation Dinner",
  },
  description:
    "Advertising space for Rotary and Rotaract network businesses at the District 9215 Foundation Dinner, 21 November 2026, Trademark Hotel, Nairobi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${publicSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
