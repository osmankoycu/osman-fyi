'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function usePlaneAnimation(isSticky: boolean) {
    const pathname = usePathname()
    const isFlyingRef = useRef(false)
    const cloneRef = useRef<HTMLElement | null>(null)
    const returnTimerRef = useRef<NodeJS.Timeout | null>(null)

    // We store the original fixed origin to calculate deltas correctly
    // independently of the element's current transform/visual distortion.
    const originRef = useRef<{ x: number, y: number } | null>(null)
    const lastRotationRef = useRef<number>(0)

    useEffect(() => {
        const plane = document.getElementById('emailPlane')
        const nameAnchor = document.getElementById('nameAnchor')

        if (!plane || !nameAnchor) return

        const cleanup = () => {
            if (returnTimerRef.current) {
                clearTimeout(returnTimerRef.current)
                returnTimerRef.current = null
            }
            if (cloneRef.current) {
                cloneRef.current.remove()
                cloneRef.current = null
            }
            if (plane) {
                plane.style.opacity = ''
                plane.style.visibility = ''
            }
            isFlyingRef.current = false
            originRef.current = null
        }

        const createCubicBezierFrames = (
            startDeltaX: number,
            startDeltaY: number,
            endDeltaX: number,
            endDeltaY: number,
            startRotation: number,
            forceEndRotationZero: boolean = false
        ) => {
            const frames = []
            const steps = 60

            // Calculate overall delta for the curve logic
            const totalDeltaX = endDeltaX - startDeltaX
            const totalDeltaY = endDeltaY - startDeltaY

            // Re-apply "S" curve logic relative to the movement vector
            // We need control points relative to (0,0) of the movement?
            // Actually, we are interpolating from StartDelta -> EndDelta.
            // P0 = StartDelta
            // P3 = EndDelta

            // Movement vector
            const isRightToLeft = totalDeltaX < 0

            let p1x, p1y, p2x, p2y

            // Control points relative to P0 (start)
            // If moving Left: Pull further Right (+X) then Arc
            // If moving Right (Return): Pull further Left (-X) then Arc

            // NOTE: Logic is mirrored for return vs outgoing based on direction
            if (isRightToLeft) {
                p1x = startDeltaX + Math.abs(totalDeltaX) * 0.4
                p1y = startDeltaY + totalDeltaY * 0.1

                p2x = startDeltaX + totalDeltaX * 0.2
                p2y = startDeltaY + totalDeltaY * 0.9
            } else {
                // Return flight (Left to Right)
                p1x = startDeltaX - Math.abs(totalDeltaX) * 0.4
                p1y = startDeltaY + totalDeltaY * 0.1

                p2x = startDeltaX + totalDeltaX * 0.2
                p2y = startDeltaY + totalDeltaY * 0.9
            }

            let prevAngle = startRotation

            for (let i = 0; i <= steps; i++) {
                const t = i / steps
                const mt = 1 - t
                const mt2 = mt * mt
                const mt3 = mt * mt * mt
                const t2 = t * t
                const t3 = t * t * t

                // Cubic Bezier
                const bx = mt3 * startDeltaX + 3 * mt2 * t * p1x + 3 * mt * t2 * p2x + t3 * endDeltaX
                const by = mt3 * startDeltaY + 3 * mt2 * t * p1y + 3 * mt * t2 * p2y + t3 * endDeltaY

                // Tangent
                const d1x = p1x - startDeltaX
                const d1y = p1y - startDeltaY
                const d2x = p2x - p1x
                const d2y = p2y - p1y
                const d3x = endDeltaX - p2x
                const d3y = endDeltaY - p2y

                const tx = 3 * mt2 * d1x + 6 * mt * t * d2x + 3 * t2 * d3x
                const ty = 3 * mt2 * d1y + 6 * mt * t * d2y + 3 * t2 * d3y

                const rad = Math.atan2(ty, tx)
                let deg = rad * (180 / Math.PI)
                let targetRotation = deg + 45

                if (i === 0) {
                    targetRotation = startRotation
                } else {
                    // Normalize/Unwrap
                    let delta = targetRotation - prevAngle
                    while (delta > 180) delta -= 360
                    while (delta < -180) delta += 360
                    targetRotation = prevAngle + delta
                }

                // If this is the LAST frame and we want to force 0
                if (i === steps && forceEndRotationZero) {
                    // To be safe, find multiple of 360 closest to prevAngle
                    // round(prev / 360) * 360
                    const revolutions = Math.round(prevAngle / 360)
                    targetRotation = revolutions * 360
                }

                prevAngle = targetRotation

                frames.push({
                    transform: `translate(${bx}px, ${by}px) rotate(${targetRotation}deg)`
                })
            }
            return frames
        }

        const triggerReturn = () => {
            if (!cloneRef.current || !originRef.current) return

            const clone = cloneRef.current
            const planeRect = plane.getBoundingClientRect() // Target (Navbar)

            // We DO NOT re-measure clone or reset top/left.
            // We use the original fixed Origin.
            const origin = originRef.current

            // Destination delta relative to Origin
            // If page hasn't scrolled, this should be 0,0.
            const destDeltaX = planeRect.left - origin.x
            const destDeltaY = planeRect.top - origin.y

            // Start delta is WHERE WE ARE NOW.
            const style = window.getComputedStyle(clone)
            const matrix = new DOMMatrix(style.transform)
            const startDeltaX = matrix.m41
            const startDeltaY = matrix.m42

            // For rotation, we trust lastRotationRef to avoid matrix decomposition ambiguity
            const startRotation = lastRotationRef.current

            clone.getAnimations().forEach(a => a.cancel())

            // We maintain the current visual state as the explicit start of the new animation
            // No glitch because top/left never changed.

            const frames = createCubicBezierFrames(
                startDeltaX, startDeltaY,
                destDeltaX, destDeltaY,
                startRotation,
                true // Force end rotation to 0 (or 360)
            )

            const anim = clone.animate(frames, {
                duration: 1500,
                easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
                fill: 'forwards'
            })

            anim.onfinish = () => {
                cleanup()
            }
        }

        const handleMouseEnter = () => {
            // IF STICKY, DO NOT ANIMATE
            if (isSticky) return

            if (returnTimerRef.current) {
                clearTimeout(returnTimerRef.current)
                returnTimerRef.current = null
            }
            if (isFlyingRef.current) return

            const planeRect = plane.getBoundingClientRect()
            const nameRect = nameAnchor.getBoundingClientRect()

            const gap = 30
            // Calculate specific "Out" deltas
            // Origin = planeRect.left, planeRect.top
            const originX = planeRect.left
            const originY = planeRect.top
            originRef.current = { x: originX, y: originY }

            // Destination relative to origin
            const destAbsX = nameRect.right + gap
            const destAbsY = nameRect.top + (nameRect.height / 2) - (planeRect.height / 2)

            const deltaX = destAbsX - originX
            const deltaY = destAbsY - originY

            const clone = plane.cloneNode(true) as HTMLElement
            clone.id = 'emailPlane-clone'
            Object.assign(clone.style, {
                position: 'fixed',
                left: `${originX}px`, // Fixed at start
                top: `${originY}px`,  // Fixed at start
                margin: 0,
                zIndex: 9999,
                pointerEvents: 'auto',
                cursor: 'pointer'
            })
            clone.removeAttribute('id')
            document.body.appendChild(clone)
            cloneRef.current = clone

            clone.addEventListener('mouseenter', () => {
                if (returnTimerRef.current) {
                    clearTimeout(returnTimerRef.current)
                    returnTimerRef.current = null
                }
            })
            clone.addEventListener('mouseleave', () => {
                returnTimerRef.current = setTimeout(triggerReturn, 3000)
            })
            clone.addEventListener('click', (e) => {
                e.preventDefault()
                e.stopPropagation()
                window.location.href = "mailto:osmankoycu@gmail.com"
            })

            plane.style.opacity = '0'
            isFlyingRef.current = true

            // Generate frames starting at 0,0,0
            const frames = createCubicBezierFrames(0, 0, deltaX, deltaY, 0)

            // Capture the final rotation for return
            if (frames.length > 0) {
                const transformStr = frames[frames.length - 1].transform
                const rotateMatch = transformStr.match(/rotate\(([-\d.]+)deg\)/)
                if (rotateMatch && rotateMatch[1]) {
                    lastRotationRef.current = parseFloat(rotateMatch[1])
                }
            }

            clone.animate(frames, {
                duration: 1500,
                easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
                fill: 'forwards'
            })
        }

        const handleMouseLeavePlane = () => {
            // 3s delay
            returnTimerRef.current = setTimeout(triggerReturn, 3000)
        }

        const handlePlaneClick = (e: MouseEvent) => {
            // If sticky, do nothing here (let default click happen). 
            // If animating, the clone covers this anyway. 
            // But if specific logic needed:
        }

        plane.addEventListener('mouseenter', handleMouseEnter)
        plane.addEventListener('mouseleave', handleMouseLeavePlane)
        plane.addEventListener('click', handlePlaneClick)

        return () => {
            plane.removeEventListener('mouseenter', handleMouseEnter)
            plane.removeEventListener('mouseleave', handleMouseLeavePlane)
            plane.removeEventListener('click', handlePlaneClick)
            cleanup()
        }
    }, [pathname, isSticky]) // Depend on isSticky too
}
