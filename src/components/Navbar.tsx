'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
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

    const isDark = pathname === '/photography'

    return (
        <nav
            className={clsx(
                'w-full sticky top-0 z-50 border-b-2 flex items-center mb-12 md:mb-24 transition-[height] duration-300',
                isStuck ? 'h-[64px] md:h-[100px]' : 'h-[80px] md:h-[130px]',
                isDark ? 'bg-black border-[#1F1F1F]' : 'bg-white border-gray-200'
            )}
        >
            <div className="container-text flex items-center justify-between w-full">
                {/* Scrollable Nav Items Container */}
                <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 mask-image-scroll">
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
                                    'px-3 py-1.5 md:px-5 md:py-2.5 rounded-full transition-all duration-200 text-[18px] md:text-[20px] lg:text-[22px] font-bold whitespace-nowrap',
                                    isActive
                                        ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                                        : (isDark ? 'text-white hover:bg-[#1F1F1F]' : 'text-black hover:bg-gray-100')
                                )}
                            >
                                {item.label}
                            </Link>
                        )
                    })}

                    {/* Mobile Only Email Icon */}
                    <a
                        href="mailto:osmankoycu@gmail.com"
                        className={clsx(
                            "md:hidden shrink-0 ml-1 px-3 py-1.5 cursor-pointer transition-colors duration-300 hover:text-[#1F1F1F]",
                            isDark ? "text-white" : "text-black"
                        )}
                        aria-label="Send email"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="fill-current"
                        >
                            <path d="M18.9466 32C18.1425 32 17.5165 31.7455 17.0687 31.2366C16.631 30.7277 16.285 30.0814 16.0305 29.2977L14.1069 23.2061C13.9033 22.5751 13.8372 21.9746 13.9084 21.4046C13.9796 20.8244 14.2341 20.2901 14.6718 19.8015L30.0153 2.76336C30.1272 2.64122 30.1781 2.50382 30.1679 2.35115C30.1679 2.19847 30.1221 2.07125 30.0305 1.96947C29.9389 1.86768 29.8168 1.81679 29.6641 1.81679C29.5115 1.81679 29.369 1.87277 29.2366 1.98473L12.1374 17.3282C11.5878 17.8168 11.0585 18.0814 10.5496 18.1221C10.0407 18.1628 9.4402 18.0712 8.74809 17.8473L2.67176 15.9389C1.88804 15.6947 1.24682 15.3537 0.748092 14.916C0.249364 14.4784 0 13.8575 0 13.0534C0 12.341 0.21374 11.7455 0.641221 11.2672C1.07888 10.7888 1.64885 10.4122 2.35115 10.1374L28.1374 0.305344C28.402 0.203562 28.6616 0.127226 28.916 0.0763359C29.1705 0.0254453 29.4148 0 29.6489 0C30.3613 0 30.9313 0.21374 31.3588 0.641221C31.7863 1.0687 32 1.63868 32 2.35115C32 2.57506 31.9746 2.81425 31.9237 3.0687C31.8728 3.32316 31.7964 3.58779 31.6947 3.8626L21.8626 29.6489C21.5878 30.3511 21.2112 30.916 20.7328 31.3435C20.2545 31.7812 19.659 32 18.9466 32Z" />
                        </svg>
                    </a>
                </div>


                <a
                    id="emailPlane"
                    href="mailto:osmankoycu@gmail.com"
                    className={clsx(
                        "hidden md:block cursor-pointer transition-colors duration-300 hover:text-[#1F1F1F]",
                        isDark ? "text-white" : "text-black"
                    )}
                    aria-label="Send email"
                >
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="fill-current"
                    >
                        <path d="M18.9466 32C18.1425 32 17.5165 31.7455 17.0687 31.2366C16.631 30.7277 16.285 30.0814 16.0305 29.2977L14.1069 23.2061C13.9033 22.5751 13.8372 21.9746 13.9084 21.4046C13.9796 20.8244 14.2341 20.2901 14.6718 19.8015L30.0153 2.76336C30.1272 2.64122 30.1781 2.50382 30.1679 2.35115C30.1679 2.19847 30.1221 2.07125 30.0305 1.96947C29.9389 1.86768 29.8168 1.81679 29.6641 1.81679C29.5115 1.81679 29.369 1.87277 29.2366 1.98473L12.1374 17.3282C11.5878 17.8168 11.0585 18.0814 10.5496 18.1221C10.0407 18.1628 9.4402 18.0712 8.74809 17.8473L2.67176 15.9389C1.88804 15.6947 1.24682 15.3537 0.748092 14.916C0.249364 14.4784 0 13.8575 0 13.0534C0 12.341 0.21374 11.7455 0.641221 11.2672C1.07888 10.7888 1.64885 10.4122 2.35115 10.1374L28.1374 0.305344C28.402 0.203562 28.6616 0.127226 28.916 0.0763359C29.1705 0.0254453 29.4148 0 29.6489 0C30.3613 0 30.9313 0.21374 31.3588 0.641221C31.7863 1.0687 32 1.63868 32 2.35115C32 2.57506 31.9746 2.81425 31.9237 3.0687C31.8728 3.32316 31.7964 3.58779 31.6947 3.8626L21.8626 29.6489C21.5878 30.3511 21.2112 30.916 20.7328 31.3435C20.2545 31.7812 19.659 32 18.9466 32Z" />
                    </svg>
                </a>
            </div>
        </nav>
    )
}
