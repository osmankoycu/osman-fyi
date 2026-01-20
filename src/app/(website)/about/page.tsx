import { PortableText } from '@portabletext/react'
import { client } from '@/lib/sanity.client'
import { aboutPageQuery } from '@/lib/sanity.queries'
import { AboutPageData } from '@/types'
import { AboutHero } from '@/components/AboutHero'

export const revalidate = 60

export default async function AboutPage() {
    const data: AboutPageData = await client.fetch(aboutPageQuery)

    return (
        <div className="pt-8 md:pt-16 pb-24">
            {/* Hero Image - Wider Container */}
            <div className="container-custom mb-16">
                <AboutHero
                    image={data?.heroImage}
                    alt={data?.heroImage?.alt}
                />
            </div>

            {/* Content - Narrower Text Container */}
            <div className="container-text">
                <div className="mb-16">
                    <div className="space-y-6 text-[40px] font-semibold leading-[50px] text-black">
                        {data?.bio ? (
                            <PortableText value={data.bio} />
                        ) : (
                            <>
                                <p>
                                    Hi, I'm Osman. I'm a product designer based in New York City.
                                </p>
                                <p className="text-black">
                                    I specialize in building clean, functional, and aesthetically pleasing digital products. My work balances user needs with business goals, always striving for simplicity and clarity.
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                    <div>
                        <h3 className="text-[22px] font-bold text-black mb-4 uppercase tracking-wider">Experience</h3>
                        <ul className="space-y-4">
                            <li>
                                <div className="text-[22px] font-bold text-black">Image Inc.</div>
                                <div className="text-[22px] font-semibold text-[#9C9C9C]">Founding Designer</div>
                                <div className="text-[22px] font-semibold text-[#9C9C9C]">2023 — Present</div>
                            </li>
                            <li>
                                <div className="text-[22px] font-bold text-black">Acme Corp</div>
                                <div className="text-[22px] font-semibold text-[#9C9C9C]">Senior Product Designer</div>
                                <div className="text-[22px] font-semibold text-[#9C9C9C]">2021 — 2023</div>
                            </li>
                            <li>
                                <div className="text-[22px] font-bold text-black">Studio Design</div>
                                <div className="text-[22px] font-semibold text-[#9C9C9C]">Product Designer</div>
                                <div className="text-[22px] font-semibold text-[#9C9C9C]">2019 — 2021</div>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[22px] font-bold text-black mb-4 uppercase tracking-wider">Connect</h3>
                        <ul className="space-y-4">
                            <li>
                                <a href="#" className="flex items-center text-[22px] font-bold text-black hover:text-[#1F1F1F] transition-colors">
                                    Twitter / X ↗
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center text-[22px] font-bold text-black hover:text-[#1F1F1F] transition-colors">
                                    LinkedIn ↗
                                </a>
                            </li>
                            <li>
                                <a href="mailto:hello@example.com" className="flex items-center text-[22px] font-bold text-black hover:text-[#1F1F1F] transition-colors">
                                    Email ↗
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
