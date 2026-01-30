'use client'

import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

export type MorphTarget = 'default' | 'atom' | 'camera' | 'cube' | 'curation' | 'palette' | 'plane' | 'hand'

interface ParticleMorphProps {
    target?: MorphTarget
    particleCount?: number
    isVisible?: boolean
    color?: number
}

export function ParticleMorph({
    target = 'default',
    particleCount = 6000, // Always use 6000 particles, control via opacity
    isVisible = true,
    color = 0x000000
}: ParticleMorphProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<{
        renderer: THREE.WebGLRenderer
        scene: THREE.Scene
        camera: THREE.PerspectiveCamera
        particles: THREE.Points
        materialShader?: any // THREE.Shader is not exported
        basePositions: Float32Array
        targetPositions: Float32Array
        currentTarget: MorphTarget
        animationProgress: number
        frameId: number | null
        atomData?: {
            orbitIndices: Float32Array // 0, 1, 2 for orbits, -1 for nucleus
            angles: Float32Array
            drifts: Float32Array
        }
        cubeData?: {
            innerShapeIndices: Int8Array // 1 for inner shape, 0 for outer cube
        }
        scissorsData?: {
            armIndices: Int8Array // 0 for Left Arm (Blade+Handle), 1 for Right Arm
        }
    } | null>(null)

    // Generate base noise cloud positions
    const generateNoiseCloud = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)
        // Spread particles across the header area (wide rectangle)
        const width = 12.0 // Wide dispersion
        const height = 4.5 // Covers most of vertical height
        const depth = 2.0 // Slight depth

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            positions[i3] = (Math.random() - 0.5) * width
            positions[i3 + 1] = (Math.random() - 0.5) * height
            positions[i3 + 2] = (Math.random() - 0.5) * depth
        }

        return positions
    }

    // Generate waving hand shape
    const generateHand = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)

        // Distribution: Palm 40%, Wrist 10%, Fingers 50%
        const palmCount = Math.floor(count * 0.4)
        const wristCount = Math.floor(count * 0.1)
        const fingerCount = Math.floor((count - palmCount - wristCount) / 5)

        let pIndex = 0

        // 1. Palm (Rounded Box / Squircle)
        for (let i = 0; i < palmCount; i++) {
            const i3 = pIndex * 3

            // Rejection sampling for rounded corners
            // Box default: x:[-0.8, 0.8], y:[-0.75, 0.75]
            let x, y, z
            let valid = false
            while (!valid) {
                x = (Math.random() - 0.5) * 1.6
                y = (Math.random() - 0.5) * 1.5

                // Apply rounding to corners
                // Normalized coordinates relative to corner starts
                // Let's say corners start at x=+-0.5, y=+-0.5
                const ax = Math.abs(x)
                const ay = Math.abs(y)

                // Bottom corners (connect to wrist) - allow more rounding aka taper
                if (y < -0.4) {
                    // Determine max width at this y to shape into wrist
                    // Wrist radius is ~0.6, so at y=-0.75 width should be ~1.2 (radius 0.6)
                    // Elliptical rounding for bottom corners
                    // x^2 / 0.8^2 + (y+0.4)^2 / 0.35^2 ... maybe too complex

                    // Simple corner check:
                    // If both x and y are far out
                    const cornerX = 0.5
                    const cornerY = 0.4 // relative to bottom edge

                    if (ax > 0.5 && y < -0.5) {
                        const dx = ax - 0.5
                        const dy = -0.5 - y // positive distance from -0.5 line downwards
                        // Check elliptical corner
                        if ((dx * dx) / (0.3 * 0.3) + (dy * dy) / (0.25 * 0.25) > 1) {
                            if (Math.random() > 0.1) continue; // Retry mostly, allow some fuzz
                        }
                    }
                }

                // General rounding for all corners (fuzzier box)
                if (Math.pow(x / 0.8, 4) + Math.pow(y / 0.75, 4) > 1.1) {
                    // Reject points in the sharp corners of the superellipse
                    continue
                }

                valid = true
            }

            // Soften edges: Depth (z) should taper off at the edges of the palm (ellipsoid-ish profile)
            // Normalized distance from center (approx)
            const nx = x! / 0.8
            const ny = y! / 0.75
            const distSq = nx * nx + ny * ny

            // Base thickness 0.5, thinning edge factor
            // Create a "pill" shape profile
            const thicknessFactor = Math.sqrt(Math.max(0, 1 - distSq * 0.6)) // Don't go to zero, perfectly flat hands are weird. Keep some edge thickness.

            z = (Math.random() - 0.5) * 0.5 * thicknessFactor

            positions[i3] = x!
            positions[i3 + 1] = y!
            positions[i3 + 2] = z
            pIndex++
        }

        // 2. Wrist (Cylinder at bottom)
        for (let i = 0; i < wristCount; i++) {
            const i3 = pIndex * 3
            const angle = Math.random() * Math.PI * 2
            const r = 0.6 * Math.sqrt(Math.random())
            const h = Math.random() * 0.8

            positions[i3] = r * Math.cos(angle)
            positions[i3 + 1] = -0.75 - h
            positions[i3 + 2] = r * Math.sin(angle)
            pIndex++
        }

        // 3. Fingers
        const fingerSpecs = [
            { x: -0.8, y: -0.3, ang: 0.5, len: 1.0, w: 0.38 }, // Thumb - Thicker
            { x: -0.6, y: 0.75, ang: 0.1, len: 1.1, w: 0.30 }, // Index
            { x: -0.2, y: 0.8, ang: 0, len: 1.25, w: 0.32 },   // Middle
            { x: 0.2, y: 0.75, ang: -0.05, len: 1.15, w: 0.30 }, // Ring
            { x: 0.6, y: 0.65, ang: -0.15, len: 0.9, w: 0.26 }   // Pinky
        ]

        fingerSpecs.forEach((f, idx) => {
            const currentLimit = (idx === 4) ? count - pIndex : fingerCount

            for (let j = 0; j < currentLimit; j++) {
                if (pIndex >= count) break
                const i3 = pIndex * 3

                const t = Math.random()
                let widthScale = 1.0 // Initialize widthScale

                if (t > 0.85) {
                    const tipT = (t - 0.85) / 0.15
                    // Circular rounding profile for tip
                    widthScale = Math.sqrt(1 - tipT * tipT)
                }

                // Finger geometry: Cylinder (Round Cross-Section)
                // Random angle for the cylinder
                const theta = Math.random() * Math.PI * 2
                // Random radius (sqrt for uniform distribution in circle)
                // Width 'w' is diameter, so radius is w/2
                // Add some "fuzz" to radius to fill volume? No, standard solid cylinder is clear enough.
                const r = (f.w / 2) * Math.sqrt(Math.random()) * widthScale

                // Local cylinder coords (before finger rotation)
                // Axis is Y (along length). Cross section is XZ
                const cylX = r * Math.cos(theta)
                const cylZ = r * Math.sin(theta)
                const cylY = t * f.len

                // Rotate finger to correct angle
                const cos = Math.cos(f.ang)
                const sin = Math.sin(f.ang)

                // Rotate around Z axis (tilting the finger)
                const rx = cylX * cos - cylY * sin
                const ry = cylX * sin + cylY * cos

                // Add positions + base offset
                positions[i3] = f.x + rx
                positions[i3 + 1] = f.y + ry
                positions[i3 + 2] = cylZ
                pIndex++
            }
        })

        return positions
    }

    // Generate atom shape (refined based on user image - 3D Rutherford model)
    const generateAtom = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)
        // Store animation data if scene exists
        const atomData = sceneRef.current ? {
            orbitIndices: new Float32Array(count),
            angles: new Float32Array(count),
            drifts: new Float32Array(count * 3)
        } : null

        if (atomData) atomData.orbitIndices.fill(-1) // Default to nucleus

        // Particle distribution - roughly 15% for nucleus, rest for orbits
        const nucleusCount = Math.floor(count * 0.15)
        const orbitalCount = count - nucleusCount
        const particlesPerOrbit = Math.floor(orbitalCount / 3)

        let pIndex = 0

        // 1. Nucleus (Dense Sphere)
        for (let i = 0; i < nucleusCount; i++) {
            const i3 = pIndex * 3
            // Dense center, fuzzy edges
            const r = Math.pow(Math.random(), 3) * 0.4
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)

            positions[i3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i3 + 2] = r * Math.cos(phi)
            pIndex++
        }

        // 2. Orbitals (3 Elliptical Rings in 3D)
        const radius = 2.0
        const ellipticity = 0.35 // 1.0 is circle, 0.0 is line
        const thickness = 0.20 // Thicker rings (was 0.08 equivalent)

        for (let orbit = 0; orbit < 3; orbit++) {
            const orbitRotation = (orbit * Math.PI * 2) / 3

            for (let i = 0; i < particlesPerOrbit; i++) {
                if (pIndex >= count) break

                const i3 = pIndex * 3
                const t = (i / particlesPerOrbit) * Math.PI * 2

                // Calculate positions
                const cx = radius * Math.cos(t)
                const cy = radius * Math.sin(t)

                const tiltAngle = Math.acos(ellipticity)
                const tiltedX = cx * ellipticity
                const tiltedY = cy
                const tiltedZ = cx * Math.sin(tiltAngle)

                const cosRot = Math.cos(orbitRotation)
                const sinRot = Math.sin(orbitRotation)

                // Random drift for thickness
                const driftX = (Math.random() - 0.5) * thickness
                const driftY = (Math.random() - 0.5) * thickness
                const driftZ = (Math.random() - 0.5) * thickness

                positions[i3] = (tiltedX * cosRot - tiltedY * sinRot) + driftX
                positions[i3 + 1] = (tiltedX * sinRot + tiltedY * cosRot) + driftY
                positions[i3 + 2] = tiltedZ + driftZ

                // Store animation data
                if (atomData) {
                    atomData.orbitIndices[pIndex] = orbit
                    atomData.angles[pIndex] = t
                    atomData.drifts[i3] = driftX
                    atomData.drifts[i3 + 1] = driftY
                    atomData.drifts[i3 + 2] = driftZ
                }

                pIndex++
            }
        }

        if (sceneRef.current && atomData) {
            sceneRef.current.atomData = atomData
        }

        return positions
    }

    // Generate cube shape with inner rotating 3D Square Pyramid
    const generateCube = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)
        const size = 2

        // Store cube data
        const cubeData = sceneRef.current ? {
            innerShapeIndices: new Int8Array(count)
        } : null

        // Split: 75% Cube, 25% Inner Pyramid
        const cubeCount = Math.floor(count * 0.75)
        const innerCount = count - cubeCount

        let pIndex = 0

        // 1. Outer Cube (Wireframe-ish faces)
        for (let i = 0; i < cubeCount; i++) {
            const i3 = pIndex * 3
            const face = Math.floor(Math.random() * 6)

            switch (face) {
                case 0: // Front
                    positions[i3] = (Math.random() - 0.5) * size
                    positions[i3 + 1] = (Math.random() - 0.5) * size
                    positions[i3 + 2] = size / 2
                    break
                case 1: // Back
                    positions[i3] = (Math.random() - 0.5) * size
                    positions[i3 + 1] = (Math.random() - 0.5) * size
                    positions[i3 + 2] = -size / 2
                    break
                case 2: // Top
                    positions[i3] = (Math.random() - 0.5) * size
                    positions[i3 + 1] = size / 2
                    positions[i3 + 2] = (Math.random() - 0.5) * size
                    break
                case 3: // Bottom
                    positions[i3] = (Math.random() - 0.5) * size
                    positions[i3 + 1] = -size / 2
                    positions[i3 + 2] = (Math.random() - 0.5) * size
                    break
                case 4: // Right
                    positions[i3] = size / 2
                    positions[i3 + 1] = (Math.random() - 0.5) * size
                    positions[i3 + 2] = (Math.random() - 0.5) * size
                    break
                case 5: // Left
                    positions[i3] = -size / 2
                    positions[i3 + 1] = (Math.random() - 0.5) * size
                    positions[i3 + 2] = (Math.random() - 0.5) * size
                    break
            }
            if (cubeData) cubeData.innerShapeIndices[pIndex] = 0
            pIndex++
        }

        // 2. Inner Pyramid (Square-based)
        const innerSize = size * 0.35 // Smaller to stay well inside
        const innerHeight = size * 0.7 // Shorter to keep clearance

        // Vertices
        // Apex (centered, top)
        const vApex = [0, innerHeight * 0.5, 0]
        // Base corners (centered horizontally, bottom)
        const vBase1 = [-innerSize, -innerHeight * 0.5, -innerSize] // Back Left
        const vBase2 = [innerSize, -innerHeight * 0.5, -innerSize]  // Back Right
        const vBase3 = [innerSize, -innerHeight * 0.5, innerSize]   // Front Right
        const vBase4 = [-innerSize, -innerHeight * 0.5, innerSize]  // Front Left

        // 5 Faces: 4 triangles, 1 square base
        const faces = [
            [vApex, vBase1, vBase2], // Side 1
            [vApex, vBase2, vBase3], // Side 2
            [vApex, vBase3, vBase4], // Side 3
            [vApex, vBase4, vBase1], // Side 4
            [vBase1, vBase2, vBase3, vBase4] // Base (Square)
        ]

        for (let i = 0; i < innerCount; i++) {
            const i3 = pIndex * 3
            // Pick a random face
            const faceIdx = Math.floor(Math.random() * 5)
            const face = faces[faceIdx]

            let px, py, pz

            if (faceIdx === 4) {
                // Square base
                const r1 = Math.random()
                const r2 = Math.random()
                px = (r1 - 0.5) * 2 * innerSize
                py = -innerHeight * 0.5
                pz = (r2 - 0.5) * 2 * innerSize
            } else {
                // Triangle sides
                let r1 = Math.random()
                let r2 = Math.random()
                if (r1 + r2 > 1) {
                    r1 = 1 - r1
                    r2 = 1 - r2
                }
                const r3 = 1 - r1 - r2

                px = r1 * face[0][0] + r2 * face[1][0] + r3 * face[2][0]
                py = r1 * face[0][1] + r2 * face[1][1] + r3 * face[2][1]
                pz = r1 * face[0][2] + r2 * face[1][2] + r3 * face[2][2]
            }

            positions[i3] = px
            positions[i3 + 1] = py
            positions[i3 + 2] = pz

            if (cubeData) cubeData.innerShapeIndices[pIndex] = 1
            pIndex++
        }

        if (sceneRef.current && cubeData) {
            sceneRef.current.cubeData = cubeData
        }

        return positions
    }

    // Generate scissors shape
    const generateScissors = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)
        // Store scissors data
        const scissorsData = sceneRef.current ? {
            armIndices: new Int8Array(count)
        } : null

        // Split particles roughly evenly between two scissor arms
        const armCount = Math.floor(count / 2)

        // Scissors Dimensions
        const bladeLength = 2.0
        const bladeWidth = 0.3
        const handleLength = 1.0
        const pivotY = 0.2 // Pivot point offset from center

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            const isArm1 = i < armCount

            // Asymmetry:
            // Arm 1 Handle (Right Handle when open/viewed): Standard circular "Thumb"
            // Arm 2 Handle (Left Handle when open/viewed): Elongated oval "Finger"

            const r = Math.random()
            let x, y, z

            if (r < 0.6) {
                // Blade (60% of particles)
                // Long tapered triangle
                const t = Math.random() // Distance along blade
                const w = (1 - t) * bladeWidth // Taper out

                y = t * bladeLength
                x = (Math.random() - 0.5) * w
                z = (Math.random() - 0.5) * 0.1 // Thin depth
            } else {
                // Handle (40% of particles) - With visual connection neck
                const subR = Math.random()

                if (subR < 0.35) {
                    // Neck / Shaft connecting pivot to ring
                    // Should stop at the TOP of the ring, not center.
                    // Ring centers are at -handleLength (-1.0) and (-1.2).
                    // Top of rings approx: -1.0 + 0.45 = -0.55.

                    const t = Math.random()
                    // Go from 0 down to roughly -0.55 (just touching top of ring)
                    y = -t * 0.55

                    // Taper the neck? Or uniform.
                    const neckWidth = 0.2
                    x = (Math.random() - 0.5) * neckWidth
                    z = (Math.random() - 0.5) * 0.15
                } else {
                    // Ring Loop
                    const angle = Math.random() * Math.PI * 2
                    const ringCy = -handleLength

                    if (isArm1) {
                        // "Thumb" handle - Smaller, rounder
                        const handleRadius = 0.45
                        const rad = handleRadius * (0.7 + 0.3 * Math.random())
                        x = rad * Math.cos(angle)
                        y = ringCy + rad * Math.sin(angle)
                    } else {
                        // "Finger" handle - Larger, oval
                        const handleRadiusX = 0.45
                        const handleRadiusY = 0.65
                        const rad = (0.7 + 0.3 * Math.random())

                        x = handleRadiusX * rad * Math.cos(angle)
                        y = (ringCy - 0.2) + handleRadiusY * rad * Math.sin(angle)
                    }
                    z = (Math.random() - 0.5) * 0.15
                }
            }

            // Assembly Separation
            const gapOffset = 0.06 // X separation
            const xOffset = isArm1 ? -gapOffset : gapOffset

            // Initial "Open" Angle
            const initialOpenAngle = 0.6
            const rotation = isArm1 ? initialOpenAngle : -initialOpenAngle

            const cos = Math.cos(rotation)
            const sin = Math.sin(rotation)

            const rx = (x + xOffset) * cos - y * sin
            const ry = (x + xOffset) * sin + y * cos

            positions[i3] = rx
            positions[i3 + 1] = ry + pivotY
            positions[i3 + 2] = z + (isArm1 ? 0.05 : -0.05) // Z separation

            if (scissorsData) {
                scissorsData.armIndices[i] = isArm1 ? 0 : 1
            }
        }

        if (sceneRef.current && scissorsData) {
            sceneRef.current.scissorsData = scissorsData
        }

        return positions
    }

    // Generate compact camera shape - more refined and realistic
    const generateCamera = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            const t = i / count

            if (t < 0.5) {
                // Main camera body (compact rectangular body)
                const x = (Math.random() - 0.5) * 1.8
                const y = (Math.random() - 0.5) * 1.2
                const z = (Math.random() - 0.5) * 0.8
                positions[i3] = x
                positions[i3 + 1] = y
                positions[i3 + 2] = z
            } else if (t < 0.75) {
                // Lens (protruding cylinder)
                const angle = Math.random() * Math.PI * 2
                const radiusVariation = Math.random()
                const r = 0.25 + radiusVariation * 0.35 // Smaller, more focused lens
                const depth = Math.random() * 0.6

                positions[i3] = r * Math.cos(angle)
                positions[i3 + 1] = 0.1 + r * Math.sin(angle) // Slightly offset upward
                positions[i3 + 2] = 0.5 + depth // Protruding forward
            } else if (t < 0.85) {
                // Viewfinder (small rectangular prism on top)
                const x = -0.4 + Math.random() * 0.4
                const y = 0.7 + Math.random() * 0.25
                const z = -0.2 + Math.random() * 0.3
                positions[i3] = x
                positions[i3 + 1] = y
                positions[i3 + 2] = z
            } else if (t < 0.93) {
                // Flash (small rectangle on top left)
                const x = -0.7 + Math.random() * 0.25
                const y = 0.65 + Math.random() * 0.2
                const z = -0.1 + Math.random() * 0.2
                positions[i3] = x
                positions[i3 + 1] = y
                positions[i3 + 2] = z
            } else {
                // Shutter button and details (top right)
                const x = 0.5 + Math.random() * 0.3
                const y = 0.6 + Math.random() * 0.15
                const z = 0.0 + Math.random() * 0.2
                positions[i3] = x
                positions[i3 + 1] = y
                positions[i3 + 2] = z
            }
        }

        return positions
    }

    // Generate palette shape
    const generatePalette = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)
        const width = 3
        const height = 0.2
        const depth = 2

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            const t = i / count

            if (t < 0.8) {
                // Main palette body
                positions[i3] = (Math.random() - 0.5) * width
                positions[i3 + 1] = (Math.random() - 0.5) * height
                positions[i3 + 2] = (Math.random() - 0.5) * depth
            } else {
                // Thumb hole
                const angle = Math.random() * Math.PI * 2
                const r = 0.3 + Math.random() * 0.1
                positions[i3] = -1 + r * Math.cos(angle)
                positions[i3 + 1] = r * Math.sin(angle)
                positions[i3 + 2] = 0
            }
        }

        return positions
    }

    // Generate plane shape (paper airplane)
    const generatePlane = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)
        // Length 3.0, Wingspan 2.2

        // Vertices
        // Adjust for "narrower" more aerodynamic paper plane look from image
        const vNose = [0, 0, 1.8]
        // Split tail center for "gap" at the top (where wings meet body)
        const gap = 0.15

        // Wing Tail points (inner corners) - higher up
        const vTailLeft = [-gap, 0.2, -1.5]
        const vTailRight = [gap, 0.2, -1.5]

        // Wing Tips (outer corners)
        const vWingLeft = [-1.3, 0.4, -1.8]
        const vWingRight = [1.3, 0.4, -1.8]

        // Bottom keel (fuselage) - The two bottom flaps must MEET at the bottom crease.
        // So we use a single central point for the bottom back.
        // This creates a V-shape or Triangle when viewed from behind.
        const vKeelBack = [0, -0.5, -1.2]

        // Define surfaces (triangles)
        const surfaces = [
            // Left Wing (Top face)
            { a: vNose, b: vWingLeft, c: vTailLeft, weight: 1 },
            // Right Wing (Top face)
            { a: vNose, b: vWingRight, c: vTailRight, weight: 1 },

            // Left Fuselage (Side/Bottom)
            // Connect Nose to Central Keel to TailLeft
            { a: vNose, b: vKeelBack, c: vTailLeft, weight: 0.6 },

            // Right Fuselage (Side/Bottom)
            // Connect Nose to Central Keel to TailRight
            { a: vNose, b: vKeelBack, c: vTailRight, weight: 0.6 }

            // Result: Fuselage is connected at the bottom (KeelBack), but open at the top (TailLeft/Right).
            // Forms a triangular hull.
        ]

        // Calculate total weight to distribute particles
        // Actually simpler to just pick a random surface based on weight
        const totalWeight = surfaces.reduce((sum, s) => sum + s.weight, 0)

        let pIndex = 0

        // Loop to fill particles
        while (pIndex < count) {
            // Pick surface
            let r = Math.random() * totalWeight
            let surface = surfaces[0]
            for (let s of surfaces) {
                if (r < s.weight) {
                    surface = s
                    break
                }
                r -= s.weight
            }

            // Random point in triangle
            // P = (1 - sqrt(r1)) * A + (sqrt(r1) * (1 - r2)) * B + (sqrt(r1) * r2) * C
            const r1 = Math.random()
            const r2 = Math.random()

            const sqR1 = Math.sqrt(r1)
            const wA = 1 - sqR1
            const wB = sqR1 * (1 - r2)
            const wC = sqR1 * r2

            const px = wA * surface.a[0] + wB * surface.b[0] + wC * surface.c[0]
            const py = wA * surface.a[1] + wB * surface.b[1] + wC * surface.c[1]
            const pz = wA * surface.a[2] + wB * surface.b[2] + wC * surface.c[2]

            // Add slight noise for "paper texture" / thickness
            const noise = 0.02

            positions[pIndex * 3] = px + (Math.random() - 0.5) * noise
            positions[pIndex * 3 + 1] = py + (Math.random() - 0.5) * noise
            positions[pIndex * 3 + 2] = pz + (Math.random() - 0.5) * noise

            pIndex++
        }

        return positions
    }

    // Scale shape positions to match noise cloud size (radius ~2.5)
    const scaleShapePositions = (positions: Float32Array, scaleFactor: number): Float32Array => {
        const scaled = new Float32Array(positions.length)
        for (let i = 0; i < positions.length; i++) {
            scaled[i] = positions[i] * scaleFactor
        }
        return scaled
    }

    // Get target positions based on shape with appropriate particle count
    const getTargetPositions = (shape: MorphTarget, count: number): Float32Array => {
        let positions: Float32Array
        let scaleFactor = 1

        switch (shape) {
            case 'atom':
                positions = generateAtom(count)
                scaleFactor = 1.0 // Increased size
                break
            case 'camera':
                positions = generateCamera(count)
                scaleFactor = 1.2 // Camera is slightly smaller
                break
            case 'cube':
                positions = generateCube(count)
                scaleFactor = 1.5 // Cube needs scaling up
                break
            case 'curation':
                positions = generateScissors(count)
                scaleFactor = 1.2 // Size adjustment
                break
            case 'palette':
                positions = generatePalette(count)
                scaleFactor = 1.0 // Palette is similar size
                break
            case 'plane':
                positions = generatePlane(count)
                scaleFactor = 1.6 // Larger size
                break
            case 'hand':
                positions = generateHand(count)
                scaleFactor = 1.1
                break
            default:
                return generateNoiseCloud(count)
        }

        return scaleShapePositions(positions, scaleFactor)
    }

    useEffect(() => {
        if (!containerRef.current) return

        const container = containerRef.current
        const width = container.clientWidth
        const height = container.clientHeight

        // Setup scene
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
        camera.position.z = 6

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        })
        renderer.setSize(width, height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        container.appendChild(renderer.domElement)

        // Create particles
        const geometry = new THREE.BufferGeometry()
        const basePositions = generateNoiseCloud(particleCount)
        geometry.setAttribute('position', new THREE.BufferAttribute(basePositions, 3))

        // Create particle material with lower base opacity
        const material = new THREE.PointsMaterial({
            size: 0.02,
            color: color,
            transparent: true,
            opacity: 1.0, // Will be controlled per-particle via attribute
            vertexColors: false,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        })

        // Create opacity array - first 3000 particles more visible, last 3000 very subtle
        const opacities = new Float32Array(particleCount)
        for (let i = 0; i < particleCount; i++) {
            // first 3000: 0.35 opacity, last 3000: 0.08 opacity (very subtle)
            opacities[i] = i < 3000 ? 0.35 : 0.08
        }
        geometry.setAttribute('alpha', new THREE.BufferAttribute(opacities, 1))

        // Enable per-particle opacity and movement
        material.onBeforeCompile = (shader) => {
            // Save shader to ref for uniform updates
            if (sceneRef.current) {
                sceneRef.current.materialShader = shader
            }

            shader.uniforms.uTime = { value: 0 }
            shader.uniforms.uNoiseStrength = { value: 1 }

            shader.vertexShader = 'uniform float uTime;\nuniform float uNoiseStrength;\n' + shader.vertexShader

            shader.vertexShader = shader.vertexShader.replace(
                '#include <color_pars_vertex>',
                '#include <color_pars_vertex>\nattribute float alpha;\nvarying float vAlpha;'
            )

            // Add internal movement to particles
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                
                // Add gentle wandering motion
                float t = uTime * 0.5;
                float noiseX = sin(position.y * 2.0 + t) * 0.1 + cos(position.z * 1.0 + t * 0.5) * 0.05;
                float noiseY = cos(position.x * 2.0 + t) * 0.1 + sin(position.z * 1.0 + t * 0.5) * 0.05;
                float noiseZ = sin(position.x * 1.0 + t) * 0.05 + cos(position.y * 1.0 + t * 0.3) * 0.05;
                
                transformed += vec3(noiseX, noiseY, noiseZ) * uNoiseStrength;
                `
            )

            shader.vertexShader = shader.vertexShader.replace(
                '#include <color_vertex>',
                '#include <color_vertex>\nvAlpha = alpha;'
            )
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <color_pars_fragment>',
                '#include <color_pars_fragment>\nvarying float vAlpha;'
            )
            shader.fragmentShader = shader.fragmentShader.replace(
                'vec4 diffuseColor = vec4( diffuse, opacity );',
                'vec4 diffuseColor = vec4( diffuse, opacity * vAlpha );'
            )
        }

        const particles = new THREE.Points(geometry, material)
        scene.add(particles)

        // Store scene data
        sceneRef.current = {
            renderer,
            scene,
            camera,
            particles,
            basePositions: basePositions.slice(),
            targetPositions: basePositions.slice(),
            currentTarget: 'default',
            animationProgress: 1,
            frameId: null
        }

        // Animation loop
        let lastTime = performance.now()
        let currentRotationSpeed = 0
        let currentNoiseStrength = 1

        const animate = () => {
            if (!sceneRef.current) return

            const currentTime = performance.now()
            const deltaTime = (currentTime - lastTime) / 1000
            lastTime = currentTime

            // Determine target states based on shape
            const isDefault = sceneRef.current.currentTarget === 'default'
            const isAtom = sceneRef.current.currentTarget === 'atom'
            const isCube = sceneRef.current.currentTarget === 'cube'
            const isScissors = sceneRef.current.currentTarget === 'curation'
            const isHand = sceneRef.current.currentTarget === 'hand'

            // Shapes rotate, default doesn't
            const targetRotationSpeed = isDefault || isHand ? 0 : 0.1
            // Default has noise, shapes don't (to preserve shape clarity)
            const targetNoiseStrength = isDefault ? 1.0 : 0.0

            // Smoothly interpolate values
            currentRotationSpeed += (targetRotationSpeed - currentRotationSpeed) * deltaTime * 2.0
            currentNoiseStrength += (targetNoiseStrength - currentNoiseStrength) * deltaTime * 2.0

            // Update shader uniforms
            if (sceneRef.current.materialShader) {
                sceneRef.current.materialShader.uniforms.uTime.value = currentTime * 0.001
                sceneRef.current.materialShader.uniforms.uNoiseStrength.value = currentNoiseStrength
            }

            // ATOM SPECIFIC ANIMATION
            if (isAtom && sceneRef.current.atomData) {
                const { orbitIndices, angles, drifts } = sceneRef.current.atomData
                const positions = sceneRef.current.targetPositions // We update target positions!

                // Atom config
                const radius = 2.0
                const ellipticity = 0.35
                const atomScale = 1.0 // Must match getTargetPositions scale

                // Speed for each ring (can be different)
                const speeds = [0.8, -0.8, 0.8] // Rings 0 and 2 one way, 1 other way

                for (let i = 0; i < particleCount; i++) {
                    const orbitIdx = orbitIndices[i]
                    if (orbitIdx >= 0) { // It is an orbit particle
                        const i3 = i * 3

                        // Update angle
                        angles[i] += speeds[orbitIdx] * deltaTime
                        const t = angles[i]

                        // Re-calculate position (Base logic from generateAtom)
                        const orbitRotation = (orbitIdx * Math.PI * 2) / 3

                        const cx = radius * Math.cos(t)
                        const cy = radius * Math.sin(t)

                        const tiltAngle = Math.acos(ellipticity)
                        const tiltedX = cx * ellipticity
                        const tiltedY = cy
                        const tiltedZ = cx * Math.sin(tiltAngle)

                        const cosRot = Math.cos(orbitRotation)
                        const sinRot = Math.sin(orbitRotation)

                        // Apply scale factor here since we are writing directly to targetPositions
                        // Note: generateAtom returns unscaled, scaleShapePositions scales it.
                        // But here we are bypassing scaleShapePositions for the update.
                        // So we must apply atomScale manually.

                        positions[i3] = ((tiltedX * cosRot - tiltedY * sinRot) + drifts[i3]) * atomScale
                        positions[i3 + 1] = ((tiltedX * sinRot + tiltedY * cosRot) + drifts[i3 + 1]) * atomScale
                        positions[i3 + 2] = (tiltedZ + drifts[i3 + 2]) * atomScale
                    }
                }
                // If animation is fully morphed, we need to sync these new target positions to current attributes
                if (sceneRef.current.animationProgress >= 1) {
                    const currentPos = sceneRef.current.particles.geometry.attributes.position.array as Float32Array
                    currentPos.set(sceneRef.current.targetPositions)
                    sceneRef.current.particles.geometry.attributes.position.needsUpdate = true
                }
            }

            // CUBE SPECIFIC ANIMATION (Rotating Inner Pyramid)
            if (isCube && sceneRef.current.cubeData) {
                const { innerShapeIndices } = sceneRef.current.cubeData
                const positions = sceneRef.current.targetPositions

                // Rotate around Y axis (Horizontal Rotation) - Opposite direction
                // Global rotation is ~0.1 positive. Use negative speed for opposite spin.
                const rotSpeed = -2.0
                const cosRot = Math.cos(rotSpeed * deltaTime)
                const sinRot = Math.sin(rotSpeed * deltaTime)

                // We apply this incremental rotation to the current target positions
                for (let i = 0; i < particleCount; i++) {
                    if (innerShapeIndices[i] === 1) { // It's part of the inner shape
                        const i3 = i * 3

                        // We are rotating the POINT relative to the center (0,0,0)
                        // Rotate x, z around y axis
                        const x = positions[i3]
                        const z = positions[i3 + 2]

                        // Rotation matrix for Y axis
                        positions[i3] = x * cosRot - z * sinRot
                        positions[i3 + 2] = x * sinRot + z * cosRot
                    }
                }

                // Sync if fully morphed
                if (sceneRef.current.animationProgress >= 1) {
                    const currentPos = sceneRef.current.particles.geometry.attributes.position.array as Float32Array
                    currentPos.set(sceneRef.current.targetPositions)
                    sceneRef.current.particles.geometry.attributes.position.needsUpdate = true
                }
            }

            // SCISSORS SPECIFIC ANIMATION (Cutting Motion)
            if (isScissors && sceneRef.current.scissorsData) {
                const { armIndices } = sceneRef.current.scissorsData
                const positions = sceneRef.current.targetPositions

                // Oscillating motion
                // Speed of cut
                const cutSpeed = 5.0
                const cutAmplitude = 0.5 // Radians for range of motion
                // We want them to open and close. 
                // We calculated them in an "open" position approx 0.6 rads. 
                // Let's sweep current offset from -0.3 to +0.3

                // Calculate oscillation delta
                // We need to apply 'delta' rotation to revert to neutral, then apply new rotation
                // Actually, easier: re-calculate position from "Base" parameters?
                // But we don't store base parameters per particle easily (radius, distance along blade, etc).
                // Strategy: We can apply incremental rotation, but oscillating incremental is tricky without drift.

                // BETTER STRATEGY: 
                // Since we need to oscillate, we should compute the *total* desired angle at this time frame, 
                // and rotate the *current* points to match? No, points are already rotated.
                // Re-generating from scratch is expensive in a frame loop? No, 6000 particles is cheap for JS these days.
                // Let's Try: Rotating back by 'previous frame angle' and forward by 'new frame angle'?
                // Or just: Rotate by (newAngle - oldAngle).

                // Angle logic:
                // Base Open Angle = 0.6
                // Anim Offset = sin(time) * 0.4
                // Current Absolute Angle = 0.6 + Anim Offset.

                // Let's track "currentAnimAngle" in a mutable var outside or derive from time?
                // We can derive from time.
                const time = currentTime * 0.001
                const phase = Math.sin(time * 5.0)

                // Current desired offset from the "baked in" position.
                // The baked position has `initialOpenAngle = 0.6`.
                // We want to range from "Closed" (angle near 0) to "Open" (angle 0.6 or more).
                // Let's say we want angle to oscillate between 0.1 and 0.8
                // Baked is 0.6.
                // Desired Angle = 0.45 + 0.35 * sin(time)
                // Delta Angle required = (Desired - PreviousDesired)

                // To avoid drift errors with incremental float math, normally we'd store "original unrotated" positions.
                // But for now, let's use incremental with `lastTime` logic.

                // Store `lastPhase` for scissors? We don't have a persistent state for it easily without modifying ref.
                // Let's assume (angle - prevAngle) is safe enough for short durations. 
                // Or better: Let's rotate 'back' the amount we rotated 'forward' last frame? No we don't know it.

                // Let's use `Math.sin(time)`. 
                // Angle(t) = 0.2 * sin(time).
                // Angle(t - dt) = 0.2 * sin(time - dt).
                // dAngle = Angle(t) - Angle(t - dt).

                // Oscillating motion: Fully close to Open
                // Initial state in generateScissors has arms at +/- 0.6 radians (Open).
                // We want to oscillate the arm angle between ~0.05 (Closed, handles touching) and ~0.55 (Open).
                // Start near open (0.55) so no jump at t=0.

                const scissorsTime = currentTime * 0.001
                const speed = 4.0

                // Angle of ONE arm relative to vertical axis
                // Range: [0.05, 0.55]
                // 0.3 mid, +/- 0.25
                // Cos starts at 1 -> 0.3 + 0.25 = 0.55 (Open)
                const armAngleNow = 0.3 + 0.25 * Math.cos(scissorsTime * speed)
                const armAnglePrev = 0.3 + 0.25 * Math.cos((scissorsTime - deltaTime) * speed)

                // Change in angle this frame
                // If closing (Now < Prev), dAngle is negative.
                const dAngle = armAngleNow - armAnglePrev

                // Arm 1 (Left Blade, +Angle): rotates by +dAngle
                // Arm 2 (Right Blade, -Angle): rotates by -dAngle

                // Arm 1 rotates +dAngle
                // Arm 2 rotates -dAngle (opposite)

                const cos1 = Math.cos(dAngle)
                const sin1 = Math.sin(dAngle)
                const cos2 = Math.cos(-dAngle)
                const sin2 = Math.sin(-dAngle)

                const pivotY = 0.2 // Must match generated pivot offset

                for (let i = 0; i < particleCount; i++) {
                    const armIdx = armIndices[i]
                    const i3 = i * 3

                    // Translate to pivot (subtract pivotY)
                    let x = positions[i3]
                    let y = positions[i3 + 1] - pivotY
                    let z = positions[i3 + 2]

                    // Rotate
                    let nx, ny
                    if (armIdx === 0) { // Arm 1
                        nx = x * cos1 - y * sin1
                        ny = x * sin1 + y * cos1
                    } else { // Arm 2
                        nx = x * cos2 - y * sin2
                        ny = x * sin2 + y * cos2
                    }

                    // Translate back
                    positions[i3] = nx
                    positions[i3 + 1] = ny + pivotY
                    positions[i3 + 2] = z
                }

                // Sync if fully morphed
                if (sceneRef.current.animationProgress >= 1) {
                    const currentPos = sceneRef.current.particles.geometry.attributes.position.array as Float32Array
                    currentPos.set(sceneRef.current.targetPositions)
                    sceneRef.current.particles.geometry.attributes.position.needsUpdate = true
                }
            }


            // Smooth animation progress
            if (sceneRef.current.animationProgress < 1) {
                sceneRef.current.animationProgress = Math.min(
                    1,
                    sceneRef.current.animationProgress + deltaTime * 1.2
                )

                // Interpolate positions
                const positions = sceneRef.current.particles.geometry.attributes.position.array as Float32Array
                const opacities = sceneRef.current.particles.geometry.attributes.alpha.array as Float32Array
                const ease = easeInOutCubic(sceneRef.current.animationProgress)

                // Define target opacities based on current target
                const isShape = sceneRef.current.currentTarget !== 'default'

                for (let i = 0; i < particleCount; i++) {
                    // Position interpolation
                    const i3 = i * 3
                    positions[i3] = sceneRef.current.basePositions[i3] +
                        (sceneRef.current.targetPositions[i3] - sceneRef.current.basePositions[i3]) * ease
                    positions[i3 + 1] = sceneRef.current.basePositions[i3 + 1] +
                        (sceneRef.current.targetPositions[i3 + 1] - sceneRef.current.basePositions[i3 + 1]) * ease
                    positions[i3 + 2] = sceneRef.current.basePositions[i3 + 2] +
                        (sceneRef.current.targetPositions[i3 + 2] - sceneRef.current.basePositions[i3 + 2]) * ease

                    // Opacity interpolation
                    const baseOpacity = i < 3000 ? 0.35 : 0.08
                    const shapeOpacity = i < 3000 ? 0.55 : 0.45 // Higher opacity for shapes
                    const targetOpacity = isShape ? shapeOpacity : baseOpacity

                    opacities[i] = opacities[i] + (targetOpacity - opacities[i]) * ease * 0.3
                }

                sceneRef.current.particles.geometry.attributes.position.needsUpdate = true
                sceneRef.current.particles.geometry.attributes.alpha.needsUpdate = true
            }

            // Apply position offset (e.g. Plane needs to be offset Right and Up)
            const targetMeshPos = new THREE.Vector3(0, 0, 0)
            if (sceneRef.current.currentTarget === 'plane') {
                targetMeshPos.set(0.8, 0.3, 0) // Shift Right (1.5) and Up (1.0)
            }
            sceneRef.current.particles.position.lerp(targetMeshPos, deltaTime * 3.0)

            // Apply rotation
            if (isDefault) {
                // Smoothly return to nearest aligned rotation (0, 180, 360, etc.)
                // This ensures the wide cloud faces the camera without spinning back wildly
                const currentRot = sceneRef.current.particles.rotation.y
                const targetRot = Math.round(currentRot / Math.PI) * Math.PI

                // Interpolate towards the nearest flat angle
                sceneRef.current.particles.rotation.y += (targetRot - currentRot) * deltaTime * 2.0

                // Return to 0 tilt (X and Z)
                sceneRef.current.particles.rotation.x *= 0.95
                sceneRef.current.particles.rotation.z *= 0.95
            } else if (isHand) {
                // Waving animation for hand

                // 1. Vertical 3D Rotation (Y-Axis Swivel)
                // Rotates the hand left and right to show 3D depth ("dikeyde 3d rotate")
                sceneRef.current.particles.rotation.y = Math.sin(currentTime * 0.0015) * 0.6

                // 2. Tie Z-Axis Wave to Y-Rotation for natural feel?
                // Or keep independent. Independent is fine.
                const waveAngle = Math.sin(currentTime * 0.004) * 0.25 // +/- ~15 degrees
                sceneRef.current.particles.rotation.z = waveAngle

                // 3. Slight X-Axis breathing
                sceneRef.current.particles.rotation.x = Math.sin(currentTime * 0.001) * 0.05
            } else if (sceneRef.current.currentTarget === 'plane') {
                // Gliding animation for paper plane

                // --- PLANE CONFIGURATION ---
                // Adjust these values to change the plane's flight path
                const config = {
                    // Base Angles (Radians)
                    baseX: 0.5,       // Pitch: Positive = Nose Down (Tail up), reveals Top surface strongly
                    baseY: Math.PI - 0.6, // Yaw: Facing diagonally LEFT
                    baseZ: -0.1,      // Roll: Banking LEFT

                    // Animation Intensity (Sway amount)
                    swayX: 0.05,      // Pitch fluctuation
                    swayY: 0.2,       // Yaw fluctuation
                    swayZ: 0.15       // Roll fluctuation
                }
                // ---------------------------

                const time = currentTime * 0.001

                // Roll (Z): Gentle sway
                const roll = Math.sin(time * 1.5) * config.swayZ
                sceneRef.current.particles.rotation.z = config.baseZ + roll

                // Pitch (X): Base ascent + slight fluctuation
                sceneRef.current.particles.rotation.x = config.baseX + Math.sin(time * 1.0) * config.swayX

                // Yaw (Y): Coupled with Roll for realism
                // We add roll * 0.5 to yaw to simulate banking turn logic
                sceneRef.current.particles.rotation.y = config.baseY + Math.sin(time * 0.5) * config.swayY + roll * 0.5
            } else {
                // Continually rotate for shapes
                sceneRef.current.particles.rotation.y += currentRotationSpeed * deltaTime

                // Slight tilt effect for 3D feel
                sceneRef.current.particles.rotation.x = Math.sin(currentTime * 0.0003) * 0.1
            }

            renderer.render(scene, camera)
            sceneRef.current.frameId = requestAnimationFrame(animate)
        }

        animate()

        // Handle resize
        const handleResize = () => {
            if (!containerRef.current || !sceneRef.current) return
            const width = containerRef.current.clientWidth
            const height = containerRef.current.clientHeight

            sceneRef.current.camera.aspect = width / height
            sceneRef.current.camera.updateProjectionMatrix()
            sceneRef.current.renderer.setSize(width, height)
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            if (sceneRef.current?.frameId) {
                cancelAnimationFrame(sceneRef.current.frameId)
            }
            renderer.dispose()
            geometry.dispose()
            material.dispose()
            container.removeChild(renderer.domElement)
        }
    }, [particleCount])

    // Handle target changes - simple position morphing with fixed particle count
    useEffect(() => {
        if (!sceneRef.current) return

        // Generate target positions (always use 6000 particles)
        console.log('ParticleMorph: target changed to', target)
        const newTarget = getTargetPositions(target, particleCount)

        if (target === 'curation') {
            console.log('ParticleMorph: generated curation/scissors data', sceneRef.current.scissorsData)
        }

        // Sync base positions with current state
        sceneRef.current.basePositions = sceneRef.current.particles.geometry.attributes.position.array.slice() as Float32Array
        sceneRef.current.targetPositions = newTarget
        sceneRef.current.currentTarget = target
        sceneRef.current.animationProgress = 0
    }, [target, particleCount])

    // Handle color changes
    useEffect(() => {
        if (!sceneRef.current) return
        const material = sceneRef.current.particles.material as THREE.PointsMaterial
        material.color.setHex(color)
    }, [color])

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s' }}
        />
    )
}

// Easing function for smooth animations - quintic for very smooth start and end
function easeInOutCubic(t: number): number {
    // Quintic easing (t^5) - much smoother than cubic
    return t < 0.5
        ? 16 * t * t * t * t * t
        : 1 - Math.pow(-2 * t + 2, 5) / 2
}
