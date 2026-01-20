'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

export function Navbar() {
    const pathname = usePathname()
    const [isStuck, setIsStuck] = useState(false)

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

    return (
        <nav
            className={clsx(
                'w-full sticky top-0 z-50 bg-white border-b border-gray-200 flex items-center mb-24 transition-all duration-300',
                isStuck ? 'h-[100px]' : 'h-[130px]'
            )}
        >
            <div className="container-text flex items-center justify-between w-full">
                <div className="flex items-center space-x-1">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === '/'
                                ? pathname === '/' || pathname === '/product'
                                : pathname.startsWith(item.href)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'px-5 py-2.5 rounded-full transition-all duration-200 text-[22px] font-bold text-black',
                                    isActive
                                        ? 'bg-black text-white'
                                        : 'hover:bg-gray-100'
                                )}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </div>

                <a
                    href="mailto:osmankoycu@gmail.com"
                    className="text-black cursor-pointer transition-opacity hover:opacity-70"
                    aria-label="Send email"
                >
                    <Image
                        src="/mail-icon.svg"
                        width={32}
                        height={32}
                        alt="Contact"
                    />
                </a>
            </div>
        </nav>
    )
}
