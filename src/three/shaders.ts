/**
 * Shared GLSL. Every cloud vertex runs the same `drift()` + `collapse()` so
 * nodes, the edges between them and the pulses travelling along those edges
 * stay glued together.
 */
const common = /* glsl */ `
  uniform float uTime;
  uniform float uCollapse;
  uniform vec3 uCenter;
  uniform vec2 uMouse;
  uniform float uAspect;

  vec3 drift(vec3 p, float seed) {
    return p + 0.28 * vec3(
      sin(uTime * 0.35 + seed * 6.2831),
      cos(uTime * 0.28 + seed * 12.566),
      sin(uTime * 0.22 + seed * 3.1415)
    );
  }

  vec3 collapse(vec3 p, float seed) {
    float c = clamp(uCollapse * 1.5 - seed * 0.5, 0.0, 1.0);
    c = c * c * (3.0 - 2.0 * c);
    return mix(p, uCenter, c);
  }

  // 0..1 closeness of a clip-space position to the cursor.
  float mouseGlow(vec4 clip, float radius) {
    vec2 ndc = clip.xy / clip.w;
    float d = distance(ndc * vec2(uAspect, 1.0), uMouse * vec2(uAspect, 1.0));
    return smoothstep(radius, 0.0, d) * step(0.0, clip.w);
  }

  float depthFade(float depth) {
    return smoothstep(95.0, 22.0, depth) * smoothstep(0.8, 4.0, depth);
  }
`

export const pointsVertex = /* glsl */ `
  ${common}
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vGlow;
  varying float vFade;
  varying float vSeed;

  void main() {
    vec3 p = collapse(drift(position, aSeed), aSeed);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vGlow = mouseGlow(clip, 0.32);
    float depth = -mv.z;
    vFade = depthFade(depth) * (1.0 - uCollapse * 0.6);
    vSeed = aSeed;
    gl_PointSize = uSize * (0.55 + aSeed * 0.9) * (1.0 + vGlow * 1.4) * uPixelRatio * (28.0 / max(depth, 1.0));
    gl_Position = clip;
  }
`

export const pointsFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uHot;
  varying float vGlow;
  varying float vFade;
  varying float vSeed;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float core = smoothstep(0.22, 0.0, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.35;
    vec3 col = mix(uColorA, uColorB, step(0.62, vSeed));
    col = mix(col, uHot, vGlow * 0.7);
    float a = (core + halo) * vFade * (0.55 + vGlow * 0.9);
    gl_FragColor = vec4(col * (1.0 + vGlow), a);
  }
`

export const linesVertex = /* glsl */ `
  ${common}
  attribute float aSeed;
  varying float vAlpha;

  void main() {
    vec3 p = collapse(drift(position, aSeed), aSeed);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    float glow = mouseGlow(clip, 0.28);
    vAlpha = depthFade(-mv.z) * (0.09 + glow * 0.75) * (1.0 - uCollapse * 0.8);
    gl_Position = clip;
  }
`

export const linesFragment = /* glsl */ `
  uniform vec3 uColorA;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(uColorA, vAlpha);
  }
`

/** Data pulses: each vertex slides between two drifting endpoints. */
export const pulseVertex = /* glsl */ `
  ${common}
  uniform float uPixelRatio;
  attribute vec3 aEnd;
  attribute vec2 aSeeds;
  attribute vec2 aMotion; // speed, offset
  varying float vFade;

  void main() {
    vec3 a = collapse(drift(position, aSeeds.x), aSeeds.x);
    vec3 b = collapse(drift(aEnd, aSeeds.y), aSeeds.y);
    float t = fract(uTime * aMotion.x + aMotion.y);
    vec3 p = mix(a, b, t);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;
    vFade = depthFade(depth) * sin(t * 3.1415) * (1.0 - uCollapse);
    gl_PointSize = 3.2 * uPixelRatio * (28.0 / max(depth, 1.0));
    gl_Position = projectionMatrix * mv;
  }
`

export const pulseFragment = /* glsl */ `
  uniform vec3 uColorA;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColorA * 1.6, smoothstep(0.5, 0.0, d) * vFade);
  }
`

/** Main path: lit up to the camera's progress, dim beyond it. */
export const pathVertex = /* glsl */ `
  attribute float aAlong;
  varying float vAlong;
  varying float vDepth;
  void main() {
    vAlong = aAlong;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

export const pathFragment = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlong;
  varying float vDepth;
  void main() {
    float travelled = smoothstep(uProgress + 0.004, uProgress - 0.004, vAlong);
    float head = smoothstep(0.03, 0.0, abs(vAlong - uProgress));
    float flow = 0.5 + 0.5 * sin((vAlong * 90.0) - uTime * 3.0);
    vec3 col = mix(uColorB, uColorA, travelled);
    float fade = smoothstep(110.0, 10.0, vDepth);
    float a = (0.12 + travelled * (0.35 + flow * 0.2) + head * 0.9) * fade;
    gl_FragColor = vec4(col * (1.0 + head * 2.0), a);
  }
`

/** Soft fresnel shell used when a station node "opens". */
export const shellVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

export const shellFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(vNormal, vView)), 2.4);
    gl_FragColor = vec4(uColor * (0.6 + f * 1.6), (f * 0.85 + 0.04) * uIntensity);
  }
`

export const haloFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(max(0.0, 1.0 - d), 3.0);
    gl_FragColor = vec4(uColor, a * uIntensity);
  }
`

export const haloVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
