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
                            Currently building <a href="http://image.inc" target="_blank" rel="noopener noreferrer" className="font-medium text-black border-b-[1.5px] border-black pb-0.5 hover:text-[#4a4a4a] hover:border-[#4a4a4a] transition-colors">Image Inc.</a>, based in New York.
                        </>
                    )
                }
        }
    }

    const content = getContent()

    const isDark = pathname === '/photography'

    return (
        <header className="container-text h-[calc(100dvh-200px)] mb-12 flex flex-col justify-center items-center text-center !px-[40px] md:!px-4">
            <h1 className={clsx(
                "text-[28px] md:text-[32px] leading-[34px] md:leading-[42px] mb-6 md:mb-8 max-w-[900px]",
                isDark ? "text-white" : "text-black"
            )}>
                <span className="font-bold">
                    Osman Köycü, <br className="md:hidden" /> {content.title}
                </span>
                <br />
                <span className={clsx("font-normal", isDark ? "text-[#9c9c9c]" : "text-[#1F1F1F]")}>
                    {content.description}
                </span>
            </h1>
        </header>
    )
}
