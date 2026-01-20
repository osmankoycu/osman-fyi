'use client'

import { usePathname } from 'next/navigation'

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
                            Currently working on <a href="http://image.inc" target="_blank" rel="noopener noreferrer" className="text-black border-b-2 border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors">Image Inc.</a>, based in New York.
                        </>
                    )
                }
        }
    }

    const content = getContent()

    return (
        <header className="container-text pt-8 md:pt-16 mb-16 max-w-none h-[600px] flex flex-col justify-start">
            <h1 className="text-[64px] font-bold leading-[75px] text-black mb-8">
                Osman Köycü, <br />
                {content.title}
            </h1>
            <div className="text-[40px] font-semibold leading-[50px] text-black">
                {content.description}
            </div>
        </header>
    )
}
