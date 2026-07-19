import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "光年回信 · Light-Year Relay",
  description: "分析延遲訊息，在光速與時間膨脹之間替未來做出唯一決策。",
  icons: {
    icon: [
      { url: "/game/branding/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/game/branding/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/game/branding/apple-touch-icon.png",
  },
  openGraph: { title: "光年回信 · Light-Year Relay", description: "你看見的是過去，指令抵達的是未來。", images: ["/game/branding/social-cover.webp"] },
  twitter: { card: "summary_large_image", title: "光年回信", description: "你看見的是過去，指令抵達的是未來。", images: ["/game/branding/social-cover.webp"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><head><link rel="preload" as="image" href="/game/branding/hero-desktop.webp" media="(min-width: 701px)"/><link rel="preload" as="image" href="/game/branding/hero-mobile.webp" media="(max-width: 700px)"/></head><body>{children}</body></html>;
}
