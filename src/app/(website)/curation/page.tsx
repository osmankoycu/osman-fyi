import { client } from '@/lib/sanity.client'
import { curationItemsQuery } from '@/lib/sanity.queries'
import { CurationItemData } from '@/types'
import { CurationGrid } from '@/components/CurationGrid'

export const revalidate = 60

export default async function CurationPage() {
    let items: CurationItemData[] = []
    try {
        items = await client.fetch<CurationItemData[]>(curationItemsQuery)
    } catch (error) {
        console.warn('Failed to fetch curation items:', error)
    }

    return (
        <div className="container-custom pb-24">

            {
                items.length > 0 ? (
                    <CurationGrid items={items} />
                ) : (
                    <div className="py-12 text-center border-t border-gray-100">
                        <p className="text-gray-500">No curated items found.</p>
                    </div>
                )
            }
        </div >
    )
}
