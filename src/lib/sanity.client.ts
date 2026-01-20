import { createClient } from 'next-sanity'
import createImageUrlBuilder from '@sanity/image-url'

import { apiVersion, dataset, projectId, useCdn } from '../../sanity/env'

export const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    perspective: 'published',
})

const builder = createImageUrlBuilder({ projectId: projectId || '', dataset: dataset || '' })

export const urlFor = (source: any) => {
    return builder.image(source)
}

// Custom loader for Next.js Image component to delegate optimization to Sanity
// and prevent quality loss (defaults to quality 100)
export const sanityLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
    return builder
        .image(src)
        .width(width)
        .auto('format')
        .quality(quality || 100) // Max quality by default to prevent compression artifacts
        .url()
}
