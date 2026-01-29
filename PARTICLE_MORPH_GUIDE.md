# Interactive Particle Morphing Background

## Overview

This implementation provides a dynamic Three.js-powered particle background animation for your website header. The particle system smoothly morphs between a soft noise cloud and predefined 3D objects based on which navigation item the user hovers over.

## Features

✅ **Smooth morphing transitions** between shapes using cubic easing
✅ **6 predefined shapes**: noise cloud (default), lab flask, camera, cube, palette, and paper airplane
✅ **Context-based state management** for easy integration across components
✅ **Optimized performance** with WebGL rendering and efficient particle updates
✅ **Responsive design** with automatic canvas resizing
✅ **Subtle visual aesthetics** with semi-transparent particles and additive blending

## Architecture

### Components

1. **`ParticleMorph.tsx`** - Core Three.js component that renders and animates particles
2. **`ParticleMorphContext.tsx`** - React Context for managing morph state across components
3. **`Header.tsx`** - Displays the particle background
4. **`Navbar.tsx`** - Triggers morphing on navigation item hover

### Current Navigation → Shape Mapping

| Navigation Item | Shape Target | Description |
|----------------|--------------|-------------|
| Product | `cube` | Geometric cube with particles on faces |
| Experiments | `flask` | Lab flask with narrow neck and rounded body |
| Photography | `camera` | Camera shape with lens and body |
| Collection | `palette` | Artist palette with thumb hole |
| About Me | `plane` | Paper airplane shape |
| Email | `default` | Soft noise cloud |

## How It Works

### 1. Particle Generation

Each shape is generated programmatically using mathematical functions that distribute particles in 3D space:

- **Noise Cloud**: Spherical distribution using spherical coordinates
- **Flask**: Combination of cylindrical (neck) and spherical (body) distributions
- **Camera**: Box body with circular lens and small viewfinder
- **Cube**: Particles distributed on 6 faces
- **Palette**: Flat plane with circular thumb hole cutout
- **Plane**: Triangular wings with narrow body

### 2. Morphing Animation

When you hover over a navigation item:

1. Navbar calls `setCurrentTarget(morphTarget)` from context
2. Header receives the updated `currentTarget`
3. ParticleMorph component detects the change via `useEffect`
4. Animation loop interpolates particle positions using easing function
5. Particles smoothly transition to new positions over ~0.67 seconds

### 3. Context Flow

```
User Hovers → Navbar (onMouseEnter) → Context.setCurrentTarget()
                                              ↓
User Leaves → Navbar (onMouseLeave) → Context.setCurrentTarget('default')
                                              ↓
                                        Header (currentTarget)
                                              ↓
                                        ParticleMorph (renders)
```

## Customization Guide

### Adding a New Shape

1. **Define the shape function** in `ParticleMorph.tsx`:

```typescript
const generateStar = (count: number): Float32Array => {
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const t = i / count
        const angle = t * Math.PI * 10 // 5 points
        const r = (Math.floor(t * 5) % 2 === 0) ? 2 : 1
        
        positions[i3] = r * Math.cos(angle)
        positions[i3 + 1] = r * Math.sin(angle)
        positions[i3 + 2] = (Math.random() - 0.5) * 0.2
    }
    
    return positions
}
```

2. **Add the type** to `MorphTarget`:

```typescript
export type MorphTarget = 'default' | 'flask' | 'camera' | 'cube' | 'palette' | 'plane' | 'star'
```

3. **Add to `getTargetPositions` switch**:

```typescript
case 'star':
    return generateStar(particleCount)
```

4. **Map it to a navigation item** in `Navbar.tsx`:

```typescript
{ label: 'New Section', href: '/new', morphTarget: 'star' as MorphTarget }
```

### Adjusting Visual Parameters

**In `ParticleMorph.tsx`:**

```typescript
// Particle appearance
const material = new THREE.PointsMaterial({
    size: 0.02,              // Particle size (increase for larger dots)
    color: 0xffffff,         // Color (use hex colors)
    opacity: 0.6,            // Transparency (0.0 to 1.0)
    blending: THREE.AdditiveBlending,  // Blending mode
})

// Animation speed
sceneRef.current.animationProgress + deltaTime * 1.5  // Higher = faster
```

**Particle count:**

```tsx
<ParticleMorph target={currentTarget} particleCount={5000} isVisible={true} />
```

**Rotation speed:**

```typescript
sceneRef.current.particles.rotation.y += deltaTime * 0.1  // Horizontal rotation
sceneRef.current.particles.rotation.x = Math.sin(currentTime * 0.0003) * 0.1  // Gentle tilt
```

### Changing Colors Based on Theme

You can make particles change color based on the current page:

```typescript
// In ParticleMorph.tsx, add prop:
interface ParticleMorphProps {
    target?: MorphTarget
    particleCount?: number
    isVisible?: boolean
    color?: number  // Add this
}

// In Header.tsx:
const particleColor = isDark ? 0xffffff : 0x000000
<ParticleMorph target={currentTarget} color={particleColor} isVisible={true} />

// In ParticleMorph, update material:
const material = new THREE.PointsMaterial({
    color: color || 0xffffff,
    // ... rest
})
```

## Performance Optimization

### Current Optimizations

- **Efficient rendering**: WebGL with `powerPreference: 'high-performance'`
- **Pixel ratio capping**: Limited to 2x to prevent excessive GPU usage
- **Delta time animation**: Frame-rate independent animation
- **Minimal re-renders**: Context only updates on hover state changes
- **Proper cleanup**: Disposed geometries, materials, and renderer on unmount

### Tips for Better Performance

1. **Reduce particle count** on mobile:
```typescript
const isMobile = window.innerWidth < 768
<ParticleMorph particleCount={isMobile ? 1500 : 3000} />
```

2. **Use simpler shapes** for complex objects
3. **Disable on low-end devices**:
```typescript
const isLowEnd = navigator.hardwareConcurrency < 4
{!isLowEnd && <ParticleMorph ... />}
```

## Browser Compatibility

- ✅ Chrome/Edge (80+)
- ✅ Firefox (75+)
- ✅ Safari (13.1+)
- ⚠️ Requires WebGL support
- ⚠️ May have reduced performance on mobile devices

## Troubleshooting

### Particles not visible

1. Check if canvas is present: `document.querySelector('canvas')`
2. Verify particle color contrasts with background
3. Temporarily set black background to debug visibility

### Animation not triggering

1. Ensure `ParticleMorphProvider` wraps both Navbar and Header
2. Check console for React Context errors
3. Verify `onMouseEnter`/`onMouseLeave` events are firing

### Performance issues

1. Reduce `particleCount` (try 1500-2000)
2. Increase particle `size` to compensate for fewer particles
3. Disable rotation animations
4. Check for multiple instances of ParticleMorph

## Future Enhancements

**Potential additions:**

- [ ] Particle color gradients and multi-color support
- [ ] Custom particle textures (stars, dots, images)
- [ ] Interactive mouse-based particle attraction
- [ ] Sound-reactive morphing
- [ ] Page-specific default shapes
- [ ] Smooth camera position changes
- [ ] Advanced physics simulations
- [ ] Mobile touch-based interactions

## File Structure

```
src/
├── components/
│   ├── ParticleMorph.tsx       # Main Three.js component
│   ├── Header.tsx               # Displays particle background
│   └── Navbar.tsx               # Triggers morph changes
├── contexts/
│   └── ParticleMorphContext.tsx # State management
└── app/(website)/
    └── layout.tsx               # Provider wrapper
```

## Dependencies

```json
{
  "three": "^0.x.x",
  "@types/three": "^0.x.x"
}
```

---

**Created**: January 2026  
**Author**: Antigravity AI Agent  
**License**: As per project license
