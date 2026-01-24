'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { urlFor, sanityLoader } from '@/lib/sanity.client'
import { ImageCardData } from '@/types'
import { clsx } from 'clsx'

interface ImageCardProps extends ImageCardData {
    className?: string
    mobileHeightClass?: string
    layout?: 'full' | 'two'
}

export function ImageCard({ image, alt, caption, className, backgroundColor, mobileHeightClass, layout = 'full' }: ImageCardProps) {
    const pathname = usePathname()
    const isPhotography = pathname === '/photography'

    const assetRef = image?.asset?._ref || image?.asset?._id

    if (!assetRef) return null

    const aspectRatio = image.asset.metadata?.dimensions?.aspectRatio || 4 / 3

    const objectFitClass = layout === 'full'
        ? "object-cover"
        : "object-contain md:object-cover"

    return (
        <div className={clsx('flex flex-col space-y-3', className)}>
            <div
                className={clsx(
                    "relative overflow-hidden rounded-2xl w-full",
                    layout === 'two' && !isPhotography && "min-h-[400px] max-h-[450px] md:min-h-0 md:max-h-none",
                    isPhotography ? "bg-[#1F1F1F]" : "bg-gray-100"
                )}
                style={{
                    backgroundColor,
                    aspectRatio: aspectRatio
                }}
            >
                <Image
                    loader={sanityLoader}
                    src={assetRef}
                    alt={alt || 'Project Image'}
                    fill
                    className={objectFitClass}
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
