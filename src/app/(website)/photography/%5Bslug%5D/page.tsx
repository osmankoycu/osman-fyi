import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity.client'
import { photoCityBySlugQuery } from '@/lib/sanity.queries'
import { PhotoCityData } from '@/types'
import { RowRenderer } from '@/components/RowRenderer'
import { clsx } from 'clsx'

export const revalidate = 60

type Props = {
    params: Promise<{ slug: string }>
}

export default async function PhotoCityPage({ params }: Props) {
    const { slug } = await params
    let city: PhotoCityData | null = null
    try {
        city = await client.fetch<PhotoCityData>(photoCityBySlugQuery, { slug })
    } catch (error) {
        console.warn('Failed to fetch city:', error)
    }

    if (!city) {
        notFound()
    }

    // Dark gallery theme overrides
    return (
        // Force full viewport dark background, handling navbar transparency or override?
        // Navbar is sticky white/blur. For this page, we might want to override Navbar color or just let content be dark.
        // The requirement says "Photography detail page can be dark like a gallery".
        // We can add a class to the main wrapper. 
        // Ideally, we'd update the Navbar context, but for simplicity, let's keep navbar as is (it blurs) or we can make it dark.
        // Let's stick to the content area being dark for now, or wrap it in a min-h-screen dark div.
        // Making the whole page dark via global body class change is harder with server components without client logic.
        // We'll just style this container.
        <div className="min-h-screen bg-black text-white -mt-24 pt-32 pb-24">
            <div className="container-custom">
                <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/20">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-2">
                            {city.title}
                        </h1>
                        {city.subtitle && (
                            <p className="text-xl text-gray-400 font-medium">
                                {city.subtitle}
                            </p>
                        )}
                    </div>

                    {city.country && (
                        <div className="text-lg md:text-xl font-medium text-white/80">
                            {city.country}
                        </div>
                    )}
                </header>

                {/* Override RowRenderer or simple div for rows to inherit dark text if needed?
            RowRenderer uses Cards. TextCard uses 'text-black/80'. We might need to override.
            ImageCard is fine.
            We can pass a context or just use CSS overrides.
            Let's use a wrapper for CSS overrides on TextCard.
        */}
                <div className="w-full text-white [&_.prose]:text-gray-300 [&_p]:text-gray-300">
                    <RowRenderer rows={city.rows} />
                </div>
            </div>
        </div>
    )
}
