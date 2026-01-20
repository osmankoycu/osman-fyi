'use client'

export function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <footer className="w-full mt-32 pb-10">
            <div className="separator mb-10" />
            <div className="container-text flex items-center justify-between">
                <div className="text-[22px] font-bold text-black">
                    Osman Köycü, Copyright © 2026
                </div>
                <button
                    onClick={scrollToTop}
                    className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-300 cursor-pointer"
                    aria-label="Back to top"
                >
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 19V5" />
                        <path d="M5 12l7-7 7 7" />
                    </svg>
                </button>
            </div>
        </footer>
    )
}
