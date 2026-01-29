'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { MorphTarget } from '../components/ParticleMorph'

interface ParticleMorphContextType {
    currentTarget: MorphTarget
    setCurrentTarget: (target: MorphTarget) => void
}

const ParticleMorphContext = createContext<ParticleMorphContextType | undefined>(undefined)

export function ParticleMorphProvider({ children }: { children: ReactNode }) {
    const [currentTarget, setCurrentTarget] = useState<MorphTarget>('default')

    return (
        <ParticleMorphContext.Provider value={{ currentTarget, setCurrentTarget }}>
            {children}
        </ParticleMorphContext.Provider>
    )
}

export function useParticleMorph() {
    const context = useContext(ParticleMorphContext)
    if (!context) {
        throw new Error('useParticleMorph must be used within ParticleMorphProvider')
    }
    return context
}
