'use client'

import Link from 'next/link'
import { ProjectData } from '@/types'
import { clsx } from 'clsx'

interface ProjectListCardProps {
    project: ProjectData
}

export function ProjectListCard({ project }: ProjectListCardProps) {
    return (
        <Link
            href={`/project/${project.slug.current}`}
            className="group block relative border-t border-gray-200 py-6 md:py-8 transition-colors hover:bg-gray-50/50"
        >
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 md:gap-4">
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-black group-hover:text-gray-600 transition-colors">
                    {project.title}
                </h3>

                <div className="flex items-center gap-4 text-gray-500 text-sm md:text-base font-medium">
                    {project.roleLine && <span>{project.roleLine}</span>}
                    {project.year && <span>{project.year}</span>}
                </div>
            </div>
        </Link>
    )
}
