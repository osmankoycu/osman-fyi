import { client } from '@/lib/sanity.client'
import { projectsByTypeQuery } from '@/lib/sanity.queries'
import { ProjectData } from '@/types'
import { RowRenderer } from '@/components/RowRenderer'

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
        <div className="pb-24">
            {/* Product List with Inline Content */}
            <section>
                <div className="flex flex-col space-y-32">
                    {products.length > 0 ? (
                        products.map((project) => (
                            <article key={project._id} className="w-full">
                                {/* Project Header - Text Container (1100px) */}
                                <header className="container-text mb-12">
                                    <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-0">
                                        <h3 className="text-[18px] md:text-[20px] lg:text-[22px] font-bold text-black">
                                            {project.title}
                                        </h3>
                                    </div>
                                    <div className="flex justify-between items-end text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#9C9C9C]">
                                        <span>{project.roleLine}</span>
                                        <span className="text-black">{project.year || '2024'}</span>
                                    </div>
                                </header>

                                {/* Inline Project Rows - Image Container (1200px) */}
                                <div className="max-w-[1280px] mx-auto w-full px-0 md:px-5 lg:px-10">
                                    <RowRenderer rows={project.rows} />
                                </div>
                            </article>
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
