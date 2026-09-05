import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { SITE, CANONICAL_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_URL),
  title: {
    default: "Alpha Watch & Opticals – Premium Watch House & Opticals in Raebareli",
    template: "%s | Alpha Watch & Opticals"
  },
  description:
    "Authorized luxury watches, premium optical eyewear, sunglasses & contact lenses at Chowdhary Complex, Degree College Chauraha, Raebareli. Computerised eye testing & watch repair.",
  keywords: [
    "Alpha Watch & Opticals",
    "watch shop Raebareli",
    "optical shop Raebareli",
    "sunglasses Raebareli",
    "eye test Raebareli",
    "watch repair Raebareli",
    "Titan watch Raebareli",
    "Fastrack sunglasses Raebareli"
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
      { url: "/icons/icon-180.png" }
    ]
  },
  alternates: {
    canonical: CANONICAL_URL
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: CANONICAL_URL,
    siteName: SITE.name,
    title: "Alpha Watch & Opticals – Premium Watch House & Opticals",
    description: SITE.tagline,
    images: [
      {
        url: `${CANONICAL_URL}/images/shop/shop-front.jpg`,
        width: 1200,
        height: 630,
        alt: "Alpha Watch & Opticals Showroom"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Alpha Watch & Opticals – Premium Watch House & Opticals",
    description: SITE.tagline,
    images: [`${CANONICAL_URL}/images/shop/shop-front.jpg`]
  }
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" data-theme="obsidian" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC Theme Initialization Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(new RegExp('(^| )aw_theme=([^;]+)'));var c=m?m[2]:null;var l=null;try{var raw=localStorage.getItem('aw_theme_device');if(raw){var p=JSON.parse(raw);if(p&&p.themeId)l=p.themeId;}}catch(e){}var t=l||c||'obsidian';var v=['obsidian','midnight','oxblood','emerald','platinum'];if(v.indexOf(t)===-1)t='obsidian';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='obsidian';}})();`
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Montserrat:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
