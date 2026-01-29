'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlaneAnimation } from '../hooks/usePlaneAnimation'
import { useParticleMorph } from '../contexts/ParticleMorphContext'
import { MorphTarget } from './ParticleMorph'

export function Navbar() {
    const pathname = usePathname()
    const [isStuck, setIsStuck] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { setCurrentTarget } = useParticleMorph()
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

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isMobileMenuOpen])

    const navItems = [
        { label: 'Product', href: '/', morphTarget: 'cube' as MorphTarget },
        { label: 'Experiments', href: '/experiments', morphTarget: 'flask' as MorphTarget },
        { label: 'Photography', href: '/photography', morphTarget: 'camera' as MorphTarget },
        { label: 'Collection', href: '/curation', morphTarget: 'palette' as MorphTarget },
        { label: isStuck ? 'Osman Köycü' : 'About Me', href: '/about', morphTarget: 'plane' as MorphTarget },
        { label: 'Email', href: 'mailto:osmankoycu@gmail.com', morphTarget: 'default' as MorphTarget },
    ]

    // Handle hover events for particle morph
    const handleNavHover = (morphTarget: MorphTarget) => {
        setCurrentTarget(morphTarget)
    }

    const handleNavLeave = () => {
        setCurrentTarget('default')
    }

    const isLight = pathname !== '/photography'
    const isDark = !isLight

    return (
        <nav
            className={clsx(
                'w-full sticky top-0 z-50 flex items-center transition-[height] duration-300',
                isStuck ? 'h-[40px] md:h-[60px]' : 'h-[60px] md:h-[80px]',
                isLight ? 'bg-white' : 'bg-black'
            )}
        >
            <div className="container-text flex items-center justify-between w-full h-full">
                {/* Desktop Layout - Equal Spacing between all items */}
                <div className="hidden md:flex w-full items-center justify-between gap-4">
                    {navItems.map((item, index) => {
                        const isActive =
                            item.href === '/'
                                ? pathname === '/' || pathname === '/product'
                                : pathname.startsWith(item.href)

                        const isEmail = item.href.startsWith('mailto:')
                        const isFirst = index === 0
                        const isLast = index === navItems.length - 1

                        return (
                            <div
                                key={item.href}
                                className={clsx(
                                    "shrink-0",
                                    isFirst ? "text-left" : isLast ? "text-right" : "text-center"
                                )}
                            >
                                {isEmail ? (
                                    <a
                                        href={item.href}
                                        onMouseEnter={() => handleNavHover(item.morphTarget)}
                                        onMouseLeave={handleNavLeave}
                                        className={clsx(
                                            'text-[16px] lg:text-[18px] transition-colors duration-200 whitespace-nowrap overflow-hidden relative min-w-[80px] block',
                                            isFirst ? "text-left" : isLast ? "text-right" : "text-center",
                                            isLight ? 'text-black/40 hover:text-black font-semibold' : 'text-[#9c9c9c] hover:text-white font-semibold'
                                        )}
                                    >
                                        {item.label}
                                    </a>
                                ) : (
                                    <Link
                                        href={item.href}
                                        onMouseEnter={() => handleNavHover(item.morphTarget)}
                                        onMouseLeave={handleNavLeave}
                                        className={clsx(
                                            'text-[16px] lg:text-[18px] transition-colors duration-200 whitespace-nowrap overflow-hidden relative block',
                                            isFirst ? "text-left" : isLast ? "text-right" : "text-center",
                                            item.href === '/about' ? 'w-[116px]' : 'min-w-[80px]',
                                            isActive
                                                ? (isLight ? 'text-black font-bold' : 'text-white font-bold')
                                                : (isLight ? 'text-black/40 hover:text-black font-semibold' : 'text-[#9c9c9c] hover:text-white font-semibold')
                                        )}
                                    >
                                        {item.href === '/about' ? (
                                            <div className={clsx(
                                                "relative flex items-center h-full",
                                                isFirst ? "justify-start" : isLast ? "justify-end" : "justify-center"
                                            )}>
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
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Mobile Layout (Active Item + Dropdown) */}
                <div className="md:hidden flex items-center justify-center w-full h-full relative">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={clsx(
                            "flex items-center gap-2 text-[20px] font-bold transition-colors duration-200",
                            isLight ? "text-black" : "text-white"
                        )}
                    >
                        <span>
                            {navItems.find(item =>
                                item.href === '/'
                                    ? pathname === '/' || pathname === '/product'
                                    : pathname.startsWith(item.href)
                            )?.label || (pathname === '/about' ? (isStuck ? 'Osman Köycü' : 'About Me') : 'Product')}
                        </span>
                        <motion.svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="fill-current"
                        >
                            <path d="M5 8L1 3H9L5 8Z" fill="currentColor" />
                        </motion.svg>
                    </button>

                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className={clsx(
                                    "fixed left-0 right-0 bottom-0 flex flex-col items-center pt-8 gap-6 z-40",
                                    isLight ? "bg-white" : "bg-black"
                                )}
                                style={{ top: isStuck ? '40px' : '60px' }}
                            >
                                {/* Re-centering locally since we might be off due to container padding */}
                                <div className="flex flex-col items-center gap-6 w-full">
                                    {navItems.filter(item => {
                                        const isActive = item.href === '/'
                                            ? pathname === '/' || pathname === '/product'
                                            : pathname.startsWith(item.href);
                                        return !isActive;
                                    }).map((item) => {
                                        const isEmail = item.href.startsWith('mailto:')

                                        return (
                                            <div key={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                                                {isEmail ? (
                                                    <a
                                                        href={item.href}
                                                        className={clsx(
                                                            'text-[20px] font-semibold transition-colors duration-200',
                                                            isLight ? 'text-black/40 active:text-black' : 'text-[#9c9c9c] active:text-white'
                                                        )}
                                                    >
                                                        {item.label}
                                                    </a>
                                                ) : (
                                                    <Link
                                                        href={item.href}
                                                        className={clsx(
                                                            'text-[20px] font-semibold transition-colors duration-200',
                                                            isLight ? 'text-black/40 active:text-black' : 'text-[#9c9c9c] active:text-white'
                                                        )}
                                                    >
                                                        {item.label}
                                                    </Link>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    )
}
