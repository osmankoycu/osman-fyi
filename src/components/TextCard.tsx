'use client'

import { PortableText } from '@portabletext/react'
import { TextCardData } from '@/types'
import { clsx } from 'clsx'
import { usePathname } from 'next/navigation'

interface TextCardProps extends TextCardData {
    className?: string
    enableWidePacking?: boolean
}

export function TextCard({ text, className, backgroundColor, textColor, enableWidePacking = true }: TextCardProps) {
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

    // Mode 1: Standard Packing (Photography)
    // - Specific padding breakpoints
    // - Clamp-based fluid typography
    // - Conditional reduction on wide screens for long text
    const standardClasses = clsx(
        'p-8 md:p-10 lg:p-12',
        'text-[clamp(24px,3.125vw,48px)]',
        isLongText
            ? 'min-[1440px]:text-[clamp(24px,2.08vw,40px)]'
            : 'min-[1440px]:text-[clamp(24px,2.08vw,40px)]'
    )

    // Mode 2: Proportional Scaling (Product/Experiments)
    // - Pure container-query based padding and text size
    // - Scales perfectly like an image
    const proportionalClasses = 'text-[5.7cqw] p-[13.33cqw] leading-[1.1]'

    return (
        <div
            className={clsx(
                'flex flex-col justify-center bg-gray-50 rounded-lg w-full h-full min-h-0 overflow-y-auto no-scrollbar',
                enableWidePacking ? standardClasses : proportionalClasses,
                'font-semibold text-black text-center md:text-left',
                'whitespace-pre-wrap gap-y-[0.6em]', // Preserve whitespace/newlines and add proportional gap between blocks
                className
            )}
            style={{
                backgroundColor,
                color: textColor,
                containerType: enableWidePacking ? 'normal' : 'inline-size',
            }}
        >
            <PortableText value={text} />
            {(backgroundColor === 'white' || backgroundColor?.toLowerCase() === '#ffffff') && (
                <div className="absolute inset-0 border border-black/10 mix-blend-multiply pointer-events-none rounded-lg" />
            )}
        </div>
    )
}
