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
                                {/* Project Header - Aligned with Content Container */}
                                <header className="max-w-[1920px] mx-auto w-full px-[10px] md:px-5 lg:px-10 mb-3 md:mb-5">
                                    <div className="grid grid-cols-1 md:grid-cols-12 items-end gap-1 md:gap-0">
                                        {/* Left: Title */}
                                        <h3 className="text-[18px] font-semibold text-black order-1 md:col-span-3">
                                            {project.title}
                                        </h3>

                                        {/* Center: Role */}
                                        <div className="text-left md:text-center text-[#9C9C9C] text-[18px] font-semibold order-2 md:order-2 mt-1 md:mt-0 md:col-span-6">
                                            {project.roleLine}
                                        </div>

                                        {/* Right: Year */}
                                        <div className="text-left md:text-right text-black text-[18px] font-semibold order-3 md:col-span-3">
                                            {project.year || '2026'}
                                        </div>
                                    </div>
                                </header>

                                {/* Inline Project Rows - Image Container (1200px) */}
                                <div className="max-w-[1920px] mx-auto w-full px-0 md:px-5 lg:px-10">
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
