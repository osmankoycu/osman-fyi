'use client'

import Image from 'next/image'
import { sanityLoader } from '@/lib/sanity.client'
import { SanityImage } from '@/types'

interface AboutHeroProps {
    image?: SanityImage
    alt?: string
}

export function AboutHero({ image, alt }: AboutHeroProps) {
    if (!image?.asset) return null
    const assetRef = image.asset._ref || image.asset._id
    if (!assetRef) return null

    return (
        <div className="relative overflow-hidden rounded-[4px] bg-gray-100 w-full h-[200px] md:h-[675px] mb-16">
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
