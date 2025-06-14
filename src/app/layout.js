import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";

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
    "Craft custom CrossFit workouts with ease! Select your target muscle groups and intensity level, and WOD Shuffler generates a personalized workout with warmup, strength, and metcon sections, including benchmark workout suggestions. - built with Base44",
};

export default function RootLayout({ children }) {
  return (
    <html data-theme="base44" lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link href="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/66a45d17d_logo.png" rel="icon" />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Craft custom CrossFit workouts with ease! Select your target muscle groups and intensity level, and WOD Shuffler generates a personalized workout with warmup, strength, and metcon sections, including benchmark workout suggestions. - built with Base44" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Base44" />
        <link href="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/66a45d17d_logo.png" rel="apple-touch-icon" />
        <link href="https://base44.app/api/apps/manifests/684db0cd891c8dfdffa7b4dd/manifest.json" rel="manifest" />
        <title>WOD Shuffler</title>
        {/* Open Graph & Twitter meta tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://app.base44.com" />
        <meta property="og:title" content="WOD Shuffler" />
        <meta property="og:description" content="Craft custom CrossFit workouts with ease! Select your target muscle groups and intensity level, and WOD Shuffler generates a personalized workout with warmup, strength, and metcon sections, including benchmark workout suggestions." />
        <meta property="og:image" content="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/66a45d17d_logo.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://app.base44.com" />
        <meta property="twitter:title" content="WOD Shuffler" />
        <meta property="twitter:description" content="Craft custom CrossFit workouts with ease! Select your target muscle groups and intensity level, and WOD Shuffler generates a personalized workout with warmup, strength, and metcon sections, including benchmark workout suggestions." />
        <meta property="twitter:image" content="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/66a45d17d_logo.png" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
