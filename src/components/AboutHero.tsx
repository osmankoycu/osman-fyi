'use client'

import Image from 'next/image'
import { sanityLoader } from '@/lib/sanity.client'
import { SanityImage } from '@/types'

interface AboutHeroProps {
    image?: SanityImage
    alt?: string
    image2?: SanityImage
    alt2?: string
}

export function AboutHero({ image, alt, image2, alt2 }: AboutHeroProps) {
    if (!image?.asset) return null
    const assetRef = image.asset._ref || image.asset._id
    if (!assetRef) return null

    const assetRef2 = image2?.asset?._ref || image2?.asset?._id

    if (assetRef2) {
        return (
            <div className="w-full aspect-video mb-16 grid grid-cols-3 gap-[2px]">
                <div className="relative col-span-1 h-full overflow-hidden rounded-[4px] bg-gray-100">
                    <Image
                        loader={sanityLoader}
                        src={assetRef}
                        alt={alt || 'About Hero Image 1'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 640px"
                        priority
                    />
                </div>
                <div className="relative col-span-2 h-full overflow-hidden rounded-[4px] bg-gray-100">
                    <Image
                        loader={sanityLoader}
                        src={assetRef2}
                        alt={alt2 || 'About Hero Image 2'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 66vw, 1280px"
                        priority
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="relative overflow-hidden rounded-[4px] bg-gray-100 w-full aspect-video mb-16">
            <Image
                loader={sanityLoader}
                src={assetRef}
                alt={alt || 'About Hero Image'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1920px"
                priority
            />
        </div>
    )
}
