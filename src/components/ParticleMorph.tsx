'use client'

import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

export type MorphTarget = 'default' | 'atom' | 'camera' | 'cube' | 'palette' | 'plane'

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
        materialShader?: THREE.Shader // Store shader reference
        basePositions: Float32Array
        targetPositions: Float32Array
        currentTarget: MorphTarget
        animationProgress: number
        frameId: number | null
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

    // Generate atom shape (refined based on user image - 3D Rutherford model)
    const generateAtom = (count: number): Float32Array => {
        const positions = new Float32Array(count * 3)

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
        const ellipticity = 0.35

        for (let orbit = 0; orbit < 3; orbit++) {
            const orbitRotation = (orbit * Math.PI * 2) / 3

            for (let i = 0; i < particlesPerOrbit; i++) {
                if (pIndex >= count) break

                const i3 = pIndex * 3
                const t = (i / particlesPerOrbit) * Math.PI * 2

                const drift = 0.08

                // Base circle coordinates
                const cx = radius * Math.cos(t)
                const cy = radius * Math.sin(t)

                // Tilt (Rotation around Y axis) to create elliptical look with depth
                const tiltAngle = Math.acos(ellipticity)

                const tiltedX = cx * ellipticity
                const tiltedY = cy
                const tiltedZ = cx * Math.sin(tiltAngle)

                // Rotate around Z axis (distribute orbits)
                const cosRot = Math.cos(orbitRotation)
                const sinRot = Math.sin(orbitRotation)

                positions[i3] = (tiltedX * cosRot - tiltedY * sinRot) + (Math.random() - 0.5) * drift
                positions[i3 + 1] = (tiltedX * sinRot + tiltedY * cosRot) + (Math.random() - 0.5) * drift
                positions[i3 + 2] = tiltedZ + (Math.random() - 0.5) * drift

                pIndex++
            }
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
                scaleFactor = 2.0 // Atom orbits need scaling to match cloud size
                break
            case 'camera':
                positions = generateCamera(count)
                scaleFactor = 1.2 // Camera is slightly smaller
                break
            case 'cube':
                positions = generateCube(count)
                scaleFactor = 1.5 // Cube needs scaling up
                break
            case 'palette':
                positions = generatePalette(count)
                scaleFactor = 1.0 // Palette is similar size
                break
            case 'plane':
                positions = generatePlane(count)
                scaleFactor = 1.0 // Plane is similar size
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

            // Shapes rotate, default doesn't
            const targetRotationSpeed = isDefault ? 0 : 0.1
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

            // Apply rotation
            if (isDefault) {
                // Smoothly return to nearest aligned rotation (0, 180, 360, etc.)
                // This ensures the wide cloud faces the camera without spinning back wildly
                const currentRot = sceneRef.current.particles.rotation.y
                const targetRot = Math.round(currentRot / Math.PI) * Math.PI

                // Interpolate towards the nearest flat angle
                sceneRef.current.particles.rotation.y += (targetRot - currentRot) * deltaTime * 2.0

                // Return to 0 tilt
                sceneRef.current.particles.rotation.x *= 0.95
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
        const newTarget = getTargetPositions(target, particleCount)

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
