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
