'use client'

import { PortableText } from '@portabletext/react'
import { TextCardData } from '@/types'
import { clsx } from 'clsx'
import { usePathname } from 'next/navigation'

interface TextCardProps extends TextCardData {
    className?: string
}

export function TextCard({ text, className, backgroundColor, textColor }: TextCardProps) {
    const pathname = usePathname()
    const isPhotography = pathname === '/photography'

    if (!text) return null

    return (
        <div
            className={clsx(
                'flex flex-col justify-center p-8 md:p-12 bg-gray-50 rounded-[20px] md:rounded-[30px] h-full min-h-[300px]',
                isPhotography ? 'md:h-[800px]' : 'md:h-[675px]',
                'text-[30px] leading-[1.2] md:text-[40px] md:leading-[50px] font-semibold text-black',
                className
            )}
            style={{
                backgroundColor,
                color: textColor,
            }}
        >
            <PortableText value={text} />
        </div>
    )
}
