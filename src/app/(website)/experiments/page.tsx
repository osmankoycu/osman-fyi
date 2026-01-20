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
        <div className="container-custom pb-24">
            <div className="flex flex-col space-y-32">
                {experiments.length > 0 ? (
                    experiments.map((project) => (
                        <article key={project._id} className="w-full">
                            <header className="mb-12 max-w-2xl">
                                <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                                    {project.title}
                                </h3>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-base md:text-lg font-medium text-gray-500">
                                    {project.roleLine && <span>{project.roleLine}</span>}
                                    {project.year && <span>{project.year}</span>}
                                </div>
                            </header>

                            <div className="w-full">
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
