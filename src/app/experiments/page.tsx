import { client } from '@/lib/sanity.client'
import { projectsByTypeQuery } from '@/lib/sanity.queries'
import { ProjectData } from '@/types'
import { ProjectListCard } from '@/components/ProjectListCard'

export const revalidate = 60

export default async function ExperimentsPage() {
    let experiments: ProjectData[] = []
    try {
        experiments = await client.fetch<ProjectData[]>(projectsByTypeQuery, { type: 'experiment' })
    } catch (error) {
        console.warn('Failed to fetch experiments:', error)
    }

    return (
        <div className="container-custom pt-8 md:pt-16 pb-24">
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Experiments</h1>
                <p className="text-gray-500 text-lg">Playful explorations and prototypes.</p>
            </div>

            <div className="flex flex-col">
                {experiments.length > 0 ? (
                    experiments.map((project) => (
                        <ProjectListCard key={project._id} project={project} />
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
