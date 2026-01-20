'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

export function Navbar() {
    const pathname = usePathname()

    const navItems = [
        { label: 'Product', href: '/' },
        { label: 'Experiments', href: '/experiments' },
        { label: 'Photography', href: '/photography' },
        { label: 'Curation', href: '/curation' },
        { label: 'About', href: '/about' },
    ]

    const SendIcon = () => (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    )

    return (
        <nav className="w-full h-[120px] bg-white border-y border-gray-200 flex items-center mb-24">
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
                                    'px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200',
                                    isActive
                                        ? 'bg-black text-white'
                                        : 'text-black hover:bg-gray-100'
                                )}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </div>

                <div className="text-black cursor-pointer hover:scale-110 transition-transform">
                    <SendIcon />
                </div>
            </div>
        </nav>
    )
}
