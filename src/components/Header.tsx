'use client'

export function Header() {
    return (
        <header className="container-text pt-8 md:pt-16 mb-16 max-w-none">
            <h1 className="text-[64px] font-bold leading-tight text-black mb-8">
                Osman Köycu, <br />
                Independent Designer.
            </h1>
            <p className="text-[40px] font-semibold leading-[50px] text-black">
                I enjoy creating and experimenting with new ideas.
                Currently working on <span className="text-black border-b-2 border-black pb-0.5">Image Inc.</span>, based in New York.
            </p>
        </header>
    )
}
