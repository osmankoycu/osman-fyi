import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity.client'
import { projectBySlugQuery } from '@/lib/sanity.queries'
import { ProjectData } from '@/types'
import { RowRenderer } from '@/components/RowRenderer'

export const revalidate = 60

type Props = {
    params: Promise<{ slug: string }>
}

export default async function ProjectPage({ params }: Props) {
    const { slug } = await params
    let project: ProjectData | null = null
    try {
        project = await client.fetch<ProjectData>(projectBySlugQuery, { slug })
    } catch (error) {
        console.warn('Failed to fetch project:', error)
    }

    if (!project) {
        notFound()
    }

    return (
        <div className="container-custom pt-8 md:pt-16 pb-24">
            <header className="mb-16 max-w-4xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                    {project.title}
                </h1>
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-lg font-medium text-gray-500">
                    {project.roleLine && (
                        <div className="flex items-center gap-2">
                            <span className="text-black">Role —</span>
                            <span>{project.roleLine}</span>
                        </div>
                    )}
                    {project.year && (
                        <div className="flex items-center gap-2">
                            <span className="text-black">Year —</span>
                            <span>{project.year}</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="w-full">
                <RowRenderer rows={project.rows} />
            </div>
        </div>
    )
}
