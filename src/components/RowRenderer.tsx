'use client'

import { RowData, RowItem } from '@/types'
import { ImageCard } from './ImageCard'
import { TextCard } from './TextCard'
import { clsx } from 'clsx'
import React, { useState, useEffect, useMemo } from 'react'

import { motion } from 'framer-motion'

interface RowRendererProps {
    rows?: RowData[]
}

// ...
export function RowRenderer({ rows }: RowRendererProps) {
    const [isWide, setIsWide] = useState(false)

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

    return (
        <div className="flex flex-col space-y-[2px] w-full px-[10px] md:px-0">
            {displayedRows.map((row) => {
                if ('_type' in row && row._type === 'packed-pair') {
                    // Render Packed Pair
                    return (
                        <React.Fragment key={row._key}>
                            {/* Row A: Large - Small */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 1.2, ease: "easeInOut" }}
                                className="grid grid-cols-1 min-[1440px]:grid-cols-[2fr_1fr] gap-[2px] w-full"
                            >
                                <div className="w-full relative aspect-video">
                                    <ItemRenderer item={row.rowA.primary} className="absolute inset-0 w-full h-full" fillContainer />
                                </div>
                                <div className="w-full relative min-[1440px]:aspect-auto aspect-video">
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
                                <div className="w-full relative min-[1440px]:aspect-auto aspect-video">
                                    <ItemRenderer item={row.rowB.primary} className="absolute inset-0 w-full h-full" fillContainer />
                                </div>
                                <div className="w-full relative aspect-video">
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
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                    >
                        {standardRow.layout === 'full' && (
                            <div className="w-full aspect-video relative">
                                <ItemRenderer item={standardRow.items[0]} className="absolute inset-0 w-full h-full" />
                            </div>
                        )}

                        {standardRow.layout === 'two' && (
                            <div
                                className="grid grid-cols-1 md:grid-cols-2 gap-[2px] items-stretch md:aspect-video"
                                style={{ aspectRatio: isWide ? '2.66' : undefined }}
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
