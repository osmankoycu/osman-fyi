'use client'

import Image from 'next/image'
import { CurationItemData } from '@/types'
import { urlFor, sanityLoader } from '@/lib/sanity.client'

interface CurationGridProps {
    items: CurationItemData[]
}

export function CurationGrid({ items }: CurationGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px]">
            {items.map((item) => (
                <a
                    key={item._id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col space-y-3"
                >
                    <div className="relative aspect-square overflow-hidden rounded-[4px] bg-gray-100 transition-all duration-300">
                        {item.image && (
                            <Image
                                loader={sanityLoader}
                                src={item.image.asset._ref}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                            />
                        )}
                    </div>
                    <h3 className="text-[16px] font-semibold text-black text-center">
                        {item.title}
                    </h3>
                </a>
            ))}
        </div>
    )
}
