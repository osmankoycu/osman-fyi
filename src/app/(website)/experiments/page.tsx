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
                            <header className="container-text mb-12">
                                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-4">
                                    <h3 className="text-3xl md:text-5xl font-bold tracking-tight">
                                        {project.title}
                                    </h3>
                                    <span className="text-base font-medium text-gray-500 mt-2 md:mt-0">
                                        {project.year || '2024'}
                                    </span>
                                </div>
                                <div className="text-lg font-medium text-gray-400">
                                    {project.roleLine}
                                </div>
                            </header>

                            {/* Inline Project Rows - Image Container (1200px) */}
                            <div className="container-custom w-full">
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
