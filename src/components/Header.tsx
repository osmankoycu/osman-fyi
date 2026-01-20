'use client'

import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

export function Header() {
    const pathname = usePathname()

    const getContent = () => {
        switch (pathname) {
            case '/experiments':
                return {
                    title: 'Design Engineer.',
                    description: 'I design and build hands-on experiments to explore ideas, tools, and concepts, without a fixed outcome or expectation.'
                }
            case '/photography':
                return {
                    title: 'Hobbyist Photographer.',
                    description: 'I take photos in my free time, mostly while traveling and in everyday life. It’s a personal hobby and a way for me to capture small, quiet moments.'
                }
            case '/curation':
                return {
                    title: 'Product Enthusiast.',
                    description: 'A personal collection of products and ideas I find thoughtful, well-crafted, and inspiring.'
                }
            case '/about':
                return {
                    title: 'Human.',
                    description: 'Outside of work, I’m a husband and a father. This site is a personal space where I share what I build, explore, and stay curious about.'
                }
            default:
                return {
                    title: 'Independent Designer.',
                    description: (
                        <>
                            I enjoy creating and experimenting with new ideas. <br />
                            Currently working on <a href="http://image.inc" target="_blank" rel="noopener noreferrer" className="text-black border-b-2 border-black pb-0.5 hover:text-[#1F1F1F] hover:border-[#1F1F1F] transition-colors">Image Inc.</a> based in New York.
                        </>
                    )
                }
        }
    }

    const content = getContent()

    const isDark = pathname === '/photography'

    return (
        <header className="container-text pt-8 md:pt-16 mb-16 max-w-none min-h-[50vh] md:h-[600px] flex flex-col justify-start">
            <h1 className={clsx(
                "text-[40px] leading-[1.1] md:text-[64px] md:leading-[75px] font-bold mb-6 md:mb-8",
                isDark ? "text-white" : "text-black"
            )}>
                Osman Köycü, <br />
                {content.title}
            </h1>
            <div className={clsx(
                "text-[20px] leading-[1.4] md:text-[40px] md:leading-[50px] font-semibold",
                isDark ? "text-[#9c9c9c]" : "text-black"
            )}>
                {content.description}
            </div>
        </header>
    )
}
