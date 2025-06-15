import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "WOD Shuffler",
  description:
    "Craft custom CrossFit workouts with ease! Select your target muscle groups and intensity level, and WOD Shuffler generates a personalized workout with warmup, strength, and metcon sections, including benchmark workout suggestions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Craft custom CrossFit workouts with ease! Select your target muscle groups and intensity level, and WOD Shuffler generates a personalized workout with warmup, strength, and metcon sections, including benchmark workout suggestions." />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="WOD Shuffler" />
        <title>WOD Shuffler</title>
        {/* Open Graph & Twitter meta tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="WOD Shuffler" />
        <meta property="og:description" content="Craft custom CrossFit workouts with ease! Select your target muscle groups and intensity level, and WOD Shuffler generates a personalized workout with warmup, strength, and metcon sections, including benchmark workout suggestions." />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="WOD Shuffler" />
        <meta property="twitter:description" content="Craft custom CrossFit workouts with ease! Select your target muscle groups and intensity level, and WOD Shuffler generates a personalized workout with warmup, strength, and metcon sections, including benchmark workout suggestions." />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* <nav className="w-full flex justify-center py-4 bg-black/30 mb-4">
          <div className="flex gap-2 sm:gap-4 text-lg font-semibold">
            <Link href="/timer" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold shadow flex items-center justify-center min-w-[44px] min-h-[44px] transition">Timer</Link>
          </div>
        </nav> */}
        {children}
      </body>
    </html>
  );
}
