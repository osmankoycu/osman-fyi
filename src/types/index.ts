import { PortableTextBlock } from 'sanity'

export interface SanityImage {
    _type: 'image'
    asset: {
        _ref?: string
        _id?: string
        _type: 'reference' | 'sanity.imageAsset'
        metadata?: {
            dimensions: {
                width: number
                height: number
                aspectRatio: number
            }
        }
    }
    hotspot?: any
    crop?: any
    alt?: string
}

export interface ImageCardData {
    _type: 'imageCard'
    image: SanityImage
    alt?: string
    caption?: string
    backgroundColor?: string
}

export interface TextCardData {
    _type: 'textCard'
    text: PortableTextBlock[]
    backgroundColor?: string
    textColor?: string
}

export interface VideoCardData {
    _type: 'videoCard'
    video: {
        asset: {
            _ref?: string
            url?: string
        }
    }
    caption?: string
    alt?: string
}

export type RowItem = ImageCardData | TextCardData | VideoCardData

export interface RowData {
    _key: string
    _type: 'row'
    layout: 'full' | 'two'
    items: RowItem[]
    backgroundColor?: string
}

export interface ProjectData {
    _id: string
    title: string
    slug: { current: string }
    type: 'product' | 'experiment'
    year?: string
    roleLine?: string
    rows?: RowData[]
}

export interface PhotoCityData {
    _id: string
    title: string
    slug: { current: string }
    country?: string
    subtitle?: string
    rows?: RowData[]
}

export interface CurationItemData {
    _id: string
    title: string
    image: SanityImage
    url: string
}

export interface AboutPageData {
    _id: string
    heroImage?: SanityImage
    bio?: PortableTextBlock[]
}
