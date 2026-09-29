/**
 * Mutable, render-free state shared between the DOM scroll layer and the 3D scene.
 * The scene reads it every frame; React never re-renders from it.
 */
export const scrollState = {
  /** Continuous position along the graph path: 0 = START … stations.length - 1 = END. */
  station: 0,
  /** Normalised pointer, -1..1 on both axes (y up). */
  pointerX: 0,
  pointerY: 0,
}

type Listener = (active: number) => void
const listeners = new Set<Listener>()
let active = 0

export function onActiveStation(fn: Listener) {
  listeners.add(fn)
  fn(active)
  return () => void listeners.delete(fn)
}

export function setStation(value: number) {
  scrollState.station = value
  const next = Math.round(value)
  if (next !== active) {
    active = next
    listeners.forEach((l) => l(active))
  }
}
