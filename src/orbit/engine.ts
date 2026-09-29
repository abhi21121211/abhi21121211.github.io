import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { OrbitGroup, OrbitTile } from '../data/orbit'

export type HoverInfo = { label: string; group: string; color: string; x: number; y: number } | null
export type OrbitApi = {
  focus: (group: number | null) => void
  sweep: (dir: 1 | -1) => void
  setVisible: (v: boolean) => void
  dispose: () => void
}

const TILE = 0.64
const FACE_PX = 256

/** Draws a logo (Simple Icons path, 24×24 viewBox) or a wrapped text label. */
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
    // Shrink until the label fits in ≤3 lines across ~84% of the face.
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

type Ring = {
  root: THREE.Group // tilt + focus offset
  spinner: THREE.Group // spins around the ring axis
  tiles: THREE.Group[]
  line: THREE.LineLoop
  speed: number
  focus: number // 0..1 eased
  dim: number // 0..1 eased (1 = dimmed)
}

export function createOrbit(canvas: HTMLCanvasElement, video: HTMLVideoElement, videoAspect: number, groups: OrbitGroup[], onHover: (h: HoverInfo) => void): OrbitApi {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.setClearColor(0x000000, 1)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTex

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
  camera.position.set(0, 0.7, 14.5)
  camera.lookAt(0, 0.2, 0)

  // ── Abhishek (video) — drawn first, no depth, so tiles can pass "behind" him by fading.
  const videoTex = new THREE.VideoTexture(video)
  videoTex.colorSpace = THREE.SRGBColorSpace
  // Backdrop is already pure black (export_orbit_video.py); height matches his height on screen.
  const vh = 6.6
  const vw = vh * videoAspect
  // Shader: soft vignette so he sits in the black tile with no visible frame.
  const videoMat = new THREE.ShaderMaterial({
    uniforms: { map: { value: videoTex } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      varying vec2 vUv;
      void main() {
        vec3 c = texture2D(map, vUv).rgb;
        // Edge fades only (the backdrop is already black) so the sweeping hand stays visible.
        float v = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);
        v *= smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
        gl_FragColor = vec4(c * v, 1.0);
        #include <colorspace_fragment>
      }
    `,
    depthWrite: false,
    depthTest: false,
  })
  const videoPlane = new THREE.Mesh(new THREE.PlaneGeometry(vw, vh), videoMat)
  videoPlane.position.set(0, 0.1, 0)
  videoPlane.renderOrder = -2
  scene.add(videoPlane)

  // ── Rings
  const world = new THREE.Group()
  world.position.y = 0.25
  scene.add(world)
  const boxGeo = new RoundedBoxGeometry(TILE, TILE, 0.1, 4, 0.09)
  const faceGeo = new THREE.PlaneGeometry(TILE * 0.78, TILE * 0.78)
  const disposables: { dispose: () => void }[] = [boxGeo, faceGeo, envTex, pmrem, videoTex, videoMat]
  const hitTargets: THREE.Mesh[] = []

  const rings: Ring[] = groups.map((g, gi) => {
    const color = new THREE.Color(g.color)
    const root = new THREE.Group()
    const spinner = new THREE.Group()
    root.add(spinner)
    const R = 3.05 + gi * 0.47
    // Nested, slightly different tilts — like an atom model around him.
    root.rotation.set(0.3 + gi * 0.065, 0, (gi % 2 ? 1 : -1) * (0.08 + gi * 0.035))

    const pts = Array.from({ length: 128 }, (_, k) => new THREE.Vector3(Math.cos((k / 128) * Math.PI * 2) * R, 0, Math.sin((k / 128) * Math.PI * 2) * R))
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
    const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.22, depthWrite: false })
    const line = new THREE.LineLoop(lineGeo, lineMat)
    spinner.add(line)
    disposables.push(lineGeo, lineMat)

    const n = g.tiles.length
    const offset = gi * 0.7
    const tiles = g.tiles.map((t, ti) => {
      const a = offset + (ti / n) * Math.PI * 2
      const tile = new THREE.Group()
      tile.position.set(Math.cos(a) * R, 0, Math.sin(a) * R)
      const glass = new THREE.MeshPhysicalMaterial({
        color: color.clone().multiplyScalar(0.28),
        emissive: color,
        emissiveIntensity: 0.28,
        metalness: 0.2,
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        iridescence: 0.5,
        iridescenceIOR: 1.35,
        envMapIntensity: 2.2,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
      })
      const box = new THREE.Mesh(boxGeo, glass)
      const faceTex = faceTexture(t)
      const faceMat = new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false, toneMapped: false })
      const face = new THREE.Mesh(faceGeo, faceMat)
      face.position.z = 0.056
      tile.add(box, face)
      box.userData = { label: t.full, group: g.name, color: g.color, tile }
      hitTargets.push(box)
      disposables.push(glass, faceMat, faceTex)
      spinner.add(tile)
      return tile
    })
    world.add(root)
    return { root, spinner, tiles, line, speed: 0.1 + (gi % 3) * 0.025, focus: 0, dim: 0 }
  })

  // ── State
  let focused: number | null = null
  let swirl = 0
  let spinVel = 0
  let tiltVel = 0
  let dragging = false
  let lastX = 0
  let lastY = 0
  let hovered: THREE.Group | null = null
  let visible = true
  let raf = 0
  const pointer = new THREE.Vector2(9, 9)
  const raycaster = new THREE.Raycaster()
  const clock = new THREE.Clock()
  const tmpQ = new THREE.Quaternion()
  const tmpV = new THREE.Vector3()
  const tmpP = new THREE.Vector3()

  // ── Input
  const rect = () => canvas.getBoundingClientRect()
  const onDown = (e: PointerEvent) => {
    dragging = true
    lastX = e.clientX
    lastY = e.clientY
    canvas.setPointerCapture(e.pointerId)
    canvas.classList.add('is-dragging')
  }
  const onMove = (e: PointerEvent) => {
    const r = rect()
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    if (!dragging) return
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    lastX = e.clientX
    lastY = e.clientY
    spinVel = dx * 0.006
    tiltVel = dy * 0.002
    world.rotation.y += spinVel
    world.rotation.x = THREE.MathUtils.clamp(world.rotation.x + tiltVel, -0.35, 0.35)
  }
  const onUp = (e: PointerEvent) => {
    dragging = false
    canvas.releasePointerCapture?.(e.pointerId)
    canvas.classList.remove('is-dragging')
  }
  const onLeave = () => {
    pointer.set(9, 9)
    if (hovered) (hovered = null), onHover(null)
  }
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)
  canvas.addEventListener('pointerleave', onLeave)

  const resize = () => {
    const r = canvas.parentElement!.getBoundingClientRect()
    renderer.setSize(r.width, r.height, false)
    camera.aspect = r.width / r.height
    // Keep the outer ring in frame on narrower screens.
    camera.position.z = r.width / r.height < 1.3 ? 18 : 14.5
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas.parentElement!)
  resize()

  // ── Frame
  const frame = () => {
    raf = 0
    if (!visible) return
    const dt = Math.min(clock.getDelta(), 0.05)
    swirl *= Math.exp(-1.25 * dt)
    if (!dragging) {
      world.rotation.y += spinVel
      spinVel *= 0.94
      world.rotation.x *= 0.98
    }

    rings.forEach((ring, gi) => {
      const isFocus = focused === gi
      ring.focus += ((isFocus ? 1 : 0) - ring.focus) * 0.08
      ring.dim += ((focused !== null && !isFocus ? 1 : 0) - ring.dim) * 0.08
      // Swirl: outer rings sweep a little harder, like a wake behind the hand.
      ring.spinner.rotation.y += (ring.speed * (1 - ring.focus * 0.6) + swirl * (0.7 + gi * 0.08)) * dt
      ring.root.position.z = ring.focus * 2.2
      ring.root.scale.setScalar(1 + ring.focus * 0.12 - ring.dim * 0.04)
      ;(ring.line.material as THREE.LineBasicMaterial).opacity = 0.22 + ring.focus * 0.35 - ring.dim * 0.15

      // Billboard tiles; fade the ones behind him.
      ring.spinner.getWorldQuaternion(tmpQ).invert()
      ring.tiles.forEach((tile) => {
        tile.quaternion.copy(tmpQ).multiply(camera.quaternion)
        tile.getWorldPosition(tmpV)
        const behind = THREE.MathUtils.clamp((0.6 - tmpV.z) / 2.2, 0, 1) // 0 in front … 1 well behind
        const target = tile === hovered ? 1.55 : 1
        tile.scale.setScalar(THREE.MathUtils.lerp(tile.scale.x, target, 0.18))
        // Keep his face clear: tiles crossing the face region fade.
        tmpP.copy(tmpV).project(camera)
        const fx = tmpP.x / 0.13
        const fy = (tmpP.y - 0.36) / 0.3
        const onFace = Math.max(0, 1 - Math.sqrt(fx * fx + fy * fy))
        const alpha = (1 - behind * 0.72) * (1 - ring.dim * 0.7) * (1 - Math.min(1, onFace * 1.6) * 0.8)
        const box = tile.children[0] as THREE.Mesh
        const face = tile.children[1] as THREE.Mesh
        ;(box.material as THREE.MeshPhysicalMaterial).opacity = 0.78 * alpha
        ;(face.material as THREE.MeshBasicMaterial).opacity = alpha
        tile.renderOrder = Math.round(tmpV.z * 10)
      })
    })

    // Hover (skip while dragging).
    if (!dragging) {
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(hitTargets, false).find((h) => {
        const m = h.object as THREE.Mesh
        return (m.material as THREE.MeshPhysicalMaterial).opacity > 0.3
      })
      const next = (hit?.object.userData.tile as THREE.Group | undefined) ?? null
      if (next !== hovered) {
        hovered = next
        canvas.style.cursor = next ? 'pointer' : ''
      }
      if (hovered) {
        const d = (hovered.children[0] as THREE.Mesh).userData
        hovered.getWorldPosition(tmpV).project(camera)
        const r = rect()
        onHover({ label: d.label, group: d.group, color: d.color, x: ((tmpV.x + 1) / 2) * r.width, y: ((1 - tmpV.y) / 2) * r.height })
      } else onHover(null)
    }

    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return {
    focus: (g) => {
      focused = g
    },
    sweep: (dir) => {
      swirl += dir * 2.6
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
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('pointerleave', onLeave)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
    },
  }
}
