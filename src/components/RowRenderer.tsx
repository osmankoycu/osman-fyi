'use client'

import { RowData } from '@/types'
import { ImageCard } from './ImageCard'
import { TextCard } from './TextCard'
import { clsx } from 'clsx'

import { motion } from 'framer-motion'

interface RowRendererProps {
    rows?: RowData[]
}

export function RowRenderer({ rows }: RowRendererProps) {
    if (!rows || rows.length === 0) return null

    return (
        <div className="flex flex-col space-y-[10px] md:space-y-[20px] w-full px-[10px] md:px-0">
            {rows.map((row, index) => {
                // Validate items length before rendering to avoid index errors
                if (row.layout === 'full' && row.items?.length !== 1) return null
                if (row.layout === 'two' && row.items?.length !== 2) return null

                const isFirstRow = index === 0

                return (
                    <motion.section
                        key={row._key}
                        className="w-full"
                        style={{ backgroundColor: row.backgroundColor }}
                        initial={{ opacity: isFirstRow ? 1 : 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] md:gap-5 items-start">
                                {row.items.map((item, idx) => (
                                    <div key={idx} className="w-full">
                                        {item._type === 'imageCard' && <ImageCard {...item} mobileHeightClass="h-[500px]" />}
                                        {item._type === 'textCard' && <TextCard {...item} className="min-h-[500px]" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.section>
                )
            })}
        </div>
    )
}
