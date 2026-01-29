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
                    description: 'Building hands-on experiments around ideas, tools, and concepts.'
                }
            case '/photography':
                return {
                    title: 'Hobbyist Photographer.',
                    description: 'Capturing everyday moments and travels as a personal hobby.'
                }
            case '/curation':
                return {
                    title: 'Product Enthusiast.',
                    description: 'Collecting well-crafted and inspiring products and ideas.'
                }
            case '/about':
                return {
                    title: 'Human.',
                    description: 'Designer and builder. Husband and father.'
                }
            default:
                return {
                    title: 'Designer.',
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
        <header className="container-text h-[calc(100dvh-210px)] mb-12 flex flex-col justify-center items-center text-center !px-[30px] md:!px-4">
            <h1 className={clsx(
                "text-[28px] md:text-[32px] leading-[34px] md:leading-[42px] mb-6 md:mb-8 max-w-[900px]",
                isDark ? "text-white" : "text-black"
            )}>
                <span className="font-bold">
                    Osman Köycü, <br className="md:hidden" /> {content.title}
                </span>
                <br />
                <span className={clsx("font-medium", isDark ? "text-[#9c9c9c]" : "text-[#1F1F1F]")}>
                    {content.description}
                </span>
            </h1>
        </header>
    )
}
