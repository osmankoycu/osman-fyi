'use client'

import { RowData, RowItem } from '@/types'
import { ImageCard } from './ImageCard'
import { TextCard } from './TextCard'
import { clsx } from 'clsx'
import React, { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'

import { motion } from 'framer-motion'

interface RowRendererProps {
    rows?: RowData[]
}

// ...
export function RowRenderer({ rows }: RowRendererProps) {
    const [isWide, setIsWide] = useState(false)
    const pathname = usePathname()
    const isPhotography = pathname === '/photography'

    useEffect(() => {
        const checkWidth = () => {
            setIsWide(window.innerWidth >= 1440)
        }
        checkWidth()
        window.addEventListener('resize', checkWidth)
        return () => window.removeEventListener('resize', checkWidth)
    }, [])



    if (!rows || rows.length === 0) return null

    // packing logic
    const displayedRows = useMemo(() => {
        if (!isWide) return rows

        const packed: (RowData | PackedRowPair)[] = []
        let i = 0
        while (i < rows.length) {
            const current = rows[i]
            const next = rows[i + 1]
            const afterNext = rows[i + 2]

            // Check for S - D - S pattern
            if (
                current.layout === 'full' &&
                next?.layout === 'two' &&
                afterNext?.layout === 'full' &&
                current.items?.length === 1 &&
                next.items?.length === 2 &&
                afterNext.items?.length === 1
            ) {
                // Create packed pair
                packed.push({
                    _type: 'packed-pair',
                    _key: `packed-${current._key}-${next._key}-${afterNext._key}`,
                    rowA: {
                        primary: current.items[0], // Single (Large)
                        secondary: next.items[0],  // Double (Small)
                        layout: 'large-small',
                        _key: `${current._key}-a`
                    },
                    rowB: {
                        primary: next.items[1],    // Double (Small)
                        secondary: afterNext.items[0], // Single (Large)
                        layout: 'small-large',
                        _key: `${current._key}-b`
                    }
                })
                i += 3 // Skip 3 consumed rows
            } else {
                packed.push(current)
                i += 1
            }
        }
        return packed
    }, [rows, isWide])

    const aspectClass = isPhotography ? 'aspect-[3/2]' : 'aspect-video'
    const wideTotalRatio = isPhotography ? '2.25' : '2.66'

    return (
        <div className="flex flex-col space-y-[2px] w-full px-[10px] md:px-0">
            {displayedRows.map((row, index) => {
                const isFirst = index === 0
                const animationProps: any = isFirst ? {} : {
                    initial: { opacity: 0 },
                    whileInView: { opacity: 1 },
                    viewport: { once: true, amount: 0.3 },
                    transition: { duration: 1.2, ease: "easeInOut" }
                }

                if ('_type' in row && row._type === 'packed-pair') {
                    // Render Packed Pair
                    return (
                        <React.Fragment key={row._key}>
                            {/* Row A: Large - Small */}
                            <motion.div
                                {...animationProps}
                                className="grid grid-cols-1 min-[1440px]:grid-cols-[2fr_1fr] gap-[2px] w-full"
                            >
                                <div className={clsx("w-full relative", aspectClass)}>
                                    <ItemRenderer item={row.rowA.primary} className="absolute inset-0 w-full h-full" fillContainer />
                                </div>
                                <div className={clsx("w-full relative min-[1440px]:aspect-auto", aspectClass)}>
                                    {/* Double item matches height of sibling in grid, but needs object-cover */}
                                    <ItemRenderer item={row.rowA.secondary} className="absolute inset-0 w-full h-full" fillContainer />
                                </div>
                            </motion.div>

                            {/* Row B: Small - Large */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 1.2, ease: "easeInOut" }}
                                className="grid grid-cols-1 min-[1440px]:grid-cols-[1fr_2fr] gap-[2px] w-full"
                            >
                                <div className={clsx("w-full relative min-[1440px]:aspect-auto", aspectClass)}>
                                    <ItemRenderer item={row.rowB.primary} className="absolute inset-0 w-full h-full" fillContainer />
                                </div>
                                <div className={clsx("w-full relative", aspectClass)}>
                                    <ItemRenderer item={row.rowB.secondary} className="absolute inset-0 w-full h-full" fillContainer />
                                </div>
                            </motion.div>
                        </React.Fragment>
                    )
                }

                // Render Standard Row (RowData)
                const standardRow = row as RowData
                // ... validation ...
                if (standardRow.layout === 'full' && standardRow.items?.length !== 1) return null
                if (standardRow.layout === 'two' && standardRow.items?.length !== 2) return null

                return (
                    <motion.section
                        key={standardRow._key}
                        className="w-full"
                        style={{ backgroundColor: standardRow.backgroundColor }}
                        {...animationProps}
                    >
                        {standardRow.layout === 'full' && (
                            <div className={clsx("w-full relative", aspectClass)}>
                                <ItemRenderer item={standardRow.items[0]} className="absolute inset-0 w-full h-full" />
                            </div>
                        )}

                        {standardRow.layout === 'two' && (
                            <div
                                className={clsx("grid grid-cols-1 md:grid-cols-2 gap-[2px] items-stretch", isPhotography ? "md:aspect-[3/2]" : "md:aspect-video")}
                                style={{ aspectRatio: isWide ? wideTotalRatio : undefined }}
                            >
                                {standardRow.items.map((item, idx) => (
                                    <div key={idx} className="w-full aspect-square md:aspect-auto md:h-full relative">
                                        {/* Aspect ratio control might be needed here or handled by ItemRenderer content */}
                                        <ItemRenderer
                                            item={item}
                                            className="w-full h-full object-cover absolute inset-0"
                                            fillContainer
                                            objectFit={isWide ? 'contain' : undefined}
                                        />
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

// Helper Types & Component
interface PackedRowPair {
    _type: 'packed-pair'
    _key: string
    rowA: { primary: RowItem; secondary: RowItem; layout: 'large-small'; _key: string }
    rowB: { primary: RowItem; secondary: RowItem; layout: 'small-large'; _key: string }
}

function ItemRenderer({ item, className, fillContainer, objectFit }: { item: RowItem, className?: string, fillContainer?: boolean, objectFit?: 'cover' | 'contain' }) {
    if (item._type === 'imageCard') return <ImageCard {...item} className={className} fillContainer={fillContainer} objectFit={objectFit} />
    if (item._type === 'textCard') return <TextCard {...item} className={className} />
    return null
}
