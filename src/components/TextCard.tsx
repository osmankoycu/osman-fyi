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

    const getTextLength = (blocks: any[]) => {
        return blocks.reduce((acc, block) => {
            if (block._type !== 'block' || !block.children) return acc
            return acc + block.children.reduce((childAcc: number, child: any) => childAcc + (child.text?.length || 0), 0)
        }, 0)
    }

    const charCount = getTextLength(text)
    const isLongText = charCount > 200

    return (
        <div
            className={clsx(
                'flex flex-col justify-center p-8 md:p-10 lg:p-12 bg-gray-50 rounded w-full h-full min-h-0 overflow-y-auto no-scrollbar',
                isLongText
                    ? 'text-[clamp(24px,3.125vw,48px)] min-[1440px]:text-[clamp(24px,2.08vw,40px)]'
                    : 'text-[clamp(24px,3.125vw,48px)] min-[1440px]:text-[clamp(24px,2.08vw,40px)]',
                'leading-tight font-semibold text-black',
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
