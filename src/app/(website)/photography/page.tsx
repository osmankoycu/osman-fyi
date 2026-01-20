import Link from 'next/link'
import Image from 'next/image'
import { client } from '@/lib/sanity.client'
import { photoCitiesQuery } from '@/lib/sanity.queries'
import { PhotoCityData, SanityImage } from '@/types'
import { urlFor } from '@/lib/sanity.client'

// Add featuredImage type to the local data interface since it's a projection
interface PhotoCityWithImage extends PhotoCityData {
    featuredImage?: SanityImage
}

export const revalidate = 60

export default async function PhotographyPage() {
    let cities: PhotoCityWithImage[] = []
    try {
        cities = await client.fetch<PhotoCityWithImage[]>(photoCitiesQuery)
    } catch (error) {
        console.warn('Failed to fetch photo cities:', error)
    }

    return (
        <div className="container-custom pt-8 md:pt-16 pb-24">
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Photography</h1>
                <p className="text-gray-500 text-lg">Captured moments from around the world.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cities.length > 0 ? (
                    cities.map((city) => (
                        <Link key={city._id} href={`/photography/${city.slug.current}`} className="group block">
                            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 mb-4">
                                {city.featuredImage && (
                                    <Image
                                        src={urlFor(city.featuredImage).width(800).height(600).url()}
                                        alt={city.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                )}
                            </div>
                            <h3 className="text-xl font-medium text-black group-hover:text-gray-600 transition-colors">
                                {city.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
                                {city.country && <span>{city.country}</span>}
                                {city.subtitle && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span>{city.subtitle}</span>
                                    </>
                                )}
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center border-t border-gray-100">
                        <p className="text-gray-500">No photography collections found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
