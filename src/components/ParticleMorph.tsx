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
        clockData?: {
            handIndices: Int8Array // 0: None, 1: Hour, 2: Minute, 3: Second
            baseHandPositions: Float32Array // Store base positions for rotation
        }
        cameraData?: {
            shutterIndices: Int8Array // 1 for shutter button, 0 for other parts
            baseShutterPositions?: Float32Array // Store base positions for animation
            startTime?: number
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

    // Generate wall clock shape
    const generateClock = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)
        // Store clock data
        const clockData = sceneRef.current ? {
            handIndices: new Int8Array(count),
            baseHandPositions: new Float32Array(count * 3)
        } : null

        if (clockData) clockData.handIndices.fill(0)

        let pIndex = 0

        // 1. Clock Face / Rim (Increased to 55% to absorb extra particles)
        const faceCount = Math.floor(count * 0.55)
        // Multiple rings for thickness
        const rimRadius = 2.0
        const rimThickness = 0.15

        for (let i = 0; i < faceCount; i++) {
            const i3 = pIndex * 3
            const angle = Math.random() * Math.PI * 2

            // Distribute mainly on the rim, some separate rings for style
            const t = Math.random()
            let r = rimRadius

            if (t < 0.7) {
                // Main outer rim
                r = rimRadius + (Math.random() - 0.5) * rimThickness
            } else if (t < 0.85) {
                // Inner ring detail
                r = rimRadius * 0.9 + (Math.random() - 0.5) * 0.05
            } else {
                // Center hub cap - slightly reduced probability
                if (Math.random() > 0.5) {
                    r = Math.random() * 0.15
                } else {
                    // Add to outer rim if skipped
                    r = rimRadius + (Math.random() - 0.5) * rimThickness
                }
            }

            positions[i3] = r * Math.cos(angle)
            positions[i3 + 1] = r * Math.sin(angle)
            positions[i3 + 2] = (Math.random() - 0.5) * 0.1 // Flat

            pIndex++
        }

        // 2. Hour Markers (10% of particles)
        const markerCount = Math.floor(count * 0.10)
        const markersPerHour = Math.floor(markerCount / 12)

        for (let h = 0; h < 12; h++) {
            const hAngle = (h / 12) * Math.PI * 2

            // Marker shape: short line or block
            const isCardinal = (h % 3 === 0) // 12, 3, 6, 9 are bigger

            for (let i = 0; i < markersPerHour; i++) {
                if (pIndex >= count) break
                const i3 = pIndex * 3

                // Line extending inwards from rim
                const len = isCardinal ? 0.4 : 0.2
                const distObj = rimRadius * 0.85 + Math.random() * len

                // Add some thickness/noise
                const wNoise = (Math.random() - 0.5) * 0.08

                // Rotated position
                const r = distObj
                const angleOffset = wNoise / r

                positions[i3] = r * Math.cos(hAngle + angleOffset)
                positions[i3 + 1] = r * Math.sin(hAngle + angleOffset)
                positions[i3 + 2] = (Math.random() - 0.5) * 0.1

                pIndex++
            }
        }

        // 3. Hands - Explicit Counts
        const hCount = 500
        const mCount = 700
        const sCount = 200 // Reduced count for thinner look

        // Function to generate hand particles pointing UP (Positive Y)
        const generateHand = (c: number, width: number, length: number, type: number, zOffset: number) => {
            for (let i = 0; i < c; i++) {
                if (pIndex >= count) break
                const i3 = pIndex * 3

                // Rectangle pointing up
                const x = (Math.random() - 0.5) * width
                const y = Math.random() * length
                const z = zOffset + (Math.random() - 0.5) * 0.05

                positions[i3] = x
                positions[i3 + 1] = y
                positions[i3 + 2] = z

                if (clockData) {
                    clockData.handIndices[pIndex] = type
                    // Store BASE Position (Unrotated)
                    clockData.baseHandPositions[i3] = x
                    clockData.baseHandPositions[i3 + 1] = y
                    clockData.baseHandPositions[i3 + 2] = z
                }

                pIndex++
            }
        }

        // Hour Hand: Short, Thick
        generateHand(hCount, 0.25, 1.1, 1, 0.1)

        // Minute Hand: Long, Medium
        generateHand(mCount, 0.15, 1.7, 2, 0.15)

        // Second Hand: Longest -> Shortened to 1.6, VERY Thin
        generateHand(sCount, 0.025, 1.6, 3, 0.2) // Length 1.9 -> 1.6

        // 4. Background Scatter (Remaining Particles - Reduced pool due to increased Rim)
        // Fill the clock face slightly to give it volume/surface, behind hands
        while (pIndex < count) {
            const i3 = pIndex * 3

            // Random point inside inner rim (random distribution in circle)
            // r = R * sqrt(random) for uniform area 
            const r = Math.sqrt(Math.random()) * (rimRadius * 0.85)
            const theta = Math.random() * Math.PI * 2

            positions[i3] = r * Math.cos(theta)
            positions[i3 + 1] = r * Math.sin(theta)
            // Slightly behind hands (z < 0)
            positions[i3 + 2] = -0.05 + (Math.random() - 0.5) * 0.05

            pIndex++
        }

        if (sceneRef.current && clockData) {
            sceneRef.current.clockData = clockData
        }

        return positions
    }

    // Generate simple geometric camera - rounded rectangle with subtle edges
    const generateCamera = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)
        // Store camera data for shutter button animation
        const cameraData = sceneRef.current ? {
            shutterIndices: new Int8Array(count)
        } : null

        if (cameraData) cameraData.shutterIndices.fill(0) // Default: not shutter

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            const t = i / count

            if (t < 0.6) {
                // Camera body - HYBRID: SURFACE SHELL + VOLUME
                // This creates a defined shape like the product box, but solid inside

                const width = 1.8
                const height = 1.0
                const depth = 0.35
                const cornerRadius = 0.08

                const isSurface = Math.random() < 0.55 // 55% Surface (defined shape), 45% Volume (solid fill)

                let x, y, z;
                let valid = false;
                let attempts = 0;

                while (!valid && attempts < 15) {
                    attempts++;

                    if (isSurface) {
                        // Generate point on the SURFACE (Shell)
                        const face = Math.random();

                        if (face < 0.4) { // Front Face
                            x = (Math.random() - 0.5) * width;
                            y = (Math.random() - 0.5) * height;
                            z = depth / 2;
                        } else if (face < 0.8) { // Back Face
                            x = (Math.random() - 0.5) * width;
                            y = (Math.random() - 0.5) * height;
                            z = -depth / 2;
                        } else { // Sides (Rim)
                            const side = Math.floor(Math.random() * 4); // 0=Top, 1=Right, 2=Bottom, 3=Left
                            if (side === 0) { // Top
                                x = (Math.random() - 0.5) * width;
                                y = height / 2;
                                z = (Math.random() - 0.5) * depth;
                            } else if (side === 1) { // Right
                                x = width / 2;
                                y = (Math.random() - 0.5) * height;
                                z = (Math.random() - 0.5) * depth;
                            } else if (side === 2) { // Bottom
                                x = (Math.random() - 0.5) * width;
                                y = -height / 2;
                                z = (Math.random() - 0.5) * depth;
                            } else { // Left
                                x = -width / 2;
                                y = (Math.random() - 0.5) * height;
                                z = (Math.random() - 0.5) * depth;
                            }
                        }
                    } else {
                        // Generate point in the VOLUME (Interior)
                        x = (Math.random() - 0.5) * width;
                        y = (Math.random() - 0.5) * height;
                        z = (Math.random() - 0.5) * depth;
                    }

                    // Apply Rounded Corner Logic
                    const absX = Math.abs(x!);
                    const absY = Math.abs(y!);
                    const xCornerStart = width / 2 - cornerRadius;
                    const yCornerStart = height / 2 - cornerRadius;

                    if (absX > xCornerStart && absY > yCornerStart) {
                        // In a corner region
                        const xDist = absX - xCornerStart;
                        const yDist = absY - yCornerStart;

                        // Check if outside rounded corner
                        if (xDist * xDist + yDist * yDist > cornerRadius * cornerRadius) {
                            valid = false; // Outside, retry
                            continue;
                        }

                        // If surface point in corner, snap to curve
                        if (isSurface && Math.abs(z!) < depth / 2) {
                            const angle = Math.atan2(yDist, xDist);
                            const newDist = cornerRadius;

                            const signX = x! > 0 ? 1 : -1;
                            const signY = y! > 0 ? 1 : -1;

                            x = (xCornerStart + newDist * Math.cos(angle)) * signX;
                            y = (yCornerStart + newDist * Math.sin(angle)) * signY;
                        }
                    }

                    valid = true;
                }

                positions[i3] = x!;
                positions[i3 + 1] = y!;
                positions[i3 + 2] = z!;
            } else if (t < 0.64) {
                // Lens BASE - flush with camera body (attachment ring)
                const angle = Math.random() * Math.PI * 2
                const r = 0.38 + Math.random() * 0.05 // Base ring radius
                positions[i3] = r * Math.cos(angle)
                positions[i3 + 1] = r * Math.sin(angle)
                positions[i3 + 2] = 0.175 + Math.random() * 0.05 // Starts at camera edge
            } else if (t < 0.74) {
                // Lens APERTURE (Diaphragm) - Spiral pattern inside lens
                const bladeCount = 6 // 6 aperture blades
                const blade = Math.floor(Math.random() * bladeCount)
                const param = Math.random()

                // Spiral aperture shape
                const angleOffset = (blade / bladeCount) * Math.PI * 2
                const spiralAngle = angleOffset + param * (Math.PI / 1.5) // Curved blade
                const r = 0.05 + param * 0.28 // From center to edge

                positions[i3] = r * Math.cos(spiralAngle)
                positions[i3 + 1] = r * Math.sin(spiralAngle)
                positions[i3 + 2] = 0.25 + param * 0.1 // Slight cone shape inwards

                if (cameraData) cameraData.shutterIndices[i] = 2 // Mark as aperture blade
            } else if (t < 0.83) {
                // Lens FRONT - tip ring (connected to middle)
                const angle = Math.random() * Math.PI * 2
                const r = 0.34 + Math.random() * 0.06 // Front rim ring
                positions[i3] = r * Math.cos(angle)
                positions[i3 + 1] = r * Math.sin(angle)
                positions[i3 + 2] = 0.52 + Math.random() * 0.04 // Front tip
            } else if (t < 0.92) {
                // Rangefinder window - mounted lower on camera body
                const x = 0.5 + Math.random() * 0.25 // Within camera width
                const y = 0.15 + Math.random() * 0.2 // Lower position
                const z = 0.16 + Math.random() * 0.08 // Closer to body, mounted on top
                positions[i3] = x
                positions[i3 + 1] = y
                positions[i3 + 2] = z
            } else {
                // Shutter button - REDUCED particles
                const length = Math.random() * 0.15 // Cylinder length (horizontal)
                const angle = Math.random() * Math.PI * 2
                const r = Math.random() * 0.06 // Smaller radius for button

                positions[i3] = -0.7 + length // X position varies along length
                positions[i3 + 1] = 0.55 + r * Math.cos(angle) // Y - circular cross section
                positions[i3 + 2] = 0.05 + r * Math.sin(angle) // Z - circular cross section

                if (cameraData) cameraData.shutterIndices[i] = 1 // Mark as shutter
            }
        }

        if (sceneRef.current && cameraData) {
            sceneRef.current.cameraData = cameraData
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

            positions[pIndex * 3] = -(px + (Math.random() - 0.5) * noise) // Invert X for 180 deg rotation
            positions[pIndex * 3 + 1] = py + (Math.random() - 0.5) * noise
            positions[pIndex * 3 + 2] = -(pz + (Math.random() - 0.5) * noise) // Invert Z for 180 deg rotation

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
                scaleFactor = 1.95 // Camera - larger size (increased by ~20%)
                break
            case 'cube':
                positions = generateCube(count)
                scaleFactor = 1.5 // Cube needs scaling up
                break
            case 'curation':
                positions = generateClock(count)
                scaleFactor = 1.0 // Size adjustment
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
            const isClock = sceneRef.current.currentTarget === 'curation'
            const isHand = sceneRef.current.currentTarget === 'hand'

            // Shapes rotate, default doesn't. Atom/Clock/Hand have specific logic -> 0 base speed
            const targetRotationSpeed = isDefault || isHand || isAtom ? 0 : 0.1
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

            // CLOCK SPECIFIC ANIMATION
            if (isClock && sceneRef.current.clockData) {
                const { handIndices, baseHandPositions } = sceneRef.current.clockData
                const positions = sceneRef.current.targetPositions

                // Get Real Time
                const date = new Date()
                const s = date.getSeconds() + date.getMilliseconds() / 1000
                const m = date.getMinutes() + s / 60
                const h = date.getHours() % 12 + m / 60

                // Calculate Rotation Angles (Radians)
                // 12 o'clock = 0 rads relative to our UP interval? 
                // In generating, we pointed Hands UP (Y+).
                // Rotation is clockwise (negative around Z).

                // Seconds: 60s = 360deg
                const sAngle = -(s / 60) * Math.PI * 2
                // Minutes: 60m = 360deg
                const mAngle = -(m / 60) * Math.PI * 2
                // Hours: 12h = 360deg
                const hAngle = -(h / 12) * Math.PI * 2

                for (let i = 0; i < particleCount; i++) {
                    const hType = handIndices[i]
                    if (hType > 0) { // Moving hand particle
                        const i3 = i * 3

                        // Pick angle
                        let angle = 0
                        if (hType === 1) angle = hAngle
                        else if (hType === 2) angle = mAngle
                        else if (hType === 3) angle = sAngle

                        // Get BASE position (Upright 12:00)
                        const bx = baseHandPositions[i3]
                        const by = baseHandPositions[i3 + 1]
                        const bz = baseHandPositions[i3 + 2]

                        // Rotate around Z axis
                        const cos = Math.cos(angle)
                        const sin = Math.sin(angle)

                        // x' = x cos - y sin
                        // y' = x sin + y cos
                        positions[i3] = bx * cos - by * sin
                        positions[i3 + 1] = bx * sin + by * cos
                        positions[i3 + 2] = bz
                    }
                }

                // Sync if fully morphed
                if (sceneRef.current.animationProgress >= 1) {
                    const currentPos = sceneRef.current.particles.geometry.attributes.position.array as Float32Array
                    currentPos.set(sceneRef.current.targetPositions)
                    sceneRef.current.particles.geometry.attributes.position.needsUpdate = true
                }
            }

            // CAMERA SPECIFIC ANIMATION (Shutter Button Press)
            const isCamera = sceneRef.current.currentTarget === 'camera'
            if (isCamera && sceneRef.current.cameraData) {
                const { shutterIndices } = sceneRef.current.cameraData
                const positions = sceneRef.current.targetPositions

                // Store base positions on first frame if not exists
                if (!sceneRef.current.cameraData.baseShutterPositions) {
                    sceneRef.current.cameraData.baseShutterPositions = new Float32Array(positions)
                }
                const basePositions = sceneRef.current.cameraData.baseShutterPositions

                // 7.5-second Fast Scenario Loop (Reduced Delays)
                // 0-1.5s: Center (Trigger at 0.2s)
                // 1.5-2.5s: Turn Right (Spring)
                // 2.5-4.0s: Right Hold (Trigger at 2.6s)
                // 4.0-5.0s: Turn Left (Spring)
                // 5.0-6.5s: Left Hold (Trigger at 5.1s)
                // 6.5-7.5s: Return Center

                const loopDuration = 7.5 // Faster loop

                // Reset animation to start on frame 0 when switching to camera
                // This ensures we start from rotation 0 (Center), matching the Atom/Default state.
                if (sceneRef.current.cameraData.startTime === undefined) {
                    sceneRef.current.cameraData.startTime = currentTime
                }
                const animTime = currentTime - sceneRef.current.cameraData.startTime
                const t = (animTime * 0.001) % loopDuration

                // Spring Easing (Overshoot)
                const easeOutBack = (x: number): number => {
                    const c1 = 1.70158
                    const c3 = c1 + 1
                    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
                }

                // --- 1. ROTATION LOGIC ---
                let targetYRot = 0;

                if (t < 1.5) {
                    targetYRot = 0; // Center hold
                } else if (t < 2.5) {
                    // Turn Right (0 to +45 deg)
                    const p = (t - 1.5); // 0 to 1
                    const ease = easeOutBack(p);
                    targetYRot = ease * (Math.PI / 4);
                } else if (t < 4.0) {
                    targetYRot = Math.PI / 4; // Right hold
                } else if (t < 5.0) {
                    // Turn Right to Left (+45 to -45 deg)
                    const p = (t - 4.0);
                    const ease = easeOutBack(p);
                    targetYRot = (Math.PI / 4) - ease * (Math.PI / 2);
                } else if (t < 6.5) {
                    targetYRot = -Math.PI / 4; // Left hold
                } else {
                    // Return Center (-45 to 0 deg)
                    const p = Math.min(1, (t - 6.5));
                    const ease = easeOutBack(p);
                    targetYRot = (-Math.PI / 4) + ease * (Math.PI / 4);
                }

                // Helper to interpolate visible rotation via shortest path
                const lerpRot = (current: number, target: number, speed: number, dt: number) => {
                    let delta = target - current
                    // Normalize delta to -PI to +PI
                    while (delta > Math.PI) delta -= Math.PI * 2
                    while (delta < -Math.PI) delta += Math.PI * 2
                    return current + delta * speed * dt
                }

                // Smoothly interpolate to target rotation using shortest path
                // Higher speed (12.0) is needed here to ensure the "Spring" animation (overshoot) 
                // is actually visible and not smoothed out, while still preventing instant snapping on shape entry.
                const rotLerpSpeed = 12.0
                sceneRef.current.particles.rotation.y = lerpRot(sceneRef.current.particles.rotation.y, targetYRot, rotLerpSpeed, deltaTime)
                sceneRef.current.particles.rotation.x = lerpRot(sceneRef.current.particles.rotation.x, 0, rotLerpSpeed, deltaTime)
                sceneRef.current.particles.rotation.z = lerpRot(sceneRef.current.particles.rotation.z, 0, rotLerpSpeed, deltaTime)

                // --- 2. SHUTTER / APERTURE TRIGGER ---
                // Triggers: 0.2, 2.6, 5.1
                let pressAmount = 0;
                const triggers = [0.2, 2.6, 5.1];

                for (const trigTime of triggers) {
                    const diff = t - trigTime;
                    if (diff >= 0 && diff < 0.5) {
                        const phase = (diff / 0.5) * Math.PI;
                        pressAmount = Math.sin(phase);
                    }
                }

                // 1. Shutter Button (Vertical Press)
                const pressDepth = 0.06 // Visible movement
                const yOffset = -pressAmount * pressDepth

                // 2. Aperture Animation
                // Max scaling: closes to 80% size (scales down by 20%)
                const apertureScale = 1.0 - (pressAmount * 0.20)
                const apertureRotation = pressAmount * (Math.PI / 4) // Twists 45 degrees

                // Apply to shutter button and aperture particles
                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3

                    if (shutterIndices[i] === 1) { // Shutter Button
                        const baseX = basePositions[i3]
                        const baseY = basePositions[i3 + 1]
                        const baseZ = basePositions[i3 + 2]

                        // Apply press offset
                        positions[i3] = baseX
                        positions[i3 + 1] = baseY + yOffset
                        positions[i3 + 2] = baseZ
                    } else if (shutterIndices[i] === 2) { // Aperture Blade
                        const baseX = basePositions[i3]
                        const baseY = basePositions[i3 + 1]
                        const baseZ = basePositions[i3 + 2]

                        // Calculate radius and angle
                        const r = Math.sqrt(baseX * baseX + baseY * baseY)
                        const angle = Math.atan2(baseY, baseX)

                        // Apply animation
                        const newR = r * apertureScale
                        const newAngle = angle + apertureRotation

                        // Set new position
                        positions[i3] = newR * Math.cos(newAngle)
                        positions[i3 + 1] = newR * Math.sin(newAngle)
                        positions[i3 + 2] = baseZ
                    }
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
                // Smoothly return to nearest fully aligned rotation (0, 360, 720, etc.)
                // We align to 2*PI to ensure we don't lock at 180 degrees (backwards),
                // which causes large rotations when switching to directional shapes like Hand/Plane.
                const currentRot = sceneRef.current.particles.rotation.y
                const TWO_PI = Math.PI * 2
                const targetRot = Math.round(currentRot / TWO_PI) * TWO_PI

                // Interpolate towards the nearest flat angle using shortest path logic
                let dY = targetRot - currentRot
                // Normalize delta
                while (dY > Math.PI) dY -= TWO_PI
                while (dY < -Math.PI) dY += TWO_PI

                sceneRef.current.particles.rotation.y += dY * deltaTime * 3.0

                // Return to 0 tilt (X and Z)
                sceneRef.current.particles.rotation.x *= 0.95
                sceneRef.current.particles.rotation.z *= 0.95
            } else if (isHand) {
                // Waving animation for hand

                // 1. Vertical 3D Rotation (Y-Axis Swivel)
                const targetRotY = Math.sin(currentTime * 0.0015) * 0.6

                let dY = targetRotY - sceneRef.current.particles.rotation.y
                while (dY > Math.PI) dY -= Math.PI * 2
                while (dY < -Math.PI) dY += Math.PI * 2
                sceneRef.current.particles.rotation.y += dY * deltaTime * 3.0

                // 2. Tie Z-Axis Wave
                const waveAngle = Math.sin(currentTime * 0.004) * 0.25
                let dZ = waveAngle - sceneRef.current.particles.rotation.z
                while (dZ > Math.PI) dZ -= Math.PI * 2
                while (dZ < -Math.PI) dZ += Math.PI * 2
                sceneRef.current.particles.rotation.z += dZ * deltaTime * 3.0

                // 3. Slight X-Axis breathing
                const targetRotX = Math.sin(currentTime * 0.001) * 0.05
                let dX = targetRotX - sceneRef.current.particles.rotation.x
                while (dX > Math.PI) dX -= Math.PI * 2
                while (dX < -Math.PI) dX += Math.PI * 2
                sceneRef.current.particles.rotation.x += dX * deltaTime * 3.0
            } else if (sceneRef.current.currentTarget === 'plane') {
                // Gliding animation for paper plane

                // --- PLANE CONFIGURATION ---
                // Adjust these values to change the plane's flight path
                const config = {
                    // Base Angles (Radians)
                    baseX: 0.5,       // Pitch
                    baseY: -0.6,      // Yaw: -0.6 (approx -35 deg) + inverted geometry = same visual as old 145 deg
                    baseZ: -0.1,      // Roll

                    // Animation Intensity (Sway amount)
                    swayX: 0.05,      // Pitch fluctuation
                    swayY: 0.2,       // Yaw fluctuation
                    swayZ: 0.15       // Roll fluctuation
                }
                // ---------------------------

                const time = currentTime * 0.001

                const lerpSpeed = 3.0

                // Roll (Z)
                const roll = Math.sin(time * 1.5) * config.swayZ
                const targetRotZ = config.baseZ + roll

                let dZ = targetRotZ - sceneRef.current.particles.rotation.z
                while (dZ > Math.PI) dZ -= Math.PI * 2
                while (dZ < -Math.PI) dZ += Math.PI * 2
                sceneRef.current.particles.rotation.z += dZ * deltaTime * lerpSpeed

                // Pitch (X)
                const targetRotX = config.baseX + Math.sin(time * 1.0) * config.swayX

                let dX = targetRotX - sceneRef.current.particles.rotation.x
                while (dX > Math.PI) dX -= Math.PI * 2
                while (dX < -Math.PI) dX += Math.PI * 2
                sceneRef.current.particles.rotation.x += dX * deltaTime * lerpSpeed

                // Yaw (Y)
                const targetRotY = config.baseY + Math.sin(time * 0.5) * config.swayY + roll * 0.5

                let dY = targetRotY - sceneRef.current.particles.rotation.y
                while (dY > Math.PI) dY -= Math.PI * 2
                while (dY < -Math.PI) dY += Math.PI * 2
                sceneRef.current.particles.rotation.y += dY * deltaTime * lerpSpeed
            } else if (isClock || isAtom) {
                // Clock and Atom handle their own internal animation
                // We just need to stop the global rotation from "else" block

                // Perhaps a gentle sway for the whole clock?
                const targetRotZ = Math.sin(currentTime * 0.0005) * 0.05
                const targetRotX = Math.sin(currentTime * 0.0003) * 0.05

                const lerpSpeed = 3.0

                let dZ = targetRotZ - sceneRef.current.particles.rotation.z
                while (dZ > Math.PI) dZ -= Math.PI * 2
                while (dZ < -Math.PI) dZ += Math.PI * 2
                sceneRef.current.particles.rotation.z += dZ * deltaTime * lerpSpeed

                let dX = targetRotX - sceneRef.current.particles.rotation.x
                while (dX > Math.PI) dX -= Math.PI * 2
                while (dX < -Math.PI) dX += Math.PI * 2
                sceneRef.current.particles.rotation.x += dX * deltaTime * lerpSpeed

                let dY = 0 - sceneRef.current.particles.rotation.y
                while (dY > Math.PI) dY -= Math.PI * 2
                while (dY < -Math.PI) dY += Math.PI * 2
                sceneRef.current.particles.rotation.y += dY * deltaTime * lerpSpeed // Return to forward
            } else if (!isCamera) { // Don't rotate camera here, it has its own logic
                // Continually rotate for other shapes
                sceneRef.current.particles.rotation.y += currentRotationSpeed * deltaTime

                // Slight tilt effect for 3D feel (Smoothly interpolated)
                const targetRotX = Math.sin(currentTime * 0.0003) * 0.1
                const lerpSpeed = 3.0 // Consistent with others

                // Shortest path for X (though usually small, good practice)
                let dX = targetRotX - sceneRef.current.particles.rotation.x
                while (dX > Math.PI) dX -= Math.PI * 2
                while (dX < -Math.PI) dX += Math.PI * 2
                sceneRef.current.particles.rotation.x += dX * deltaTime * lerpSpeed
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
            console.log('ParticleMorph: generated curation/clock data', sceneRef.current.clockData)
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
