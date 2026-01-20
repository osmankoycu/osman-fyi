import { client } from '@/lib/sanity.client'
import { projectsByTypeQuery } from '@/lib/sanity.queries'
import { ProjectData } from '@/types'
import { ProjectListCard } from '@/components/ProjectListCard'

export const revalidate = 60

export default async function ProductPage() {
    let products: ProjectData[] = []
    try {
        products = await client.fetch<ProjectData[]>(projectsByTypeQuery, { type: 'product' })
    } catch (error) {
        console.warn('Failed to fetch products:', error)
    }

    return (
        <div className="container-custom pt-8 md:pt-16 pb-24">
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Product</h1>
                <p className="text-gray-500 text-lg">Digital products and systems.</p>
            </div>

            <div className="flex flex-col">
                {products.length > 0 ? (
                    products.map((project) => (
                        <ProjectListCard key={project._id} project={project} />
                    ))
                ) : (
                    <div className="py-12 text-center border-t border-gray-100">
                        <p className="text-gray-500">No products found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
