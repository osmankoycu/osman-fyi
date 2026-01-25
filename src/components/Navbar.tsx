'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlaneAnimation } from '../hooks/usePlaneAnimation'

export function Navbar() {
    const pathname = usePathname()
    const [isStuck, setIsStuck] = useState(false)
    usePlaneAnimation(isStuck)

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY

            // Use functional state update to access the latest state value
            setIsStuck((prevIsStuck) => {
                // Shrink if scrolling down past 750px
                if (!prevIsStuck && currentScroll > 750) {
                    return true
                }
                // Expand if scrolling up past 700px
                if (prevIsStuck && currentScroll < 700) {
                    return false
                }
                // Otherwise keep current state
                return prevIsStuck
            })
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navItems = [
        { label: 'Product', href: '/' },
        { label: 'Experiments', href: '/experiments' },
        { label: 'Photography', href: '/photography' },
        { label: 'Curation', href: '/curation' },
        { label: isStuck ? 'Osman Köycü' : 'About', href: '/about' },
    ]

    const isLight = pathname !== '/photography'
    const isDark = !isLight

    return (
        <nav
            className={clsx(
                'w-full sticky top-0 z-50 flex items-center transition-[height] duration-300 h-[60px] md:h-[80px]',
                isLight ? 'bg-white' : 'bg-black'
            )}
        >
            <div className="container-text flex items-center justify-between w-full h-full">
                {/* Desktop Layout - Equal Spacing between all items */}
                <div className="hidden md:flex w-full items-center justify-between gap-4">
                    {/* Circle Logo */}
                    <div
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex-[0.5] flex justify-start items-center shrink-0"
                    >
                        <div className={clsx("cursor-pointer w-6 h-6 rounded-full shrink-0 border-[5px] bg-transparent flex items-center justify-center", isLight ? "border-black" : "border-white")}>
                            <div className={clsx("w-2 h-2 rounded-full", isLight ? "bg-black" : "bg-white")} />
                        </div>
                    </div>

                    {navItems.map((item) => {
                        const isActive =
                            item.href === '/'
                                ? pathname === '/' || pathname === '/product'
                                : pathname.startsWith(item.href)

                        return (
                            <div
                                key={item.href}
                                className="flex-1 flex justify-center"
                            >
                                <Link
                                    href={item.href}
                                    className={clsx(
                                        'text-center text-[16px] lg:text-[18px] transition-colors duration-200 whitespace-nowrap overflow-hidden relative min-w-[80px]',
                                        isActive
                                            ? (isLight ? 'text-black font-bold' : 'text-white font-bold')
                                            : (isLight ? 'text-black/40 hover:text-black font-semibold' : 'text-[#9c9c9c] hover:text-white font-semibold')
                                    )}
                                >
                                    {item.href === '/about' ? (
                                        <div className="relative flex justify-center items-center h-full">
                                            <AnimatePresence mode="wait" initial={false}>
                                                <motion.span
                                                    key={item.label}
                                                    initial={{ y: 10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -10, opacity: 0 }}
                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                    className="block"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        item.label
                                    )}
                                </Link>
                            </div>
                        )
                    })}

                    {/* Email Icon as part of the list */}
                    <div
                        className="flex-[0.5] flex justify-end items-center shrink-0"
                    >
                        <a
                            id="emailPlane"
                            href="mailto:osmankoycu@gmail.com"
                            className={clsx(
                                "shrink-0 cursor-pointer transition-colors duration-300",
                                isLight ? "text-black hover:text-[#4a4a4a]" : "text-white hover:text-[#9c9c9c]"
                            )}
                            aria-label="Send email"
                        >
                            <svg
                                width="26"
                                height="21"
                                viewBox="0 0 26 21"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="fill-current"
                            >
                                <path d="M5.9834 8.08887H11.3867C11.6374 8.08887 11.8522 7.99219 12.0312 7.79883C12.2103 7.60547 12.2998 7.39062 12.2998 7.1543C12.2998 6.88932 12.2103 6.66732 12.0312 6.48828C11.8594 6.30208 11.6445 6.20898 11.3867 6.20898H5.9834C5.72559 6.20898 5.51074 6.30208 5.33887 6.48828C5.16699 6.67448 5.08105 6.89648 5.08105 7.1543C5.08105 7.39062 5.16699 7.60547 5.33887 7.79883C5.5179 7.99219 5.73275 8.08887 5.9834 8.08887ZM5.9834 10.8926H9.77539C10.026 10.8926 10.2409 10.8031 10.4199 10.624C10.599 10.4378 10.6885 10.2194 10.6885 9.96875C10.6885 9.71094 10.599 9.48893 10.4199 9.30273C10.248 9.11654 10.0332 9.02344 9.77539 9.02344H5.9834C5.72559 9.02344 5.51074 9.11654 5.33887 9.30273C5.16699 9.48893 5.08105 9.71094 5.08105 9.96875C5.08105 10.2194 5.16699 10.4378 5.33887 10.624C5.5179 10.8031 5.73275 10.8926 5.9834 10.8926ZM18.0684 10.9893C18.5625 10.9893 19.0065 10.8711 19.4004 10.6348C19.8014 10.3913 20.1201 10.069 20.3564 9.66797C20.5999 9.26693 20.7217 8.81934 20.7217 8.3252C20.7217 7.83105 20.5999 7.38346 20.3564 6.98242C20.1201 6.57422 19.8014 6.25195 19.4004 6.01562C19.0065 5.7793 18.5625 5.66113 18.0684 5.66113C17.5814 5.66113 17.1338 5.7793 16.7256 6.01562C16.3245 6.25195 16.0059 6.57422 15.7695 6.98242C15.5332 7.38346 15.415 7.83105 15.415 8.3252C15.415 8.81934 15.5332 9.26693 15.7695 9.66797C16.0059 10.069 16.3245 10.3913 16.7256 10.6348C17.1338 10.8711 17.5814 10.9893 18.0684 10.9893ZM4.01758 20.9473C2.73568 20.9473 1.74382 20.5964 1.04199 19.8945C0.347331 19.1999 0 18.2188 0 16.9512V4.00684C0 2.72493 0.347331 1.73665 1.04199 1.04199C1.74382 0.347331 2.73568 0 4.01758 0H21.7959C23.0706 0 24.0553 0.350911 24.75 1.05273C25.4518 1.7474 25.8027 2.7321 25.8027 4.00684V16.9512C25.8027 18.2188 25.4518 19.1999 24.75 19.8945C24.0553 20.5964 23.0706 20.9473 21.7959 20.9473H4.01758Z" fill="currentColor" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Mobile Layout (Scrollable with all items) */}
                <div className="md:hidden flex items-center w-full h-full">
                    <div className="flex items-center justify-between w-full overflow-x-auto no-scrollbar gap-6">
                        {/* Circle Logo on Mobile */}
                        <div
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="flex-[0.5] flex justify-start items-center shrink-0"
                        >
                            <div className={clsx("cursor-pointer w-5 h-5 rounded-full shrink-0 border-[4px] bg-transparent flex items-center justify-center", isLight ? "border-black" : "border-white")}>
                                <div className={clsx("w-1.5 h-1.5 rounded-full", isLight ? "bg-black" : "bg-white")} />
                            </div>
                        </div>

                        {navItems.map((item) => {
                            const isActive =
                                item.href === '/'
                                    ? pathname === '/' || pathname === '/product'
                                    : pathname.startsWith(item.href)

                            return (
                                <div
                                    key={item.href}
                                    className="flex-1 flex justify-center shrink-0"
                                >
                                    <Link
                                        href={item.href}
                                        className={clsx(
                                            'transition-all duration-200 text-[16px] whitespace-nowrap overflow-hidden relative min-w-[80px] text-center block',
                                            isActive
                                                ? (isLight ? 'text-black font-bold' : 'text-white font-bold')
                                                : (isLight ? 'text-black/40 font-semibold' : 'text-[#9c9c9c] font-semibold')
                                        )}
                                    >
                                        {item.href === '/about' ? (
                                            <div className="relative flex justify-center items-center h-full">
                                                <AnimatePresence mode="wait" initial={false}>
                                                    <motion.span
                                                        key={item.label}
                                                        initial={{ y: 10, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        exit={{ y: -10, opacity: 0 }}
                                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                                        className="block"
                                                    >
                                                        {item.label}
                                                    </motion.span>
                                                </AnimatePresence>
                                            </div>
                                        ) : (
                                            item.label
                                        )}
                                    </Link>
                                </div>
                            )
                        })}

                        {/* Mobile Email Icon - Inside the scrollable area */}
                        <div
                            className="flex-[0.5] flex justify-end items-center shrink-0"
                        >
                            <a
                                href="mailto:osmankoycu@gmail.com"
                                className={clsx(
                                    "shrink-0 cursor-pointer transition-colors duration-300",
                                    isLight ? "text-black" : "text-white"
                                )}
                                aria-label="Send email"
                            >
                                <svg width="22" height="18" viewBox="0 0 26 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-current">
                                    <path d="M5.9834 8.08887H11.3867C11.6374 8.08887 11.8522 7.99219 12.0312 7.79883C12.2103 7.60547 12.2998 7.39062 12.2998 7.1543C12.2998 6.88932 12.2103 6.66732 12.0312 6.48828C11.8594 6.30208 11.6445 6.20898 11.3867 6.20898H5.9834C5.72559 6.20898 5.51074 6.30208 5.33887 6.48828C5.16699 6.67448 5.08105 6.89648 5.08105 7.1543C5.08105 7.39062 5.16699 7.60547 5.33887 7.79883C5.5179 7.99219 5.73275 8.08887 5.9834 8.08887ZM5.9834 10.8926H9.77539C10.026 10.8926 10.2409 10.8031 10.4199 10.624C10.599 10.4378 10.6885 10.2194 10.6885 9.96875C10.6885 9.71094 10.599 9.48893 10.4199 9.30273C10.248 9.11654 10.0332 9.02344 9.77539 9.02344H5.9834C5.72559 9.02344 5.51074 9.11654 5.33887 9.30273C5.16699 9.48893 5.08105 9.71094 5.08105 9.96875C5.08105 10.2194 5.16699 10.4378 5.33887 10.624C5.5179 10.8031 5.73275 10.8926 5.9834 10.8926ZM18.0684 10.9893C18.5625 10.9893 19.0065 10.8711 19.4004 10.6348C19.8014 10.3913 20.1201 10.069 20.3564 9.66797C20.5999 9.26693 20.7217 8.81934 20.7217 8.3252C20.7217 7.83105 20.5999 7.38346 20.3564 6.98242C20.1201 6.57422 19.8014 6.25195 19.4004 6.01562C19.0065 5.7793 18.5625 5.66113 18.0684 5.66113C17.5814 5.66113 17.1338 5.7793 16.7256 6.01562C16.3245 6.25195 16.0059 6.57422 15.7695 6.98242C15.5332 7.38346 15.415 7.83105 15.415 8.3252C15.415 8.81934 15.5332 9.26693 15.7695 9.66797C16.0059 10.069 16.3245 10.3913 16.7256 10.6348C17.1338 10.8711 17.5814 10.9893 18.0684 10.9893ZM4.01758 20.9473C2.73568 20.9473 1.74382 20.5964 1.04199 19.8945C0.347331 19.1999 0 18.2188 0 16.9512V4.00684C0 2.72493 0.347331 1.73665 1.04199 1.04199C1.74382 0.347331 2.73568 0 4.01758 0H21.7959C23.0706 0 24.0553 0.350911 24.75 1.05273C25.4518 1.7474 25.8027 2.7321 25.8027 4.00684V16.9512C25.8027 18.2188 25.4518 19.1999 24.75 19.8945C24.0553 20.5964 23.0706 20.9473 21.7959 20.9473H4.01758Z" fill="currentColor" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
