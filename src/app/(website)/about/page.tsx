import { PortableText } from '@portabletext/react'
import { client } from '@/lib/sanity.client'
import { aboutPageQuery } from '@/lib/sanity.queries'
import { AboutPageData } from '@/types'
import { AboutHero } from '@/components/AboutHero'

export const revalidate = 60

export default async function AboutPage() {
    const data: AboutPageData = await client.fetch(aboutPageQuery)

    return (
        <div className="pb-10">
            {/* Hero Image - Wider Container */}
            <div className="container-custom mb-16">
                <AboutHero
                    image={data?.heroImage}
                    alt={data?.heroImage?.alt}
                    image2={data?.heroImage2}
                    alt2={data?.heroImage2?.alt}
                />
            </div>

            {/* Content - Narrower Text Container */}
            <div className="container-text">
                <div className="mb-16">
                    <div className="space-y-6 text-[20px] leading-[1.4] md:text-[26px] md:leading-[1.4] lg:text-[32px] lg:leading-[1.4] font-semibold text-black text-justify">
                        {data?.bio ? (
                            <PortableText value={data.bio} />
                        ) : (
                            <>
                                <p>
                                    I’m a designer who enjoys building things and exploring ideas through hands-on work. My practice sits between design, technology, and experimentation, often moving fluidly across products, tools, and creative systems.
                                </p>
                                <p className="text-black">
                                    I currently live in New York with my family. Outside of work, I’m a husband and a father, roles that quietly influence how I think about responsibility, focus, and long-term thinking.

                                    Earlier in my career, I founded InnovationBox, a product and design studio where we worked with leading companies in Turkey and built our own digital products used by millions of people. Later, I joined Bunch, a real-time social gaming platform, where I led the design team and owned design across the product.

                                    Today, I continue to design, build, and experiment, sometimes shipping products, sometimes learning through small experiments.
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                    <div>
                        <h3 className="text-[18px] md:text-[20px] lg:text-[22px] font-bold text-black mb-4 uppercase tracking-wider">Experience</h3>
                        <ul className="space-y-4">
                            <li>
                                <a href="https://www.image.inc/" target="_blank" rel="noopener noreferrer" className="flex items-center text-[18px] md:text-[20px] lg:text-[22px] font-bold text-black hover:text-[#1F1F1F] transition-colors">Image Inc. ↗</a>
                                <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#9C9C9C]">Founder</div>
                                <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#9C9C9C]">Mar 2025 — Present</div>
                            </li>
                            <li>
                                <a href="https://www.innovationbox.com/" target="_blank" rel="noopener noreferrer" className="flex items-center text-[18px] md:text-[20px] lg:text-[22px] font-bold text-black hover:text-[#1F1F1F] transition-colors">InnovationBox ↗</a>
                                <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#9C9C9C]">Founder, Executive Creative Director</div>
                                <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#9C9C9C]">Jan 2009 — Present</div>
                            </li>
                            <li>
                                <a href="https://www.bunch.live" target="_blank" rel="noopener noreferrer" className="flex items-center text-[18px] md:text-[20px] lg:text-[22px] font-bold text-black hover:text-[#1F1F1F] transition-colors">Bunch ↗</a>
                                <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#9C9C9C]">Director of Product Design</div>
                                <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#9C9C9C]">Jul 2021 — May 2025</div>
                            </li>
                            <li>
                                <a href="https://countly.com/" target="_blank" rel="noopener noreferrer" className="flex items-center text-[18px] md:text-[20px] lg:text-[22px] font-bold text-black hover:text-[#1F1F1F] transition-colors">Countly ↗</a>
                                <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#9C9C9C]">Co-founder, Product Designer</div>
                                <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#9C9C9C]">Jan 2012 — Dec 2015</div>
                            </li>
                            <li>
                                <a href="https://www.turkcell.com.tr/" target="_blank" rel="noopener noreferrer" className="flex items-center text-[18px] md:text-[20px] lg:text-[22px] font-bold text-black hover:text-[#1F1F1F] transition-colors">Turkcell ↗</a>
                                <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#9C9C9C]">Product Designer</div>
                                <div className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-[#9C9C9C]">2008 — 2009</div>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[18px] md:text-[20px] lg:text-[22px] font-bold text-black mb-4 uppercase tracking-wider">Connect</h3>
                        <ul className="space-y-4">
                            <li>
                                <a href="https://x.com/osmankoycu" target="_blank" rel="noopener noreferrer" className="flex items-center text-[18px] md:text-[20px] lg:text-[22px] font-bold text-black hover:text-[#1F1F1F] transition-colors">
                                    Twitter / X ↗
                                </a>
                            </li>
                            <li>
                                <a href="https://www.linkedin.com/in/osmankoycu/" target="_blank" rel="noopener noreferrer" className="flex items-center text-[18px] md:text-[20px] lg:text-[22px] font-bold text-black hover:text-[#1F1F1F] transition-colors">
                                    LinkedIn ↗
                                </a>
                            </li>
                            <li>
                                <a href="mailto:hello@example.com" className="flex items-center text-[18px] md:text-[20px] lg:text-[22px] font-bold text-black hover:text-[#1F1F1F] transition-colors">
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
