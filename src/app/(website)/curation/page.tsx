import { client } from '@/lib/sanity.client'
import { curationItemsQuery, curationCategoriesQuery } from '@/lib/sanity.queries'
import { CurationItemData, CurationCategoryData } from '@/types'
import { CurationContainer } from '@/components/CurationContainer'

export const revalidate = 60

export default async function CurationPage() {
    let items: CurationItemData[] = []
    let categories: CurationCategoryData[] = []

    try {
        [items, categories] = await Promise.all([
            client.fetch<CurationItemData[]>(curationItemsQuery),
            client.fetch<CurationCategoryData[]>(curationCategoriesQuery)
        ])
    } catch (error) {
        console.warn('Failed to fetch curation data:', error)
    }

    return (
        <div className="container-custom pb-24">
            <CurationContainer items={items} categories={categories} />
        </div >
    )
}
