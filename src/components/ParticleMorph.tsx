'use client'

import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

export type MorphTarget = 'default' | 'flask' | 'camera' | 'cube' | 'palette' | 'plane'

interface ParticleMorphProps {
    target?: MorphTarget
    particleCount?: number
    isVisible?: boolean
    color?: number
}

export function ParticleMorph({
    target = 'default',
    particleCount = 3000,
    isVisible = true,
    color = 0x000000
}: ParticleMorphProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<{
        renderer: THREE.WebGLRenderer
        scene: THREE.Scene
        camera: THREE.PerspectiveCamera
        particles: THREE.Points
        basePositions: Float32Array
        targetPositions: Float32Array
        currentTarget: MorphTarget
        animationProgress: number
        frameId: number | null
    } | null>(null)

    // Generate base noise cloud positions
    const generateNoiseCloud = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)
        const radius = 2.5

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            // Create spherical noise cloud
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = Math.pow(Math.random(), 0.7) * radius

            positions[i3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i3 + 2] = r * Math.cos(phi)
        }

        return positions
    }

    // Generate flask shape (lab flask)
    const generateFlask = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            const t = i / count

            if (t < 0.2) {
                // Neck
                const angle = Math.random() * Math.PI * 2
                const r = 0.3 + Math.random() * 0.1
                const y = 1.5 + t * 5
                positions[i3] = r * Math.cos(angle)
                positions[i3 + 1] = y
                positions[i3 + 2] = r * Math.sin(angle)
            } else {
                // Body (rounded flask shape)
                const angle = Math.random() * Math.PI * 2
                const bodyT = (t - 0.2) / 0.8
                const y = -1 + bodyT * 2.5
                const r = Math.sin(bodyT * Math.PI) * 1.5
                positions[i3] = r * Math.cos(angle) + (Math.random() - 0.5) * 0.1
                positions[i3 + 1] = y
                positions[i3 + 2] = r * Math.sin(angle) + (Math.random() - 0.5) * 0.1
            }
        }

        return positions
    }

    // Generate camera shape
    const generateCamera = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            const t = i / count

            if (t < 0.7) {
                // Body
                const x = (Math.random() - 0.5) * 2.5
                const y = (Math.random() - 0.5) * 1.5
                const z = (Math.random() - 0.5) * 1.8
                positions[i3] = x
                positions[i3 + 1] = y
                positions[i3 + 2] = z
            } else if (t < 0.85) {
                // Lens
                const angle = Math.random() * Math.PI * 2
                const r = 0.5 + Math.random() * 0.3
                positions[i3] = r * Math.cos(angle)
                positions[i3 + 1] = r * Math.sin(angle)
                positions[i3 + 2] = 1.5 + Math.random() * 0.5
            } else {
                // Flash/viewfinder
                positions[i3] = -0.8 + Math.random() * 0.3
                positions[i3 + 1] = 0.8 + Math.random() * 0.3
                positions[i3 + 2] = -0.5 + Math.random() * 0.3
            }
        }

        return positions
    }

    // Generate cube shape
    const generateCube = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)
        const size = 2

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
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

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            const t = i / count

            // Create a paper airplane shape
            const wingSpan = 2.5
            const length = 3

            if (t < 0.4) {
                // Body/nose
                const bodyT = t / 0.4
                positions[i3] = (Math.random() - 0.5) * 0.2
                positions[i3 + 1] = (Math.random() - 0.5) * 0.2
                positions[i3 + 2] = -length / 2 + bodyT * length
            } else {
                // Wings
                const wingT = (t - 0.4) / 0.6
                const z = -length / 4 + wingT * length / 2
                const x = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * wingSpan / 2)
                positions[i3] = x
                positions[i3 + 1] = Math.abs(x) * 0.2 + (Math.random() - 0.5) * 0.1
                positions[i3 + 2] = z
            }
        }

        return positions
    }

    // Get target positions based on shape
    const getTargetPositions = (shape: MorphTarget): Float32Array => {
        switch (shape) {
            case 'flask':
                return generateFlask(particleCount)
            case 'camera':
                return generateCamera(particleCount)
            case 'cube':
                return generateCube(particleCount)
            case 'palette':
                return generatePalette(particleCount)
            case 'plane':
                return generatePlane(particleCount)
            default:
                return generateNoiseCloud(particleCount)
        }
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

        // Create particle material
        const material = new THREE.PointsMaterial({
            size: 0.02,
            color: color,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        })

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
        const animate = () => {
            if (!sceneRef.current) return

            const currentTime = performance.now()
            const deltaTime = (currentTime - lastTime) / 1000
            lastTime = currentTime

            // Smooth animation progress
            if (sceneRef.current.animationProgress < 1) {
                sceneRef.current.animationProgress = Math.min(
                    1,
                    sceneRef.current.animationProgress + deltaTime * 1.5
                )

                // Interpolate positions
                const positions = sceneRef.current.particles.geometry.attributes.position.array as Float32Array
                const ease = easeInOutCubic(sceneRef.current.animationProgress)

                for (let i = 0; i < particleCount * 3; i++) {
                    positions[i] = sceneRef.current.basePositions[i] +
                        (sceneRef.current.targetPositions[i] - sceneRef.current.basePositions[i]) * ease
                }

                sceneRef.current.particles.geometry.attributes.position.needsUpdate = true
            }

            // Gentle rotation
            sceneRef.current.particles.rotation.y += deltaTime * 0.1
            sceneRef.current.particles.rotation.x = Math.sin(currentTime * 0.0003) * 0.1

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

    // Handle target changes
    useEffect(() => {
        if (!sceneRef.current) return

        const newTarget = getTargetPositions(target)
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

// Easing function for smooth animations
function easeInOutCubic(t: number): number {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2
}
