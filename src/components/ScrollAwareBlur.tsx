'use client'

import { useEffect, useState } from 'react'
import GradualBlur from '@/components/GradualBlur'

export function ScrollAwareBlur() {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            // Threshold for triggering the height change
            const threshold = 100
            if (window.scrollY > threshold) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        // Initial check
        handleScroll()

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <GradualBlur
            preset="page-footer"
            strength={1}
            zIndex={49}
            height={isScrolled ? "10vh" : "4vh"}
            style={{ transition: 'height 0.5s ease-in-out' }}
        />
    )
}
