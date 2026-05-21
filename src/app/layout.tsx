import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'PH Poll 2028 — Sino ang Iboboto Mo? Unofficial Filipino Election Survey',
  description:
    'Unofficial 2028 Philippines election poll. Vote for your President, Vice President, and Senators. Halalan 2028 — walang sign up, libre lang bumoto!',
  keywords: [
    'Philippine elections 2028',
    'Halalan 2028',
    'Eleksyon 2028',
    'PH election poll',
    'Pilipinas 2028',
    'sino iboboto 2028',
    'Philippines president 2028',
    'PH poll 2028',
    'unofficial Philippine election survey',
    'Sara Duterte 2028',
    'Leni Robredo 2028',
    'BBM Marcos 2028',
    'Vico Sotto 2028',
    'Kiko Pangilinan 2028',
  ],
  openGraph: {
    title: 'PH Poll 2028 — Sino ang Iboboto Mo?',
    description: 'Vote for your 2028 President, VP, and Senators! Walang sign up, libre lang. Get your shareable ballot card! 🇵🇭🗳️',
    type: 'website',
    locale: 'en_PH',
    url: 'https://ph-poll.vercel.app',
    siteName: 'PH Poll 2028',
    images: [
      {
        url: 'https://ph-poll.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PH Poll 2028 — Unofficial Filipino Election Survey',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PH Poll 2028 — Sino ang Iboboto Mo?',
    description: 'Vote for your 2028 President, VP, and Senators! Walang sign up, libre lang 🇵🇭🗳️',
    images: ['https://ph-poll.vercel.app/og-image.png'],
  },
  alternates: {
    canonical: 'https://ph-poll.vercel.app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  other: {
    'google-adsense-account': 'ca-pub-2798925924296404',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PH">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2798925924296404"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}