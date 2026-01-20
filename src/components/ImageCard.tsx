'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { urlFor, sanityLoader } from '@/lib/sanity.client'
import { ImageCardData } from '@/types'
import { clsx } from 'clsx'

interface ImageCardProps extends ImageCardData {
    className?: string
    mobileHeightClass?: string
}

export function ImageCard({ image, alt, caption, className, backgroundColor, mobileHeightClass }: ImageCardProps) {
    const pathname = usePathname()
    const isPhotography = pathname === '/photography'

    if (!image?.asset) return null

    return (
        <div className={clsx('flex flex-col space-y-3', className)}>
            <div
                className={clsx(
                    "relative overflow-hidden rounded-[20px] md:rounded-[30px] w-full",
                    mobileHeightClass || "h-[300px]",
                    isPhotography ? "bg-[#1F1F1F] md:h-[800px]" : "bg-gray-100 md:h-[675px]"
                )}
                style={{ backgroundColor }}
            >
                <Image
                    loader={sanityLoader}
                    src={image.asset._ref}
                    alt={alt || 'Project Image'}
                    fill
                    className="object-cover"
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
