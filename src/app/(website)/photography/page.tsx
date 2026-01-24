import { client } from '@/lib/sanity.client'
import { photoCitiesQuery } from '@/lib/sanity.queries'
import { PhotoCityData } from '@/types'
import { RowRenderer } from '@/components/RowRenderer'

export const revalidate = 60

export default async function PhotographyPage() {
    let cities: PhotoCityData[] = []
    try {
        cities = await client.fetch<PhotoCityData[]>(photoCitiesQuery)
    } catch (error) {
        console.warn('Failed to fetch photo cities:', error)
    }

    return (
        <div className="pb-24">
            {cities.length > 0 ? (
                cities.map((city) => (
                    <article key={city._id} className="w-full">
                        {/* City Header - Text Container (1100px) */}
                        {/* City Header - Aligned with Content Container */}
                        <header className="max-w-[1280px] mx-auto w-full px-[10px] md:px-5 lg:px-10 mb-3 md:mb-5">
                            <div className="grid grid-cols-1 md:grid-cols-12 items-end gap-1 md:gap-0">
                                {/* Left: Title */}
                                <h3 className="text-[18px] font-semibold text-white order-1 md:col-span-3">
                                    {city.title}
                                </h3>

                                {/* Center: Subtitle */}
                                <div className="text-left md:text-center text-[#9C9C9C] text-[18px] font-semibold order-2 md:order-2 mt-1 md:mt-0 md:col-span-6">
                                    {city.subtitle}
                                </div>

                                {/* Right: Country */}
                                <div className="text-left md:text-right text-white text-[18px] font-semibold order-3 md:col-span-3">
                                    {city.country}
                                </div>
                            </div>
                        </header>

                        {/* Inline Photo Rows - Image Container (1200px) */}
                        <div className="max-w-[1280px] mx-auto w-full px-0 md:px-5 lg:px-10">
                            <RowRenderer rows={city.rows} />
                        </div>
                    </article>
                ))
            ) : (
                <div className="py-12 text-center border-t border-gray-100">
                    <p className="text-gray-500">No photography found.</p>
                </div>
            )}
        </div>
    )
}
