'use client'

import { VideoCardData } from '@/types'
import { clsx } from 'clsx'
import { usePathname } from 'next/navigation'

interface VideoCardProps extends VideoCardData {
    className?: string
    layout?: 'full' | 'two'
    fillContainer?: boolean
    objectFit?: 'cover' | 'contain'
    backgroundColor?: string
}

export function VideoCard({ video, alt, caption, className, layout = 'full', fillContainer, objectFit, backgroundColor }: VideoCardProps) {
    const pathname = usePathname()
    const isPhotography = pathname === '/photography'
    const videoUrl = video?.asset?.url

    if (!videoUrl) return null

    const objectFitClass = objectFit
        ? `object-${objectFit}`
        : (layout === 'full' ? "object-cover" : "object-contain md:object-cover")

    return (
        <div className={clsx('flex flex-col space-y-3', fillContainer && 'h-full', className)}>
            <div
                className={clsx(
                    "relative overflow-hidden rounded-lg w-full",
                    fillContainer ? "flex-1 min-h-0" : (layout === 'two' && !isPhotography && "min-h-[400px] max-h-[450px] md:min-h-0 md:max-h-none"),
                    isPhotography ? "bg-[#1F1F1F]" : "bg-gray-100"
                )}
                style={{
                    backgroundColor,
                    aspectRatio: fillContainer ? undefined : (16 / 9) // Default video aspect ratio
                }}
            >
                <video
                    src={videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={clsx("w-full h-full", objectFitClass)}
                    aria-label={alt || 'Project Video'}
                />
                {((backgroundColor === 'white' || backgroundColor?.toLowerCase() === '#ffffff')) && (
                    <div className="absolute inset-0 border border-black/10 mix-blend-multiply pointer-events-none rounded-lg" />
                )}
            </div>
            {caption && (
                <p className="text-[22px] font-semibold text-[#9C9C9C] leading-relaxed px-1">
                    {caption}
                </p>
            )}
        </div>
    )
}
