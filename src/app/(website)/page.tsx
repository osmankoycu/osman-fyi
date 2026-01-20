import { client } from '@/lib/sanity.client'
import { projectsByTypeQuery } from '@/lib/sanity.queries'
import { ProjectData } from '@/types'
import { ProjectListCard } from '@/components/ProjectListCard'

// Revalidate every 60 seconds
export const revalidate = 60

export default async function Home() {
    let products: ProjectData[] = []
    try {
        products = await client.fetch<ProjectData[]>(projectsByTypeQuery, { type: 'product' })
    } catch (error) {
        console.warn('Failed to fetch products:', error)
    }

    return (
        <div className="container-custom pt-8 md:pt-16 pb-24">
            {/* Static Hero */}
            <section className="mb-24 md:mb-32 max-w-2xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8">
                    Osman Köycu, <br />
                    Independent Designer.
                </h1>
                <p className="text-xl md:text-2xl font-medium text-gray-600 leading-relaxed md:leading-relaxed">
                    I enjoy creating and experimenting with new ideas.
                    Currently working on <span className="text-black border-b-2 border-black pb-0.5">Image Inc.</span>, based in New York.
                </p>
            </section>

            {/* Product List */}
            <section>
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-2">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Selected Work
                    </h2>
                    <span className="text-sm text-gray-400">2024 — Present</span>
                </div>

                <div className="flex flex-col">
                    {products.length > 0 ? (
                        products.map((project) => (
                            <ProjectListCard key={project._id} project={project} />
                        ))
                    ) : (
                        <div className="py-12 text-center border-t border-gray-100 bg-gray-50/50 rounded-lg">
                            <p className="text-gray-500">No products found. Add some in Sanity Studio!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
