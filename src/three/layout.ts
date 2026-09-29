import * as THREE from 'three'
import { mulberry32 } from '../lib/random'

/** World positions of the 8 station nodes: START → … → END. */
export const MAIN_NODES: THREE.Vector3[] = [
  new THREE.Vector3(0, 0, 0), // start
  new THREE.Vector3(7, 1.5, -18), // about
  new THREE.Vector3(-6, -1, -34), // relevance lab
  new THREE.Vector3(5, 2.5, -48), // carmatec
  new THREE.Vector3(-4, -2, -62), // quicktouch
  new THREE.Vector3(6, 1, -80), // projects
  new THREE.Vector3(-5, 2, -98), // skills
  new THREE.Vector3(0, 0, -118), // end
]

export type CameraRig = { camera: THREE.CatmullRomCurve3; target: THREE.CatmullRomCurve3 }

/**
 * Camera stations. On desktop the active node sits right of centre so text
 * can occupy the left; projects/skills/contact are centred and further back.
 */
export function buildCameraRig(mobile: boolean): CameraRig {
  const shift = (i: number) => {
    if (mobile) return 0
    if (i === 0) return -9 // START node sits behind Abhishek's figure
    if (i >= 1 && i <= 4) return 5.5
    if (i === 5 || i === 6) return -6.5
    if (i >= 5) return 0
    return -5.5
  }
  const distance = (i: number) => {
    if (i === 0) return mobile ? 30 : 22
    if (i === 7) return mobile ? 14 : 11
    if (i === 5 || i === 6) return mobile ? 20 : 16
    return mobile ? 15 : 11
  }
  const lift = (i: number) => (mobile && i === 0 ? -10 : i === 0 ? -2.4 : i === 7 ? (mobile ? 2.4 : 3.9) : i === 5 || i === 6 ? -3.2 : 0)
  const targets = MAIN_NODES.map((n, i) => n.clone().add(new THREE.Vector3(shift(i), lift(i), 0)))
  const cams = targets.map((t, i) => t.clone().add(new THREE.Vector3(0, mobile ? 1 : 1.2, distance(i))))
  return {
    camera: new THREE.CatmullRomCurve3(cams, false, 'centripetal'),
    target: new THREE.CatmullRomCurve3(targets, false, 'centripetal'),
  }
}

export const PATH_CURVE = new THREE.CatmullRomCurve3(MAIN_NODES, false, 'centripetal')

export type Cloud = {
  positions: Float32Array
  seeds: Float32Array
  /** Pairs of point indices. */
  edges: Uint32Array
}

/** A spherical cloud of nodes — the hero graph. */
export function sphereCloud(count: number, radius: number, seed: number): Cloud {
  const rand = mulberry32(seed)
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < count; i++) {
    // Denser toward the middle, with a soft shell.
    const r = radius * Math.pow(rand(), 0.55)
    const theta = rand() * Math.PI * 2
    const phi = Math.acos(2 * rand() - 1)
    pts.push(new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi) * 0.7, r * Math.sin(phi) * Math.sin(theta)))
  }
  return finalize(pts, rand, radius * 0.28)
}

/** Nodes scattered in a tube around the main path, so the camera always flies through graph. */
export function pathCloud(count: number, seed: number): Cloud {
  const rand = mulberry32(seed)
  const pts: THREE.Vector3[] = []
  const up = new THREE.Vector3(0, 1, 0)
  for (let i = 0; i < count; i++) {
    const t = 0.06 + rand() * 0.94
    const c = PATH_CURVE.getPointAt(t)
    const tan = PATH_CURVE.getTangentAt(t)
    const side = new THREE.Vector3().crossVectors(tan, up).normalize()
    const lift = new THREE.Vector3().crossVectors(side, tan).normalize()
    const a = rand() * Math.PI * 2
    const r = 3 + Math.pow(rand(), 0.7) * 16
    pts.push(c.add(side.multiplyScalar(Math.cos(a) * r * 1.4)).add(lift.multiplyScalar(Math.sin(a) * r * 0.8)))
  }
  return finalize(pts, rand, 6)
}

function finalize(pts: THREE.Vector3[], rand: () => number, maxDist: number): Cloud {
  const n = pts.length
  const positions = new Float32Array(n * 3)
  const seeds = new Float32Array(n)
  pts.forEach((p, i) => {
    p.toArray(positions, i * 3)
    seeds[i] = rand()
  })
  // Connect each node to its two nearest neighbours (within range), de-duplicated.
  const seen = new Set<string>()
  const edges: number[] = []
  const max2 = maxDist * maxDist
  for (let i = 0; i < n; i++) {
    let best = [-1, -1]
    let bestD = [Infinity, Infinity]
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      const d = pts[i].distanceToSquared(pts[j])
      if (d > max2) continue
      if (d < bestD[0]) {
        best = [j, best[0]]
        bestD = [d, bestD[0]]
      } else if (d < bestD[1]) {
        best[1] = j
        bestD[1] = d
      }
    }
    for (const j of best) {
      if (j < 0) continue
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (seen.has(key)) continue
      seen.add(key)
      edges.push(i, j)
    }
  }
  return { positions, seeds, edges: new Uint32Array(edges) }
}
