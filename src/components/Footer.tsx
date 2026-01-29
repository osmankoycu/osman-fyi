'use client'

import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

export function Footer() {
    const pathname = usePathname()
    const isDark = pathname === '/photography'

    return (
        <footer className="w-full mt-8 md:mt-16 pb-[12vh]">
            <div className="container-text flex justify-center text-center">
                <div className={clsx(
                    "text-[20px] md:text-[18px] font-bold",
                    isDark ? "text-white" : "text-black"
                )}>
                    Osman Köycü, Copyright © 2026
                </div>
            </div>
        </footer>
    )
}
