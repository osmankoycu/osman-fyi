'use client'

export function Header() {
    return (
        <header className="container-custom pt-8 md:pt-16 mb-16 max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8">
                Osman Köycu, <br />
                Independent Designer.
            </h1>
            <p className="text-xl md:text-2xl font-medium text-gray-600 leading-relaxed md:leading-relaxed">
                I enjoy creating and experimenting with new ideas.
                Currently working on <span className="text-black border-b-2 border-black pb-0.5">Image Inc.</span>, based in New York.
            </p>
        </header>
    )
}
