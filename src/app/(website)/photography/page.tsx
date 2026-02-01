import { client } from '@/lib/sanity.client'
import { photoCitiesQuery } from '@/lib/sanity.queries'
import { PhotoCityData } from '@/types'
import { RowRenderer } from '@/components/RowRenderer'
import { ENABLE_PHOTOGRAPHY_WIDE_PACKING } from '@/lib/layoutConfig'

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
                <div className="flex flex-col space-y-32">
                    {cities.map((city) => (
                        <article key={city._id} className="w-full">
                            {/* City Header - Text Container (1100px) */}
                            {/* City Header - Aligned with Content Container */}
                            <header className="max-w-[1920px] mx-auto w-full px-[10px] md:px-5 lg:px-10 mb-[26px] md:mb-[14px]">
                                {/* Mobile Header Layout */}
                                <div className="md:hidden flex flex-col items-center gap-1">
                                    <div className="text-[20px] font-bold text-white text-center">
                                        {city.title}, {city.country}
                                    </div>
                                    <div className="text-[16px] font-semibold text-[#9C9C9C] text-center">
                                        {city.subtitle}
                                    </div>
                                </div>

                                {/* Desktop Header Layout */}
                                <div className="hidden md:grid md:grid-cols-12 items-end gap-0">
                                    {/* Left: Title */}
                                    <h3 className="text-[16px] lg:text-[18px] font-bold text-white text-left order-1 md:col-span-3">
                                        {city.title}
                                    </h3>

                                    {/* Center: Subtitle */}
                                    <div className="text-center text-[#9C9C9C] text-[16px] lg:text-[18px] font-semibold order-2 md:order-2 md:col-span-6">
                                        {city.subtitle}
                                    </div>

                                    {/* Right: Country */}
                                    <div className="text-right text-white text-[16px] lg:text-[18px] font-bold order-3 md:col-span-3">
                                        {city.country}
                                    </div>
                                </div>
                            </header>

                            {/* Inline Photo Rows - Image Container (1200px) */}
                            <div className="max-w-[1920px] mx-auto w-full px-0 md:px-5 lg:px-10">
                                <RowRenderer rows={city.rows} aspectRatio="3/2" enableWidePacking={ENABLE_PHOTOGRAPHY_WIDE_PACKING} />
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center border-t border-gray-100">
                    <p className="text-gray-500">No photography found.</p>
                </div>
            )}
        </div>
    )
}
