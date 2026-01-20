'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const navItems = [
    { name: 'Product', href: '/' }, // Homepage defaults to product list
    { name: 'Experiments', href: '/experiments' },
    { name: 'Photography', href: '/photography' },
    { name: 'Curation', href: '/curation' },
    { name: 'About', href: '/about' },
]

export function Navbar() {
    const pathname = usePathname()

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="container-custom flex items-center justify-between h-16">
                <Link href="/" className="text-xl font-bold tracking-tight">
                    Osman Köycu
                </Link>

                <div className="hidden md:flex items-center space-x-1 bg-gray-100/50 p-1 rounded-full">
                    {navItems.map((item) => {
                        // Logic for active state:
                        // '/' matches only '/'
                        // other paths match if pathname starts with href (e.g. /experiments matches /experiments/foo)
                        const isActive = item.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(item.href)

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-black text-white shadow-sm'
                                        : 'text-gray-600 hover:text-black hover:bg-white/50'
                                )}
                            >
                                {item.name}
                            </Link>
                        )
                    })}
                </div>

                {/* Mobile Menu Placeholder - simple hamburger can be added here */}
                <div className="md:hidden">
                    {/* Mobile menu implementation or simplified link list */}
                </div>
            </div>
        </nav>
    )
}
