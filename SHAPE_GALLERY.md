# Particle Morph Shape Gallery

This document showcases all available particle morphing shapes in the system.

## Shape Showcase

### 1. Default (Noise Cloud)
**Target**: `'default'`  
**Navigation**: Email, or when no item is hovered  
**Description**: A soft, organic spherical cloud of particles. Creates a subtle, ambient background effect.

**Characteristics**:
- Spherical distribution
- Random radius variation (r^0.7 for density towards center)
- Radius: 2.5 units
- Best for: Neutral/resting state

---

### 2. Lab Flask
**Target**: `'flask'`  
**Navigation**: Experiments  
**Description**: 3D representation of a laboratory flask with narrow neck and wide rounded body.

**Characteristics**:
- Top 20% forms narrow cylindrical neck (radius ~0.3-0.4)
- Bottom 80% forms rounded body using sine wave (max radius ~1.5)
- Vertical range: -1 to +2.5
- Best for: Science, experiments, research, chemistry

---

### 3. Camera
**Target**: `'camera'`  
**Navigation**: Photography  
**Description**: Simplified 3D camera with body, lens, and viewfinder/flash.

**Characteristics**:
- Body: 70% of particles in box shape (2.5 x 1.5 x 1.8)
- Lens: 15% of particles in circular formation (forward facing)
- Flash/Viewfinder: 15% of particles (top-left)
- Best for: Photography, media, visual content

---

### 4. Cube
**Target**: `'cube'`  
**Navigation**: Product  
**Description**: Geometric cube with particles distributed on all six faces.

**Characteristics**:
- Size: 2x2x2 units
- Equal distribution across all faces
- Clean, architectural feel
- Best for: Products, architecture, structure, organization

---

### 5. Palette
**Target**: `'palette'`  
**Navigation**: Collection  
**Description**: Artist's palette with thumb hole.

**Characteristics**:
- Main body: Flat plane (3 x 0.2 x 2)
- Thumb hole: Circular cutout on left side (radius ~0.3-0.4)
- 80% body, 20% hole detail
- Best for: Art, creativity, design, curation

---

### 6. Paper Airplane
**Target**: `'plane'`  
**Navigation**: About Me  
**Description**: Paper airplane with pointed nose and triangular wings.

**Characteristics**:
- Body/nose: 40% of particles (narrow, length: 3 units)
- Wings: 60% of particles (wingspan: 2.5 units)
- Slight upward angle on wings
- Best for: Travel, journey, personal pages, movement

---

## Visual Properties

All shapes share these common visual properties:

- **Particle Size**: 0.02 units
- **Color**: White (`0xffffff`)
- **Opacity**: 60% with additive blending
- **Animation Duration**: ~0.67 seconds (1.5 speed factor)
- **Easing**: Cubic ease-in-out
- **Rotation**: Gentle continuous Y-axis rotation (0.1 rad/s)
- **Tilt**: Subtle sinusoidal X-axis oscillation

## Animation Behavior

### Hover Sequence

1. **Initial State**: Noise cloud (default)
2. **Mouse Enter**: 
   - Context updates to target shape
   - Particles begin morphing
   - Animation progress: 0 → 1 over ~670ms
3. **Hover**: Shape fully formed and gently rotating
4. **Mouse Leave**:
   - Context resets to 'default'
   - Particles morph back to noise cloud

### Transition Quality

- **Smooth**: Cubic easing prevents jerky motion
- **Continuous**: No teleporting, every particle has a path
- **Frame-independent**: Uses delta time for consistent speed
- **Non-blocking**: Runs on GPU, doesn't block main thread

## Shape Complexity Comparison

From simplest to most complex:

1. **Cube** - 6 flat planes, very geometric
2. **Palette** - Single plane with cutout
3. **Default** - Spherical distribution (most organic)
4. **Plane** - 2-part geometry (body + wings)
5. **Flask** - 2-part with curved transitions
6. **Camera** - 3-part complex geometry

## Recommended Use Cases

### Professional/Corporate
- **Product**: Cube
- **Services**: Plane
- **About**: Default or Plane

### Creative/Artistic
- **Portfolio**: Palette or Camera
- **Projects**: Flask or Cube
- **Gallery**: Camera

### Technical/Scientific
- **Research**: Flask
- **Labs**: Flask
- **Tech**: Cube

### Personal
- **Blog**: Default or Plane
- **Travel**: Plane
- **Photos**: Camera

## Testing Each Shape

To test all shapes in your browser console:

```javascript
// Assuming you're on a page with the particle system
const context = document.querySelector('[data-particle-context]')

// Manually trigger each shape (adjust timing as needed)
const shapes = ['cube', 'flask', 'camera', 'palette', 'plane', 'default']
let index = 0

setInterval(() => {
  console.log('Showing:', shapes[index])
  // Trigger via hover or context (implementation specific)
  index = (index + 1) % shapes.length
}, 3000)
```

---

## Creating Custom Shapes

When designing your own shape, consider:

1. **Particle Distribution**: Ensure particles are evenly spread
2. **Scale**: Keep within -3 to +3 range for best viewing
3. **Recognizability**: Shape should be clear at all angles
4. **Transition**: Test morphing from noise cloud and back
5. **Performance**: More complex calculations = slower generation

### Example: Simple Heart Shape

```typescript
const generateHeart = (count: number): Float32Array => {
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const t = (i / count) * Math.PI * 2
        
        // Parametric heart equation
        const x = 16 * Math.pow(Math.sin(t), 3) * 0.1
        const y = (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * 0.1
        
        positions[i3] = x + (Math.random() - 0.5) * 0.1
        positions[i3 + 1] = y + (Math.random() - 0.5) * 0.1
        positions[i3 + 2] = (Math.random() - 0.5) * 0.2
    }
    
    return positions
}
```

---

**Note**: All shapes are dynamically generated, not pre-modeled, which keeps the bundle size small and allows for easy customization.
