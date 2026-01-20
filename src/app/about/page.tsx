export default function AboutPage() {
    return (
        <div className="container-custom pt-8 md:pt-16 pb-24 max-w-3xl">
            <div className="mb-16">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 hidden">About</h1>
                {/* Using a more editorial header style */}
                <div className="space-y-6 text-xl md:text-2xl font-medium text-black leading-relaxed">
                    <p>
                        Hi, I'm Osman. I'm a product designer based in New York City.
                    </p>
                    <p className="text-gray-600">
                        I specialize in building clean, functional, and aesthetically pleasing digital products. My work balances user needs with business goals, always striving for simplicity and clarity.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Experience</h3>
                    <ul className="space-y-4">
                        <li>
                            <div className="font-medium">Image Inc.</div>
                            <div className="text-gray-500 text-sm">Founding Designer</div>
                            <div className="text-gray-400 text-sm">2023 — Present</div>
                        </li>
                        <li>
                            <div className="font-medium">Acme Corp</div>
                            <div className="text-gray-500 text-sm">Senior Product Designer</div>
                            <div className="text-gray-400 text-sm">2021 — 2023</div>
                        </li>
                        <li>
                            <div className="font-medium">Studio Design</div>
                            <div className="text-gray-500 text-sm">Product Designer</div>
                            <div className="text-gray-400 text-sm">2019 — 2021</div>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Connect</h3>
                    <ul className="space-y-4">
                        <li>
                            <a href="#" className="flex items-center hover:text-gray-600 transition-colors">
                                Twitter / X ↗
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center hover:text-gray-600 transition-colors">
                                LinkedIn ↗
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center hover:text-gray-600 transition-colors">
                                Instagram ↗
                            </a>
                        </li>
                        <li>
                            <a href="mailto:hello@example.com" className="flex items-center hover:text-gray-600 transition-colors">
                                Email ↗
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
    )
}
