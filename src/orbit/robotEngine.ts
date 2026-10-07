import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { OrbitGroup, OrbitTile } from '../data/orbit'

/**
 * Transparent Three.js layer over the robot video. The 7 rings are anchored to
 * the glowing ring in the video (screen-space centre + radius), tiles burst
 * out of its hands (`reveal`), and scatter away with the robot (`dissolve`).
 */

export type Tip = { label: string; group: string; color: string; x: number; y: number } | null
export type Anchor = { cx: number; cy: number; radius: number; hands: { x: number; y: number }[] }
export type RobotOrbitApi = {
  setAnchor: (a: Anchor) => void
  setReveal: (v: number) => void
  setDissolve: (v: number) => void
  setInteractive: (v: boolean) => void
  focus: (group: number | null) => void
  setVisible: (v: boolean) => void
  dispose: () => void
}

const FACE_PX = 256
const TILE = 0.22 // relative to the video ring's radius (= 1)

function faceTexture(tile: OrbitTile): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = FACE_PX
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#fff'
  if (tile.icon) {
    const s = (FACE_PX * 0.5) / 24
    ctx.translate((FACE_PX - 24 * s) / 2, (FACE_PX - 24 * s) / 2)
    ctx.scale(s, s)
    ctx.fill(new Path2D(tile.icon.path))
  } else {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const words = tile.label.split(' ')
    let size = 46
    let lines: string[] = []
    for (; size > 22; size -= 2) {
      ctx.font = `600 ${size}px -apple-system, BlinkMacSystemFont, 'Inter Variable', sans-serif`
      lines = []
      let line = ''
      for (const w of words) {
        const test = line ? `${line} ${w}` : w
        if (ctx.measureText(test).width > FACE_PX * 0.84 && line) (lines.push(line), (line = w))
        else line = test
      }
      lines.push(line)
      if (lines.length <= 3 && lines.every((l) => ctx.measureText(l).width <= FACE_PX * 0.86)) break
    }
    const lh = size * 1.12
    lines.forEach((l, i) => ctx.fillText(l, FACE_PX / 2, FACE_PX / 2 + (i - (lines.length - 1) / 2) * lh))
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

type TileRec = {
  slot: THREE.Object3D // position on the ring (inside the spinning ring)
  mesh: THREE.Group // visible tile (scene space)
  box: THREE.Mesh
  face: THREE.Mesh
  ring: number
  hand: number
  delay: number
  scatter: THREE.Vector3
}
type Ring = { root: THREE.Group; spinner: THREE.Group; line: THREE.LineLoop; speed: number; focus: number; dim: number }

export function createRobotOrbit(canvas: HTMLCanvasElement, groups: OrbitGroup[], onTip: (t: Tip) => void, onPick: (group: number) => void): RobotOrbitApi {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  // Capped low: a full-screen canvas at retina density competes with the video for the GPU.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTex

  const FOV = 36
  const CAM_Z = 14.5
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100)
  camera.position.set(0, 0, CAM_Z)

  // Assembly anchored on the video ring. Local units: video ring radius = 1.
  const world = new THREE.Group()
  scene.add(world)
  const tileGeo = new RoundedBoxGeometry(TILE, TILE, TILE * 0.16, 4, TILE * 0.14)
  const faceGeo = new THREE.PlaneGeometry(TILE * 0.78, TILE * 0.78)
  const disposables: { dispose: () => void }[] = [tileGeo, faceGeo, envTex, pmrem]
  const hit: THREE.Mesh[] = []
  const tiles: TileRec[] = []
  const tileLayer = new THREE.Group() // tiles live here (scene space) so they can fly from the hands
  scene.add(tileLayer)

  // The video ring is a flat ellipse seen from ~9° above (height/width ≈ 0.155).
  const BASE_TILT = Math.asin(0.155)

  const rings: Ring[] = groups.map((g, gi) => {
    const color = new THREE.Color(g.color)
    const root = new THREE.Group()
    const spinner = new THREE.Group()
    root.add(spinner)
    root.rotation.set(BASE_TILT + (gi % 2 ? 1 : -1) * gi * 0.018, 0, (gi % 2 ? 1 : -1) * gi * 0.022)
    root.position.y = (gi - 3) * 0.035
    const R = 1.12 + gi * 0.17

    const pts = Array.from({ length: 160 }, (_, k) => new THREE.Vector3(Math.cos((k / 160) * Math.PI * 2) * R, 0, Math.sin((k / 160) * Math.PI * 2) * R))
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
    const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false })
    const line = new THREE.LineLoop(lineGeo, lineMat)
    spinner.add(line)
    disposables.push(lineGeo, lineMat)

    const n = g.tiles.length
    g.tiles.forEach((t, ti) => {
      const a = gi * 0.7 + (ti / n) * Math.PI * 2
      const slot = new THREE.Object3D()
      slot.position.set(Math.cos(a) * R, 0, Math.sin(a) * R)
      spinner.add(slot)

      const glass = new THREE.MeshPhysicalMaterial({
        color: color.clone().multiplyScalar(0.28),
        emissive: color,
        emissiveIntensity: 0.3,
        metalness: 0.2,
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        iridescence: 0.5,
        iridescenceIOR: 1.35,
        envMapIntensity: 2.2,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
      const box = new THREE.Mesh(tileGeo, glass)
      const faceTex = faceTexture(t)
      const faceMat = new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
      const face = new THREE.Mesh(faceGeo, faceMat)
      face.position.z = TILE * 0.09
      const mesh = new THREE.Group()
      mesh.add(box, face)
      tileLayer.add(mesh)
      disposables.push(glass, faceMat, faceTex)

      const rec: TileRec = {
        slot,
        mesh,
        box,
        face,
        ring: gi,
        hand: Math.cos(a) < 0 ? 0 : 1,
        delay: ((ti * 7 + gi * 3) % 11) / 11,
        scatter: new THREE.Vector3((Math.random() - 0.5) * 2, 0.8 + Math.random() * 1.6, (Math.random() - 0.5) * 1.5),
      }
      box.userData = { rec, label: t.full, group: g.name, color: g.color, gi }
      hit.push(box)
      tiles.push(rec)
    })
    world.add(root)
    return { root, spinner, line, speed: 0.12 + (gi % 3) * 0.03, focus: 0, dim: 0 }
  })

  // ── state
  let anchor: Anchor = { cx: 0, cy: 0, radius: 100, hands: [] }
  let reveal = 0
  let dissolve = 0
  let interactive = false
  let focused: number | null = null
  let spinOffset = 0
  let appliedSpin = 0
  let spinVel = 0
  let dragging = false
  let moved = 0
  let lastX = 0
  let hovered: TileRec | null = null
  let pinnedTip: TileRec | null = null
  let visible = true
  let raf = 0
  let W = 1
  let H = 1
  const pointer = new THREE.Vector2(9, 9)
  const raycaster = new THREE.Raycaster()
  const clock = new THREE.Clock()
  const v1 = new THREE.Vector3()
  const v2 = new THREE.Vector3()
  const handsWorld = [new THREE.Vector3(), new THREE.Vector3()]

  const wpp = () => (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z) / H // world units per px at z=0
  const toWorld = (x: number, y: number, out: THREE.Vector3) => out.set((x - W / 2) * wpp(), -(y - H / 2) * wpp(), 0)
  const applyAnchor = () => {
    toWorld(anchor.cx, anchor.cy, world.position)
    world.scale.setScalar(anchor.radius * wpp())
    anchor.hands.forEach((h, i) => toWorld(h.x, h.y, handsWorld[i]))
  }

  const resize = () => {
    const r = canvas.parentElement!.getBoundingClientRect()
    W = Math.max(1, r.width)
    H = Math.max(1, r.height)
    renderer.setSize(W, H, false)
    camera.aspect = W / H
    camera.updateProjectionMatrix()
    applyAnchor()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas.parentElement!)
  resize()

  // ── input (only while interactive)
  const rect = () => canvas.getBoundingClientRect()
  const pick = () => {
    raycaster.setFromCamera(pointer, camera)
    const h = raycaster.intersectObjects(hit, false).find((x) => ((x.object as THREE.Mesh).material as THREE.MeshPhysicalMaterial).opacity > 0.3)
    return (h?.object.userData.rec as TileRec | undefined) ?? null
  }
  const setPointer = (e: PointerEvent) => {
    const r = rect()
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
  }
  const onDown = (e: PointerEvent) => {
    if (!interactive) return
    dragging = true
    moved = 0
    lastX = e.clientX
    setPointer(e)
  }
  const onMove = (e: PointerEvent) => {
    setPointer(e)
    if (!dragging) return
    const dx = e.clientX - lastX
    lastX = e.clientX
    moved += Math.abs(dx)
    spinVel = dx * 0.006
    spinOffset += spinVel
  }
  const onUp = (e: PointerEvent) => {
    if (!dragging) return
    dragging = false
    if (moved < 6) {
      // Tap / click: show the tile's name and list its group.
      setPointer(e)
      const rec = pick()
      pinnedTip = rec
      if (rec) onPick(rec.ring)
    }
  }
  const onLeave = () => {
    pointer.set(9, 9)
    dragging = false
  }
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointerleave', onLeave)

  const ease = (t: number) => 1 - Math.pow(1 - t, 3)
  const backOut = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2)

  let cleared = false
  let tipShown = false
  const frame = () => {
    raf = 0
    if (!visible) return
    const dt = Math.min(clock.getDelta(), 0.05)
    // Nothing is drawn until the tiles burst out — don't render empty frames over the video.
    if (reveal <= 0 && dissolve <= 0) {
      if (!cleared) (renderer.clear(), (cleared = true))
      raf = requestAnimationFrame(frame)
      return
    }
    cleared = false
    // Drag moves spinOffset; hand the change to the rings this frame.
    if (!dragging) {
      spinOffset += spinVel
      spinVel *= 0.94
    }
    const spinStep = spinOffset - appliedSpin
    appliedSpin = spinOffset
    camera.updateMatrixWorld()

    rings.forEach((ring, gi) => {
      const isF = focused === gi
      ring.focus += ((isF ? 1 : 0) - ring.focus) * 0.08
      ring.dim += ((focused !== null && !isF ? 1 : 0) - ring.dim) * 0.08
      // Auto-spin + drag, both within the ring's own (tilted) plane.
      ring.spinner.rotation.y += ring.speed * (1 - ring.focus * 0.7) * dt + spinStep
      ring.root.position.z = ring.focus * 0.9
      ring.root.scale.setScalar(1 + ring.focus * 0.1)
      ;(ring.line.material as THREE.LineBasicMaterial).opacity = (0.16 + ring.focus * 0.4 - ring.dim * 0.1) * ease(Math.min(1, reveal * 1.4)) * (1 - dissolve)
    })
    world.updateMatrixWorld(true)

    const tip = pinnedTip ?? hovered
    for (const t of tiles) {
      // Per-tile stagger: each flies from its hand to its slot.
      const r = THREE.MathUtils.clamp((reveal - t.delay * 0.45) / 0.55, 0, 1)
      t.slot.getWorldPosition(v1)
      const start = handsWorld[t.hand] ?? v1
      t.mesh.position.lerpVectors(start, v1, ease(r))
      // Arc upward mid-flight.
      t.mesh.position.y += Math.sin(r * Math.PI) * world.scale.x * 0.35
      if (dissolve > 0) t.mesh.position.addScaledVector(t.scatter, dissolve * dissolve * world.scale.x * 1.6)

      t.mesh.quaternion.copy(camera.quaternion)
      const base = r <= 0 ? 0.001 : backOut(r)
      const target = (t === tip ? 1.55 : 1) * base * (1 - dissolve * 0.6)
      const s = THREE.MathUtils.lerp(t.mesh.scale.x || 0.001, target * world.scale.x, 0.25)
      t.mesh.scale.setScalar(Math.max(0.0001, s))

      // Fade tiles passing behind the robot's body (centre column, far side of the ring).
      v2.copy(t.mesh.position).sub(world.position)
      const behind = THREE.MathUtils.clamp(-v2.z / (world.scale.x * 0.8), 0, 1)
      const centre = 1 - THREE.MathUtils.clamp(Math.abs(v2.x) / (world.scale.x * 0.55), 0, 1)
      const ring = rings[t.ring]
      // …and go see-through when crossing in front of its torso, so the robot stays readable.
      const torso = 1 - THREE.MathUtils.clamp(Math.abs(v2.x) / (world.scale.x * 0.32), 0, 1)
      const alpha = Math.min(1, r * 3) * (1 - behind * centre * 0.85) * (1 - torso * (1 - behind) * 0.55) * (1 - ring.dim * 0.7) * (1 - dissolve)
      ;(t.box.material as THREE.MeshPhysicalMaterial).opacity = 0.8 * alpha
      ;(t.face.material as THREE.MeshBasicMaterial).opacity = alpha
      t.mesh.visible = alpha > 0.001
      t.mesh.renderOrder = Math.round(t.mesh.position.z * 100)
    }

    if (interactive && !dragging) {
      const next = pick()
      if (next !== hovered) {
        hovered = next
        canvas.style.cursor = next ? 'pointer' : 'grab'
      }
    } else if (!interactive && hovered) hovered = null

    const show = interactive ? (pinnedTip ?? hovered) : null
    if (show) {
      const d = show.box.userData
      show.mesh.getWorldPosition(v1).project(camera)
      onTip({ label: d.label, group: d.group, color: d.color, x: ((v1.x + 1) / 2) * W, y: ((1 - v1.y) / 2) * H })
      tipShown = true
    } else if (tipShown) (onTip(null), (tipShown = false))

    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return {
    setAnchor: (a) => {
      anchor = a
      applyAnchor()
    },
    setReveal: (v) => {
      reveal = v
    },
    setDissolve: (v) => {
      dissolve = v
    },
    setInteractive: (v) => {
      interactive = v
      if (!v) {
        pinnedTip = null
        dragging = false
      }
    },
    focus: (g) => {
      focused = g
    },
    setVisible: (v) => {
      visible = v
      if (v && !raf) (clock.getDelta(), (raf = requestAnimationFrame(frame)))
    },
    dispose: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointerleave', onLeave)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
    },
  }
}
