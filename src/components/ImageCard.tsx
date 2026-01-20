'use client'

import Image from 'next/image'
import { urlFor, sanityLoader } from '@/lib/sanity.client'
import { ImageCardData } from '@/types'
import { clsx } from 'clsx'

interface ImageCardProps extends ImageCardData {
    className?: string
}

export function ImageCard({ image, alt, caption, className }: ImageCardProps) {
    if (!image?.asset) return null

    return (
        <div className={clsx('flex flex-col space-y-3', className)}>
            <div className="relative overflow-hidden rounded-[30px] bg-gray-100 w-full h-[300px] md:h-[675px]">
                <Image
                    loader={sanityLoader}
                    src={image.asset._ref}
                    alt={alt || 'Project Image'}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-[1.01]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                />
            </div>
            {caption && (
                <p className="text-[22px] font-semibold text-[#9C9C9C] leading-relaxed px-1">
                    {caption}
                </p>
            )}
        </div>
    )
}
