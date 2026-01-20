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
        <div className={clsx('prose prose-lg prose-neutral max-w-none text-black/80', className)}>
            <PortableText value={text} />
        </div>
    )
}
