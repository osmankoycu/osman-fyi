import { client } from '@/lib/sanity.client'
import { projectsByTypeQuery } from '@/lib/sanity.queries'
import { ProjectData } from '@/types'
import { RowRenderer } from '@/components/RowRenderer'

export const revalidate = 60

export default async function ExperimentsPage() {
    let experiments: ProjectData[] = []
    try {
        experiments = await client.fetch<ProjectData[]>(projectsByTypeQuery, { type: 'experiment' })
    } catch (error) {
        console.warn('Failed to fetch experiments:', error)
    }

    return (
        <div className="pb-24">
            <div className="flex flex-col space-y-32">
                {experiments.length > 0 ? (
                    experiments.map((project) => (
                        <article key={project._id} className="w-full">
                            {/* Project Header - Text Container (1100px) */}
                            {/* Project Header - Aligned with Content Container */}
                            <header className="max-w-[1920px] mx-auto w-full px-[10px] md:px-5 lg:px-10 mb-[26px] md:mb-[14px]">
                                <div className="grid grid-cols-1 md:grid-cols-12 items-end gap-0">
                                    {/* Left: Title */}
                                    <h3 className="text-[16px] lg:text-[clamp(18px,1.15vw,22px)] font-semibold text-black text-center md:text-left order-1 md:col-span-3">
                                        {project.title}
                                    </h3>

                                    {/* Center: Role */}
                                    <div className="text-center text-[#9C9C9C] text-[16px] lg:text-[clamp(18px,1.15vw,22px)] font-semibold order-2 md:order-2 md:col-span-6">
                                        {project.roleLine}
                                    </div>

                                    {/* Right: Year */}
                                    <div className="text-center md:text-right text-black text-[16px] lg:text-[clamp(18px,1.15vw,22px)] font-semibold order-3 md:col-span-3">
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
                    <div className="py-12 text-center border-t border-gray-100">
                        <p className="text-gray-500">No experiments found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
