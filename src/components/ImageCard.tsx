'use client'

import Image from 'next/image'
import { urlFor } from '@/lib/sanity.client'
import { ImageCardData } from '@/types'
import { clsx } from 'clsx'

interface ImageCardProps extends ImageCardData {
    className?: string
}

export function ImageCard({ image, alt, caption, className }: ImageCardProps) {
    if (!image?.asset) return null

    return (
        <div className={clsx('flex flex-col space-y-3', className)}>
            <div className="relative overflow-hidden rounded-xl bg-gray-100 w-full h-auto">
                {/* Aspect ratio can be handled by the image's natural size or forced. 
             For "full" vs "two" layouts, the container width changes, logic dictates height.
             Next.js Image needs width/height or fill. 
             If we use 'fill', parent needs relative + aspect ratio.
             Let's use responsive width and intrinsic height behavior or fill with a wrapper.
             Given "editorial" usually implies preserving aspect ratio. 
             We'll use width=0 height=0 sizes=100vw style={{width:'100%', height:'auto'}} to strict responsive.
         */}
                <Image
                    src={urlFor(image).url()}
                    alt={alt || 'Project Image'}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.01]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
            {caption && (
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    {caption}
                </p>
            )}
        </div>
    )
}
