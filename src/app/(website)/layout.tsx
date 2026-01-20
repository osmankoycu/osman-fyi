import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

import { Header } from '@/components/Header'
import { ThemeRegistry } from '@/components/ThemeRegistry'

export const metadata: Metadata = {
    title: 'Osman Köycü',
    description: 'Product Designer based in New York.',
    icons: {
        icon: [
            { url: '/favicon/favicon.ico' },
            { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: [
            { url: '/favicon/apple-touch-icon.png' },
        ],
        other: [
            {
                rel: 'android-chrome-192x192',
                url: '/favicon/android-chrome-192x192.png',
            },
            {
                rel: 'android-chrome-512x512',
                url: '/favicon/android-chrome-512x512.png',
            },
        ],
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://use.typekit.net/skt3avi.css" />
            </head>
            <body>
                <ThemeRegistry />
                <Header />
                <Navbar />
                <main className="min-h-screen">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    )
}
