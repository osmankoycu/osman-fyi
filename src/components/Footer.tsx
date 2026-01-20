'use client'

import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

export function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const pathname = usePathname()
    const isDark = pathname === '/photography'

    return (
        <footer className="w-full mt-32 pb-10">
            <div className={clsx("separator mb-10", isDark ? "!bg-[#1F1F1F]" : "bg-gray-200")} />
            <div className="container-text flex items-center justify-between">
                <div className={clsx(
                    "text-[22px] font-bold",
                    isDark ? "text-white" : "text-black"
                )}>
                    Osman Köycü, Copyright © 2026
                </div>
                <button
                    onClick={scrollToTop}
                    className={clsx(
                        "p-2 rounded-full transition-colors duration-300 cursor-pointer",
                        isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
                    )}
                    aria-label="Back to top"
                >
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 19V5" />
                        <path d="M5 12l7-7 7 7" />
                    </svg>
                </button>
            </div>
        </footer>
    )
}
