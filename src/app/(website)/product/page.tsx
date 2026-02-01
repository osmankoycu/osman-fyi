import { client } from '@/lib/sanity.client'
import { projectsByTypeQuery } from '@/lib/sanity.queries'
import { ProjectData } from '@/types'
import { RowRenderer } from '@/components/RowRenderer'
import { ENABLE_PRODUCT_WIDE_PACKING } from '@/lib/layoutConfig'

export const revalidate = 60

export default async function ProductPage() {
    let products: ProjectData[] = []
    try {
        products = await client.fetch<ProjectData[]>(projectsByTypeQuery, { type: 'product' })
    } catch (error) {
        console.warn('Failed to fetch products:', error)
    }

    return (
        <div className="pb-24">
            <div className="flex flex-col space-y-32">
                {products.length > 0 ? (
                    products.map((project) => (
                        <article key={project._id} className="w-full">
                            {/* Project Header - Aligned with Content Container */}
                            <header className="max-w-[1920px] mx-auto w-full px-[10px] md:px-5 lg:px-10 mb-[26px] md:mb-[14px]">
                                {/* Mobile Header Layout */}
                                <div className="md:hidden flex flex-col items-center gap-1">
                                    <div className="text-[20px] font-bold text-black text-center">
                                        {project.title}, {project.year || '2026'}
                                    </div>
                                    <div className="text-[16px] font-semibold text-[#9C9C9C] text-center">
                                        {project.roleLine}
                                    </div>
                                </div>

                                {/* Desktop Header Layout */}
                                <div className="hidden md:grid md:grid-cols-12 items-end gap-0">
                                    {/* Left: Title */}
                                    <h3 className="text-[16px] lg:text-[18px] font-bold text-black text-left order-1 md:col-span-3">
                                        {project.title}
                                    </h3>

                                    {/* Center: Role */}
                                    <div className="text-center text-[#9C9C9C] text-[16px] lg:text-[18px] font-semibold order-2 md:order-2 md:col-span-6">
                                        {project.roleLine}
                                    </div>

                                    {/* Right: Year */}
                                    <div className="text-right text-black text-[16px] lg:text-[18px] font-bold order-3 md:col-span-3">
                                        {project.year || '2026'}
                                    </div>
                                </div>
                            </header>

                            {/* Project Rows - Aligned with Header Container */}
                            <div className="max-w-[1920px] mx-auto w-full px-0 md:px-5 lg:px-10">
                                <RowRenderer rows={project.rows} enableWidePacking={ENABLE_PRODUCT_WIDE_PACKING} />
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="py-12 text-center border-t border-gray-100 max-w-[1920px] mx-auto px-5 md:px-10">
                        <p className="text-gray-500">No products found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
