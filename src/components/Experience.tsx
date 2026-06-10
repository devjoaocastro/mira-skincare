import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import {
  Environment,
  Float,
  Html,
  Lightformer,
  MeshDistortMaterial,
  Sparkles,
  useCursor,
  useScroll,
} from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { easing } from '../lib/easing'
import { PAGES, setScrollEl } from '../scrollBus'

/* Palette — warm porcelain world (ink #2a2420 lives in the CSS) */
const TERRACOTTA = '#c96f4a'
const SAGE = '#a8b8a0'
const PASTELS = ['#f3e0d3', '#dde6d8', '#f7e8e0', '#e8e2d4', '#f0d9c8', '#e2e8dc']

/* ------------------------------------------------------------------ */
/* Section wrapper — fades/scales/rotates its content as it enters     */
/* and leaves the viewport while we scroll through the 3D world.       */
/* ------------------------------------------------------------------ */

function Section({ index, z = 0, children }: { index: number; z?: number; children: ReactNode }) {
  const inner = useRef<THREE.Group>(null!)
  const scroll = useScroll()
  const vh = useThree((s) => s.viewport.height)

  useFrame((_, delta) => {
    const progress = scroll.offset * (PAGES - 1) - index // 0 when section centered
    const visibility = Math.max(0, 1 - Math.abs(progress)) // 1 visible → 0 offscreen
    easing.damp3(inner.current.scale, 0.78 + visibility * 0.22, 0.2, delta)
    inner.current.rotation.y = progress * 0.25
    inner.current.position.z = z - (1 - visibility) * 1.6
  })

  return (
    <group position={[0, -index * vh, 0]}>
      <group ref={inner}>{children}</group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* SerumDrop — translucent glass-like blob: low distort, pastel tint.  */
/* Hover makes it breathe a little wider and gain gloss.               */
/* ------------------------------------------------------------------ */

function SerumDrop({
  position,
  tint,
  radius = 0.8,
  rough = 0.5,
  speed = 1.4,
}: {
  position: [number, number, number]
  tint: string
  radius?: number
  rough?: number
  speed?: number
}) {
  const mesh = useRef<THREE.Mesh>(null!)
  const mat = useRef<any>(null)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((_, delta) => {
    mesh.current.rotation.y += delta * 0.18
    easing.damp3(mesh.current.scale, hovered ? 1.18 : 1, 0.2, delta)
    if (mat.current) {
      easing.damp(mat.current, 'distort', hovered ? 0.32 : 0.16, 0.22, delta)
      easing.damp(mat.current, 'roughness', hovered ? 0.08 : rough, 0.22, delta)
    }
  })

  return (
    <Float speed={speed} rotationIntensity={0.25} floatIntensity={0.8}>
      <mesh
        ref={mesh}
        position={position}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[radius, 48, 48]} />
        <MeshDistortMaterial
          ref={mat}
          color={tint}
          distort={0.16}
          speed={1.6}
          roughness={rough}
          metalness={0.05}
          transparent
          opacity={0.92}
        />
      </mesh>
    </Float>
  )
}

/* ------------------------------------------------------------------ */
/* IngredientOrbit — seven small spheres circling a porcelain pebble.  */
/* Hover speeds the orbit: "seven ingredients, zero noise".            */
/* ------------------------------------------------------------------ */

function IngredientOrbit() {
  const ring = useRef<THREE.Group>(null!)
  const pebble = useRef<THREE.Mesh>(null!)
  const speed = useRef({ v: 1 })
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const satellites = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2
        return {
          pos: [Math.cos(a) * 2.1, Math.sin(a * 2) * 0.22, Math.sin(a) * 2.1] as [number, number, number],
          tint: PASTELS[i % PASTELS.length],
          r: 0.16 + (i % 3) * 0.05,
        }
      }),
    [],
  )

  useFrame((state, delta) => {
    easing.damp(speed.current, 'v', hovered ? 2.8 : 1, 0.25, delta)
    ring.current.rotation.y += delta * 0.35 * speed.current.v
    ring.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.12
    pebble.current.rotation.y += delta * 0.2
  })

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* central pebble */}
      <mesh ref={pebble} scale={[1, 0.78, 0.92]}>
        <sphereGeometry args={[0.9, 48, 48]} />
        <meshStandardMaterial color="#f4ece2" roughness={0.85} metalness={0} />
      </mesh>
      {/* the seven */}
      <group ref={ring}>
        {satellites.map((s, i) => (
          <mesh key={i} position={s.pos}>
            <sphereGeometry args={[s.r, 24, 24]} />
            <meshStandardMaterial
              color={s.tint}
              roughness={i % 2 === 0 ? 0.15 : 0.75}
              metalness={0.05}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* RitualStep — one shape per step: disc (cleanse), drop (feed),       */
/* pebble (seal). Grows and turns toward you on hover.                 */
/* ------------------------------------------------------------------ */

function RitualStep({
  position,
  tint,
  kind,
}: {
  position: [number, number, number]
  tint: string
  kind: 'disc' | 'drop' | 'pebble'
}) {
  const mesh = useRef<THREE.Mesh>(null!)
  const mat = useRef<THREE.MeshStandardMaterial>(null!)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((_, delta) => {
    mesh.current.rotation.y += delta * (hovered ? 1.1 : 0.3)
    easing.damp3(mesh.current.scale, hovered ? 1.25 : 1, 0.18, delta)
    easing.damp(mat.current, 'roughness', hovered ? 0.12 : 0.6, 0.2, delta)
  })

  return (
    <Float speed={1.5} rotationIntensity={0.25} floatIntensity={0.6}>
      <mesh
        ref={mesh}
        position={position}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        {kind === 'disc' && <cylinderGeometry args={[0.62, 0.62, 0.18, 48]} />}
        {kind === 'drop' && <sphereGeometry args={[0.55, 32, 32]} />}
        {kind === 'pebble' && <sphereGeometry args={[0.6, 32, 32]} />}
        <meshStandardMaterial ref={mat} color={tint} roughness={0.6} metalness={0.05} />
      </mesh>
    </Float>
  )
}

/* ------------------------------------------------------------------ */
/* IngredientBlob — pastel drop with an HTML label that fades with     */
/* the scroll (HTML ignores fog/depth, so we drive opacity by hand —   */
/* the terranova label-fade fix).                                      */
/* ------------------------------------------------------------------ */

function IngredientBlob({
  position,
  tint,
  name,
  origin,
}: {
  position: [number, number, number]
  tint: string
  name: string
  origin: string
}) {
  const mesh = useRef<THREE.Mesh>(null!)
  const mat = useRef<any>(null)
  const label = useRef<HTMLDivElement>(null)
  const scroll = useScroll()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((_, delta) => {
    mesh.current.rotation.y += delta * 0.22
    easing.damp3(mesh.current.scale, hovered ? 1.2 : 1, 0.2, delta)
    if (mat.current) {
      easing.damp(mat.current, 'distort', hovered ? 0.3 : 0.14, 0.22, delta)
      easing.damp(mat.current, 'roughness', hovered ? 0.08 : 0.55, 0.22, delta)
    }

    // HTML labels ignore fog/depth — only show them while the Ingredients
    // section (page 3) is on screen, fading in/out with the scroll.
    if (label.current) {
      const sec = scroll.offset * (PAGES - 1)
      const visibility = Math.max(0, 1 - Math.abs(sec - 3) * 1.6)
      label.current.style.opacity = visibility.toFixed(3)
      label.current.style.display = visibility < 0.04 ? 'none' : ''
    }
  })

  return (
    <Float speed={1.3} rotationIntensity={0.2} floatIntensity={0.7}>
      <group position={position}>
        <mesh
          ref={mesh}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
          }}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[0.62, 48, 48]} />
          <MeshDistortMaterial
            ref={mat}
            color={tint}
            distort={0.14}
            speed={1.5}
            roughness={0.55}
            metalness={0.05}
            transparent
            opacity={0.95}
          />
        </mesh>
        <Html center position={[0, -1.15, 0]} className="ing-html" zIndexRange={[20, 0]}>
          <div
            ref={label}
            className={`ing-label ${hovered ? 'ing-label--hot' : ''}`}
            style={{ opacity: 0, display: 'none' }}
          >
            <strong>{name}</strong>
            <span>{origin}</span>
          </div>
        </Html>
      </group>
    </Float>
  )
}

/* ------------------------------------------------------------------ */
/* ProductBottle — frosted capsule with a terracotta cap.              */
/* Hover lifts the cap slightly; click gives a gentle bounce.          */
/* ------------------------------------------------------------------ */

function ProductBottle() {
  const group = useRef<THREE.Group>(null!)
  const spinner = useRef<THREE.Group>(null!)
  const cap = useRef<THREE.Group>(null!)
  const bounce = useRef(0)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((state, delta) => {
    // slow showcase rotation
    spinner.current.rotation.y += delta * 0.4

    // gentle bounce impulse, decaying
    bounce.current = THREE.MathUtils.damp(bounce.current, 0, 2.2, delta)
    const hop = Math.abs(Math.sin(state.clock.elapsedTime * 7)) * bounce.current * 0.35
    easing.damp3(group.current.position, [0, -0.2 + hop, 0], 0.08, delta)

    // hover: cap lifts slightly
    easing.damp3(cap.current.position, [0, hovered ? 1.62 : 1.38, 0], 0.18, delta)
  })

  return (
    <group
      ref={group}
      position={[0, -0.2, 0]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
      onClick={() => (bounce.current = Math.min(bounce.current + 1, 1.6))}
    >
      <group ref={spinner}>
        {/* frosted glass body — cylinder + sphere caps = capsule */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 1.5, 48]} />
          <meshPhysicalMaterial
            color="#fdf8f2"
            roughness={0.45}
            metalness={0}
            transmission={0.7}
            thickness={0.6}
            transparent
          />
        </mesh>
        <mesh position={[0, -0.75, 0]}>
          <sphereGeometry args={[0.55, 48, 32]} />
          <meshPhysicalMaterial
            color="#fdf8f2"
            roughness={0.45}
            metalness={0}
            transmission={0.7}
            thickness={0.6}
            transparent
          />
        </mesh>
        {/* shoulder */}
        <mesh position={[0, 0.75, 0]} scale={[1, 0.55, 1]}>
          <sphereGeometry args={[0.55, 48, 32]} />
          <meshPhysicalMaterial
            color="#fdf8f2"
            roughness={0.45}
            metalness={0}
            transmission={0.7}
            thickness={0.6}
            transparent
          />
        </mesh>
        {/* serum inside, faintly visible */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 1.1, 32]} />
          <meshStandardMaterial color="#f0d9c8" roughness={0.3} transparent opacity={0.55} />
        </mesh>
        {/* neck */}
        <mesh position={[0, 1.08, 0]}>
          <cylinderGeometry args={[0.2, 0.24, 0.28, 32]} />
          <meshStandardMaterial color="#efe6da" roughness={0.5} />
        </mesh>
        {/* terracotta cap (lifts on hover) */}
        <group ref={cap} position={[0, 1.38, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.42, 40]} />
            <meshStandardMaterial color={TERRACOTTA} roughness={0.38} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0.21, 0]} scale={[1, 0.32, 1]}>
            <sphereGeometry args={[0.3, 40, 24]} />
            <meshStandardMaterial color={TERRACOTTA} roughness={0.38} metalness={0.05} />
          </mesh>
        </group>
        {/* paper label band */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.565, 0.565, 0.5, 48, 1, true]} />
          <meshStandardMaterial color="#faf5ee" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* soft contact shadow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]}>
        <circleGeometry args={[1.05, 48]} />
        <meshBasicMaterial color="#e3d8ca" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* CreamRibbon — a stretched torus knot, pale like a swirl of cream.   */
/* ------------------------------------------------------------------ */

function CreamRibbon() {
  const mesh = useRef<THREE.Mesh>(null!)
  const impulse = useRef(0)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((_, delta) => {
    impulse.current = THREE.MathUtils.damp(impulse.current, 0, 1.4, delta)
    mesh.current.rotation.y += delta * (0.22 + impulse.current)
    mesh.current.rotation.x += delta * 0.06
  })

  return (
    <mesh
      ref={mesh}
      position={[0, -0.4, -1.8]}
      scale={[1.5, 0.6, 1.5]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
      onClick={() => (impulse.current += 3)}
    >
      <torusKnotGeometry args={[1.15, 0.3, 220, 36]} />
      <meshStandardMaterial color="#f6ece1" roughness={hovered ? 0.18 : 0.42} metalness={0.04} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Petals — flattened spheres drifting down as you scroll, wrapping    */
/* around the full height of the world.                                */
/* ------------------------------------------------------------------ */

function Petals({ count = 26 }: { count?: number }) {
  const group = useRef<THREE.Group>(null!)
  const scroll = useScroll()
  const vh = useThree((s) => s.viewport.height)
  const vw = useThree((s) => s.viewport.width)

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.random() - 0.5) * vw * 1.3,
        y: Math.random() * vh * PAGES,
        z: -2.2 - Math.random() * 3.5,
        phase: Math.random() * Math.PI * 2,
        sway: 0.3 + Math.random() * 0.5,
        scale: 0.14 + Math.random() * 0.18,
        tint: i % 3 === 0 ? SAGE : PASTELS[i % PASTELS.length],
      })),
    [count, vw, vh],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const total = vh * PAGES
    // petals fall as the visitor scrolls — plus a slow ambient sink
    const fall = scroll.offset * vh * 2.2 + t * 0.12
    group.current.children.forEach((p, i) => {
      const s = seeds[i]
      const y = (s.y + fall) % total
      p.position.set(s.x + Math.sin(t * s.sway + s.phase) * 0.5, vh * 0.6 - y, s.z)
      p.rotation.set(t * 0.4 + s.phase, t * 0.25 + s.phase, s.phase)
    })
  })

  return (
    <group ref={group}>
      {seeds.map((s, i) => (
        <mesh key={i} scale={[s.scale, s.scale * 0.22, s.scale * 0.65]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color={s.tint} roughness={0.7} metalness={0} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* PebbleStack — three resting stones for the footer. Zen.             */
/* ------------------------------------------------------------------ */

function PebbleStack() {
  const group = useRef<THREE.Group>(null!)

  useFrame((state) => {
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.2
  })

  return (
    <group ref={group} position={[0, -1.6, -2.5]}>
      <mesh scale={[1.25, 0.5, 1.05]}>
        <sphereGeometry args={[0.9, 32, 24]} />
        <meshStandardMaterial color="#e9dfd2" roughness={0.85} />
      </mesh>
      <mesh position={[0.1, 0.62, 0]} scale={[0.9, 0.4, 0.78]}>
        <sphereGeometry args={[0.75, 32, 24]} />
        <meshStandardMaterial color={SAGE} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.06, 0.05]} scale={[0.5, 0.3, 0.45]}>
        <sphereGeometry args={[0.6, 32, 24]} />
        <meshStandardMaterial color={TERRACOTTA} roughness={0.6} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Experience root — camera rig + sections + lights + post FX          */
/* ------------------------------------------------------------------ */

export default function Experience() {
  const scroll = useScroll()
  const vh = useThree((s) => s.viewport.height)
  const vw = useThree((s) => s.viewport.width)

  useEffect(() => {
    setScrollEl(scroll.el)
  }, [scroll.el])

  useFrame((state, delta) => {
    const o = scroll.offset
    const y = -o * vh * (PAGES - 1)
    // travel down the world + gentle mouse parallax (dreamy, slow)
    easing.damp3(state.camera.position, [state.pointer.x * 0.55, y - state.pointer.y * 0.3, 10], 0.32, delta)
    state.camera.lookAt(0, y, 0)
    // feed the DOM progress bar
    document.documentElement.style.setProperty('--scroll', o.toFixed(4))
  })

  const x = (f: number) => vw * f

  return (
    <>
      {/* soft studio light — high ambient, white formers, no hard edges */}
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 8, 6]} intensity={1.4} color="#fffaf3" />
      <directionalLight position={[-6, 2, 4]} intensity={0.5} color="#f3e8da" />

      <Environment resolution={64}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <Lightformer intensity={3} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[12, 12, 1]} />
          <Lightformer intensity={1.4} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
          <Lightformer intensity={1.4} position={[10, 1, 0]} rotation-y={-Math.PI / 2} scale={[20, 2, 1]} />
          <Lightformer color="#f3d9c8" intensity={0.8} position={[0, -4, 2]} rotation-x={-Math.PI / 2} scale={[14, 6, 1]} />
        </group>
      </Environment>

      {/* faint warm motes across the whole scroll length */}
      <Sparkles
        count={140}
        scale={[vw * 1.5, vh * PAGES, 8]}
        position={[0, (-vh * (PAGES - 1)) / 2, -3]}
        size={1.4}
        speed={0.18}
        color={TERRACOTTA}
        opacity={0.22}
      />

      {/* petals drifting down with the scroll */}
      <Petals />

      {/* 0 — Hero: suspended serum drops */}
      <Section index={0}>
        <SerumDrop position={[-x(0.22), 0.6, -0.5]} tint="#f3e0d3" radius={0.9} rough={0.55} speed={1.2} />
        <SerumDrop position={[x(0.24), -0.4, -1]} tint="#dde6d8" radius={1.15} rough={0.12} speed={1.5} />
        <SerumDrop position={[x(0.1), 1.5, -2.4]} tint="#f7e8e0" radius={0.55} rough={0.7} speed={1.8} />
        <SerumDrop position={[-x(0.12), -1.6, -1.6]} tint="#f0d9c8" radius={0.65} rough={0.2} speed={1.4} />
        <SerumDrop position={[x(0.32), 1.2, -3]} tint="#e8e2d4" radius={0.45} rough={0.6} speed={2} />
      </Section>

      {/* 1 — Philosophy: seven ingredients orbiting */}
      <Section index={1}>
        <group position={[x(0.2), 0, 0]}>
          <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.4}>
            <IngredientOrbit />
          </Float>
        </group>
      </Section>

      {/* 2 — Ritual: three step shapes */}
      <Section index={2}>
        <group position={[x(0.22), 0, 0]}>
          <RitualStep position={[0, 1.5, 0]} tint="#dde6d8" kind="disc" />
          <RitualStep position={[-0.9, -0.1, 0.4]} tint="#f3e0d3" kind="drop" />
          <RitualStep position={[0.7, -1.5, 0]} tint="#e8e2d4" kind="pebble" />
        </group>
      </Section>

      {/* 3 — Ingredients: four labelled drops */}
      <Section index={3} z={0.5}>
        <IngredientBlob position={[-x(0.28), -0.4, 0]} tint="#e9efe3" name="Squalane" origin="olive groves · Andalusia" />
        <IngredientBlob position={[-x(0.1), 0.5, -0.6]} tint="#f3e3d2" name="Oat ceramide" origin="winter oats · Finland" />
        <IngredientBlob position={[x(0.1), -0.6, -0.3]} tint="#dce6dd" name="Sea fennel" origin="granite cliffs · Brittany" />
        <IngredientBlob position={[x(0.28), 0.4, 0]} tint="#f6e6da" name="Prebiotic sugar" origin="chicory root · Flanders" />
      </Section>

      {/* 4 — The Bottle */}
      <Section index={4}>
        <group position={[x(0.2), 0.2, 1]} scale={1.25}>
          <ProductBottle />
        </group>
      </Section>

      {/* 5 — Promise: ribbon of cream */}
      <Section index={5}>
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.4}>
          <CreamRibbon />
        </Float>
        <Sparkles count={60} scale={[8, 5, 5]} size={1.8} speed={0.2} color="#c96f4a" opacity={0.3} />
      </Section>

      {/* 6 — Footer: resting stones behind the card */}
      <Section index={6}>
        <PebbleStack />
        <SerumDrop position={[-x(0.32), 1.2, -3]} tint="#f3e0d3" radius={0.5} rough={0.6} speed={1.2} />
        <SerumDrop position={[x(0.34), 0.8, -3.4]} tint="#dde6d8" radius={0.6} rough={0.3} speed={1.4} />
      </Section>

      <EffectComposer>
        <Bloom intensity={0.18} luminanceThreshold={0.85} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette offset={0.32} darkness={0.28} />
      </EffectComposer>
    </>
  )
}
