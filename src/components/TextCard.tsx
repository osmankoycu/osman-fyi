'use client'

import { PortableText } from '@portabletext/react'
import { TextCardData } from '@/types'
import { clsx } from 'clsx'

interface TextCardProps extends TextCardData {
    className?: string
}

export function TextCard({ text, className }: TextCardProps) {
    if (!text) return null

    return (
        <div className={clsx(
            'flex flex-col justify-center p-8 md:p-12 bg-gray-50 rounded-[30px] h-full min-h-[300px] md:h-[675px]',
            'text-[40px] font-semibold leading-[50px] text-black',
            className
        )}>
            <PortableText value={text} />
        </div>
    )
}
