'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { CurationItemData, CurationCategoryData } from '@/types'
import { CurationGrid } from './CurationGrid'

interface CurationContainerProps {
    items: CurationItemData[]
    categories: CurationCategoryData[]
}

export function CurationContainer({ items, categories }: CurationContainerProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all')

    // Create a list including "All" at the start
    const filterCategories = [
        { title: 'All', slug: { current: 'all' } },
        ...categories
    ]

    const filteredItems = selectedCategory === 'all'
        ? items
        : items.filter(item => item.category?.slug.current === selectedCategory)

    return (
        <div className="w-full flex flex-col">
            {/* Filter Menu */}
            <div className="w-full mb-[26px] md:mb-[14px]">
                <div className="flex flex-wrap items-center justify-between gap-y-3 w-full">
                    {filterCategories.map((category) => {
                        const isActive = selectedCategory === category.slug.current

                        return (
                            <button
                                key={category.slug.current}
                                onClick={() => setSelectedCategory(category.slug.current)}
                                className={clsx(
                                    'text-[16px] lg:text-[18px] transition-colors duration-200 whitespace-nowrap relative cursor-pointer',
                                    isActive
                                        ? 'text-black font-bold'
                                        : 'text-black/40 hover:text-black font-semibold'
                                )}
                            >
                                {isActive ? (
                                    <div className="relative flex items-center justify-center h-full">
                                        <AnimatePresence mode="wait" initial={false}>
                                            <motion.span
                                                key={category.title}
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -10, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="block"
                                            >
                                                {category.title}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    category.title
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedCategory}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                >
                    {filteredItems.length > 0 ? (
                        <CurationGrid items={filteredItems} />
                    ) : (
                        <div className="py-12 text-center border-t border-gray-100">
                            <p className="text-gray-500">No items found in this category.</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
