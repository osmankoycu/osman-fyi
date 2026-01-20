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
        <div className="container-custom pt-8 md:pt-16 pb-24">
            <div className="mb-12">
                <h1 className="text-[64px] font-bold leading-tight text-black mb-2">Curation</h1>
                <p className="text-[40px] font-semibold leading-[50px] text-black">Things I use and recommend.</p>
            </div>

            {items.length > 0 ? (
                <CurationGrid items={items} />
            ) : (
                <div className="py-12 text-center border-t border-gray-100">
                    <p className="text-gray-500">No curated items found.</p>
                </div>
            )}
        </div>
    )
}
