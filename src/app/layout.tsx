import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'PH Poll 2028 — Unofficial Filipino Election Survey',
  description:
    'An unofficial, non-partisan online survey for the 2025 Philippine elections. One vote per household. No registration required.',
  keywords: ['Philippine elections', '2025', 'Halalan', 'survey', 'poll', 'Pilipinas'],
  openGraph: {
    title: 'PH Poll 2025',
    description: 'Who will you vote for? Cast your survey vote now.',
    type: 'website',
    locale: 'en_PH',
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