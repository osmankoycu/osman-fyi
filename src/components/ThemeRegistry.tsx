'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function ThemeRegistry() {
    const pathname = usePathname()

    useEffect(() => {
        if (pathname === '/photography') {
            document.body.classList.add('bg-black', 'text-white')
            document.body.classList.remove('bg-white', 'text-black')
        } else {
            document.body.classList.add('bg-white', 'text-black')
            document.body.classList.remove('bg-black', 'text-white')
        }
    }, [pathname])

    return null
}
