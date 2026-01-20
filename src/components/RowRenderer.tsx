'use client'

import { RowData } from '@/types'
import { ImageCard } from './ImageCard'
import { TextCard } from './TextCard'
import { clsx } from 'clsx'

interface RowRendererProps {
    rows?: RowData[]
}

export function RowRenderer({ rows }: RowRendererProps) {
    if (!rows || rows.length === 0) return null

    return (
        <div className="flex flex-col space-y-[20px] w-full">
            {rows.map((row) => {
                // Validate items length before rendering to avoid index errors
                if (row.layout === 'full' && row.items?.length !== 1) return null
                if (row.layout === 'two' && row.items?.length !== 2) return null

                return (
                    <section
                        key={row._key}
                        className="w-full"
                        style={{ backgroundColor: row.backgroundColor }}
                    >
                        {row.layout === 'full' && (
                            <div className="w-full">
                                {row.items.map((item, idx) => (
                                    <div key={idx}>
                                        {item._type === 'imageCard' && <ImageCard {...item} />}
                                        {item._type === 'textCard' && <TextCard {...item} />}
                                    </div>
                                ))}
                            </div>
                        )}

                        {row.layout === 'two' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                                {row.items.map((item, idx) => (
                                    <div key={idx} className="w-full">
                                        {item._type === 'imageCard' && <ImageCard {...item} />}
                                        {item._type === 'textCard' && <TextCard {...item} />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )
            })}
        </div>
    )
}
