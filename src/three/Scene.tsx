import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { scrollState } from '../lib/scrollState'
import { MAIN_NODES, PATH_CURVE, buildCameraRig, pathCloud, sphereCloud, type Cloud } from './layout'
import * as S from './shaders'

const BLUE = new THREE.Color('#4F8CFF')
const VIOLET = new THREE.Color('#8B5CF6')
const AMBER = new THREE.Color('#F5A524')
const WHITE = new THREE.Color('#DDE6FF')
const LAST = MAIN_NODES.length - 1
const END = MAIN_NODES[LAST]

type Props = { mobile: boolean; bloom: boolean; onReady: () => void }

export default function Scene({ mobile, bloom, onReady }: Props) {
  return (
    <Canvas
      dpr={mobile ? [1, 1.5] : [1, 1.75]}
      gl={{ antialias: !mobile, alpha: false, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: mobile ? 60 : 45, near: 0.1, far: 160, position: [0, 1, 22] }}
      onCreated={({ gl }) => {
        gl.setClearColor('#07080C')
        requestAnimationFrame(onReady)
      }}
      aria-hidden="true"
    >
      <fog attach="fog" args={['#07080C', 30, 110]} />
      <World mobile={mobile} />
      {bloom && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.18} luminanceSmoothing={0.3} radius={0.65} />
        </EffectComposer>
      )}
    </Canvas>
  )
}

/** Shared per-frame uniforms, owned by <World/> and handed to every cloud. */
function useSharedUniforms() {
  return useMemo(
    () => ({
      uTime: { value: 0 },
      uCollapse: { value: 0 },
      uCenter: { value: new THREE.Vector3() },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uAspect: { value: 1 },
    }),
    [],
  )
}
type Shared = ReturnType<typeof useSharedUniforms>

function World({ mobile }: { mobile: boolean }) {
  const shared = useSharedUniforms()
  const heroShared = useSharedUniforms()
  const heroGroup = useRef<THREE.Group>(null)
  const smooth = useRef(0)
  const rig = useMemo(() => buildCameraRig(mobile), [mobile])
  const hero = useMemo(() => sphereCloud(mobile ? 70 : 460, mobile ? 10 : 13, 7), [mobile])
  const path = useMemo(() => pathCloud(mobile ? 80 : 420, 21), [mobile])
  const { camera, size } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  const pos = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    shared.uCenter.value.copy(END)
  }, [shared])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    // Critically-damped follow of the scroll position.
    smooth.current = THREE.MathUtils.damp(smooth.current, scrollState.station, 3.2, Math.min(dt, 0.05))
    const s = smooth.current
    const u = THREE.MathUtils.clamp(s / LAST, 0, 1)

    rig.camera.getPoint(u, pos)
    rig.target.getPoint(u, look)
    const px = scrollState.pointerX
    const py = scrollState.pointerY
    pos.x += px * (mobile ? 0 : 0.9)
    pos.y += py * (mobile ? 0 : 0.6)
    camera.position.lerp(pos, 0.12)
    camera.lookAt(look)

    const collapse = THREE.MathUtils.smoothstep(s, LAST - 0.85, LAST)
    for (const sh of [shared, heroShared]) {
      sh.uTime.value = t
      sh.uAspect.value = size.width / size.height
      sh.uMouse.value.set(mobile ? 9 : px, mobile ? 9 : py)
    }
    shared.uCollapse.value = collapse

    if (heroGroup.current) {
      heroGroup.current.rotation.y += dt * 0.05
      heroGroup.current.rotation.x = THREE.MathUtils.damp(heroGroup.current.rotation.x, -py * 0.15, 2, dt)
    }
  })

  return (
    <>
      <group ref={heroGroup}>
        <GraphCloud cloud={hero} shared={heroShared} size={mobile ? 5 : 4.2} pulses={mobile ? 12 : 60} />
      </group>
      <GraphCloud cloud={path} shared={shared} size={mobile ? 5 : 4.4} pulses={mobile ? 16 : 70} />
      <MainPath smooth={smooth} />
      <StationNodes smooth={smooth} mobile={mobile} />
    </>
  )
}

function GraphCloud({ cloud, shared, size, pulses }: { cloud: Cloud; shared: Shared; size: number; pulses: number }) {
  const gl = useThree((s) => s.gl)
  const { points, lines, pulse } = useMemo(() => {
    const pr = Math.min(gl.getPixelRatio(), 2)
    const colors = { uColorA: { value: BLUE }, uColorB: { value: VIOLET }, uHot: { value: WHITE } }

    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(cloud.positions, 3))
    pGeo.setAttribute('aSeed', new THREE.BufferAttribute(cloud.seeds, 1))
    const pMat = new THREE.ShaderMaterial({
      vertexShader: S.pointsVertex,
      fragmentShader: S.pointsFragment,
      uniforms: { ...shared, ...colors, uSize: { value: size }, uPixelRatio: { value: pr } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const e = cloud.edges
    const lPos = new Float32Array(e.length * 3)
    const lSeed = new Float32Array(e.length)
    for (let k = 0; k < e.length; k++) {
      lPos.set(cloud.positions.subarray(e[k] * 3, e[k] * 3 + 3), k * 3)
      lSeed[k] = cloud.seeds[e[k]]
    }
    const lGeo = new THREE.BufferGeometry()
    lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3))
    lGeo.setAttribute('aSeed', new THREE.BufferAttribute(lSeed, 1))
    const lMat = new THREE.ShaderMaterial({
      vertexShader: S.linesVertex,
      fragmentShader: S.linesFragment,
      uniforms: { ...shared, ...colors },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    // Pulses ride a random subset of edges.
    const edgeCount = e.length / 2
    const n = Math.min(pulses, edgeCount)
    const start = new Float32Array(n * 3)
    const end = new Float32Array(n * 3)
    const seeds = new Float32Array(n * 2)
    const motion = new Float32Array(n * 2)
    for (let i = 0; i < n; i++) {
      const edge = Math.floor(((i * 7919) % edgeCount + edgeCount) % edgeCount)
      const [a, b] = i % 2 ? [e[edge * 2], e[edge * 2 + 1]] : [e[edge * 2 + 1], e[edge * 2]]
      start.set(cloud.positions.subarray(a * 3, a * 3 + 3), i * 3)
      end.set(cloud.positions.subarray(b * 3, b * 3 + 3), i * 3)
      seeds[i * 2] = cloud.seeds[a]
      seeds[i * 2 + 1] = cloud.seeds[b]
      motion[i * 2] = 0.18 + ((i * 37) % 10) / 30
      motion[i * 2 + 1] = ((i * 53) % 100) / 100
    }
    const uGeo = new THREE.BufferGeometry()
    uGeo.setAttribute('position', new THREE.BufferAttribute(start, 3))
    uGeo.setAttribute('aEnd', new THREE.BufferAttribute(end, 3))
    uGeo.setAttribute('aSeeds', new THREE.BufferAttribute(seeds, 2))
    uGeo.setAttribute('aMotion', new THREE.BufferAttribute(motion, 2))
    const uMat = new THREE.ShaderMaterial({
      vertexShader: S.pulseVertex,
      fragmentShader: S.pulseFragment,
      uniforms: { ...shared, uColorA: { value: WHITE }, uPixelRatio: { value: pr } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    return {
      points: new THREE.Points(pGeo, pMat),
      lines: new THREE.LineSegments(lGeo, lMat),
      pulse: new THREE.Points(uGeo, uMat),
    }
  }, [cloud, shared, size, pulses, gl])

  useEffect(
    () => () => {
      for (const o of [points, lines, pulse]) {
        o.geometry.dispose()
        ;(o.material as THREE.Material).dispose()
      }
    },
    [points, lines, pulse],
  )

  for (const o of [points, lines, pulse]) o.frustumCulled = false
  return (
    <>
      <primitive object={lines} />
      <primitive object={points} />
      <primitive object={pulse} />
    </>
  )
}

function MainPath({ smooth }: { smooth: React.RefObject<number> }) {
  const { line, uniforms } = useMemo(() => {
    const samples = 600
    const pts = PATH_CURVE.getPoints(samples)
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const along = new Float32Array(pts.length).map((_, i) => i / samples)
    geo.setAttribute('aAlong', new THREE.BufferAttribute(along, 1))
    const uniforms = {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uColorA: { value: BLUE },
      uColorB: { value: VIOLET },
    }
    const mat = new THREE.ShaderMaterial({
      vertexShader: S.pathVertex,
      fragmentShader: S.pathFragment,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const line = new THREE.Line(geo, mat)
    line.frustumCulled = false
    return { line, uniforms }
  }, [])

  // Map the station value onto the curve's arc (stations are its control points).
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uProgress.value = THREE.MathUtils.clamp(smooth.current / LAST, 0, 1)
  })
  return <primitive object={line} />
}

function StationNodes({ smooth, mobile }: { smooth: React.RefObject<number>; mobile: boolean }) {
  return (
    <>
      {MAIN_NODES.map((p, i) => (
        <StationNode key={i} index={i} position={p} smooth={smooth} quiet={mobile} />
      ))}
    </>
  )
}

const sphereGeo = new THREE.SphereGeometry(1, 32, 24)
const planeGeo = new THREE.PlaneGeometry(1, 1)

function StationNode({ index, position, smooth, quiet }: { index: number; position: THREE.Vector3; smooth: React.RefObject<number>; quiet: boolean }) {
  const core = useRef<THREE.Mesh>(null)
  const shell = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)
  const isEnd = index === LAST
  // How far each station's shell opens: About becomes a soft sphere; wide sections stay subtle.
  // On phones text sits over every node, so nodes stay small.
  const open = (quiet ? 0.35 : 1) * ([1.0, 3.0, 1.8, 1.8, 1.8, 0.9, 0.9, 0.6][index] ?? 1.5)
  const base = index % 2 ? VIOLET : BLUE

  const mats = useMemo(() => {
    const shell = new THREE.ShaderMaterial({
      vertexShader: S.shellVertex,
      fragmentShader: S.shellFragment,
      uniforms: { uColor: { value: base.clone() }, uIntensity: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const halo = new THREE.ShaderMaterial({
      vertexShader: S.haloVertex,
      fragmentShader: S.haloFragment,
      uniforms: { uColor: { value: base.clone() }, uIntensity: { value: 0.4 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const core = new THREE.MeshBasicMaterial({ color: base.clone().lerp(WHITE, 0.4) })
    return { shell, halo, core }
  }, [base])

  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const a = THREE.MathUtils.clamp(1 - Math.abs(smooth.current - index), 0, 1)
    const act = a * a * (3 - 2 * a)
    const pulse = isEnd ? 0.5 + 0.5 * Math.sin(t * 3) : 0
    const endGlow = isEnd ? THREE.MathUtils.smoothstep(smooth.current, LAST - 0.6, LAST) : 0

    if (core.current) {
      const s = 0.22 + act * 0.1 + endGlow * (0.18 + pulse * 0.08)
      core.current.scale.setScalar(s)
      mats.core.color.copy(base).lerp(WHITE, 0.25 + act * 0.35)
      if (isEnd) mats.core.color.lerp(AMBER, endGlow * 0.35)
    }
    if (shell.current) {
      const s = 0.5 + act * open + endGlow * pulse * 0.35
      shell.current.scale.setScalar(s)
      shell.current.rotation.y = t * 0.2
      mats.shell.uniforms.uIntensity.value = act * 0.7 + endGlow * 0.3
    }
    if (halo.current) {
      halo.current.quaternion.copy(state.camera.quaternion)
      halo.current.scale.setScalar(2.5 + act * 4 + endGlow * (3 + pulse * 2))
      mats.halo.uniforms.uIntensity.value = 0.2 + act * 0.4 + endGlow * 0.45
      if (isEnd) mats.halo.uniforms.uColor.value.copy(base).lerp(AMBER, endGlow * 0.5)
    }
  })

  return (
    <group position={position}>
      <mesh ref={halo} geometry={planeGeo} material={mats.halo} />
      <mesh ref={shell} geometry={sphereGeo} material={mats.shell} />
      <mesh ref={core} geometry={sphereGeo} material={mats.core} />
    </group>
  )
}
