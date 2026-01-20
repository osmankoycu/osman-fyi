'use client'

import Image from 'next/image'
import { sanityLoader } from '@/lib/sanity.client'
import { SanityImage } from '@/types'

interface AboutHeroProps {
    image?: SanityImage
    alt?: string
}

export function AboutHero({ image, alt }: AboutHeroProps) {
    if (!image) return null

    return (
        <div className="relative overflow-hidden rounded-[30px] bg-gray-100 w-full h-[300px] md:h-[675px] mb-16">
            <Image
                loader={sanityLoader}
                src={image.asset._ref}
                alt={alt || 'About Hero Image'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
            />
        </div>
    )
}
