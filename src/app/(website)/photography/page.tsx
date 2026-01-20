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
                        <header className="container-text mb-12 max-w-none">
                            <h3 className="text-[40px] leading-[1.1] md:text-[64px] md:leading-[75px] font-bold text-white mb-0">
                                {city.title}
                            </h3>
                            <div className="flex justify-between items-end text-[18px] md:text-[22px] font-semibold text-[#9C9C9C]">
                                <span>{city.subtitle}</span>
                                <span className="text-white">{city.country}</span>
                            </div>
                        </header>

                        {/* Inline Photo Rows - Image Container (1200px) */}
                        <div className="container-custom w-full">
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
