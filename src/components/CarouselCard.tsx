'use client'

import { useState } from 'react'
import Image from 'next/image'
import { sanityLoader } from '@/lib/sanity.client'
import { CarouselCardData } from '@/types'
import { clsx } from 'clsx'
import { motion, AnimatePresence, wrap } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselCardProps extends CarouselCardData {
    className?: string
    fillContainer?: boolean
    objectFit?: 'cover' | 'contain'
    sizes?: string
}

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
    }),
    center: {
        zIndex: 1,
        x: 0,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? '100%' : '-100%',
    }),
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
}

export function CarouselCard({ images, backgroundColor, className, fillContainer, objectFit = 'cover', sizes }: CarouselCardProps) {
    const [[page, direction], setPage] = useState([0, 0])
    const [isHovered, setIsHovered] = useState(false)

    if (!images || images.length === 0) return null

    // We use wrap so we can support infinite pagination
    const imageIndex = wrap(0, images.length, page)

    const paginate = (newDirection: number) => {
        setPage([page + newDirection, newDirection])
    }

    const currentImage = images[imageIndex]
    const currentAssetRef = currentImage?.asset?._ref || currentImage?.asset?._id

    // Determine color theme based on background
    const isWhiteBg = backgroundColor === 'white' || backgroundColor?.toLowerCase() === '#ffffff'
    // Lighter touches for white background
    const buttonBgClass = isWhiteBg ? "bg-black/5 hover:bg-black/10" : "bg-white/10 hover:bg-white/20"
    const arrowColorClass = isWhiteBg ? "text-black/30" : "text-white"
    const dotActiveBg = isWhiteBg ? "bg-black/30" : "bg-white"
    const dotInactiveBg = isWhiteBg ? "bg-black/10 hover:bg-black/30" : "bg-white/40 hover:bg-white/60"

    return (
        <div
            className={clsx('relative overflow-hidden rounded-lg w-full h-full group', className)}
            style={{ backgroundColor: backgroundColor || '#f3f4f6' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0 w-full h-full">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "tween", duration: 0.4, ease: "easeOut" }
                        }}
                        style={{ willChange: "transform" }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x)

                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(1)
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(-1)
                            }
                        }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {currentAssetRef && (
                            <Image
                                loader={sanityLoader}
                                src={currentAssetRef}
                                alt={currentImage.alt || 'Carousel Image'}
                                fill
                                draggable={false}
                                className={clsx('w-full h-full', objectFit === 'contain' ? 'object-contain' : 'object-cover')}
                                sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Arrows - Only show if more than 1 image */}
            {images.length > 1 && (
                <>
                    {/* Desktop Arrows (Hidden on Mobile) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            paginate(-1)
                        }}
                        className={clsx(
                            "absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full backdrop-blur-md hidden md:flex items-center justify-center transition-opacity duration-300 cursor-pointer",
                            buttonBgClass,
                            arrowColorClass,
                            isHovered ? "opacity-100" : "opacity-0"
                        )}
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            paginate(1)
                        }}
                        className={clsx(
                            "absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full backdrop-blur-md hidden md:flex items-center justify-center transition-opacity duration-300 cursor-pointer",
                            buttonBgClass,
                            arrowColorClass,
                            isHovered ? "opacity-100" : "opacity-0"
                        )}
                        aria-label="Next image"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const direction = idx > imageIndex ? 1 : -1;
                                    setPage([page + (idx - imageIndex), direction]);
                                }}
                                className={clsx(
                                    "w-2 h-2 rounded-full transition-all duration-300 cursor-pointer",
                                    idx === imageIndex ? `${dotActiveBg} scale-125` : dotInactiveBg
                                )}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {isWhiteBg && (
                <div className="absolute inset-0 border border-black/10 mix-blend-multiply pointer-events-none rounded-lg z-20" />
            )}
        </div>
    )
}
