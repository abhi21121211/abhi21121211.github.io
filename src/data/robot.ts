/**
 * Skills section: one 30 s video (walk → spin/transform → ring → dissolve),
 * scrubbed by scroll. Source: design/video/robot.mov.
 * Encoded all-intra (every frame a keyframe) so seeking is instant:
 *   desktop  robot.mp4    1280×720, full frame
 *   phones   robot-m.mp4  600×804, crop x 1060…2674 of 3840 (centre on him)
 */
export const robotVideo = {
  desktop: { src: '/video/robot.mp4', crop: { x: 0, w: 1 }, aspect: 16 / 9, fit: 'cover' as const },
  mobile: { src: '/video/robot-m.mp4', crop: { x: 1060 / 3840, w: 1614 / 3840 }, aspect: 600 / 804, fit: 'contain' as const },
  poster: '/video/robot-poster.jpg',
  ringPoster: '/video/robot-ring.jpg',
  duration: 29.8,
}

/** Anchors measured on the source frame (normalised 0–1 of the full 16:9 frame). */
export const robotAnchors = {
  ring: { x: 0.486, y: 0.449, halfWidth: 0.181 }, // glowing ring at ~24 s
  hands: [
    { x: 0.352, y: 0.535 },
    { x: 0.621, y: 0.535 },
  ], // open hands at ~18 s
}

/**
 * Scroll timeline, in screens of scroll per segment. The hold keeps the video
 * on the ring frame while visitors play with the orbit.
 */
export const robotTimeline = [
  { from: 0, to: 11.8, screens: 2.0 }, // clip 1 — walk + sunglasses (name fades in)
  { from: 11.8, to: 17.2, screens: 1.2 }, // clip 2 — spin + transform (text moves aside)
  { from: 17.2, to: 24.3, screens: 1.6 }, // clip 3 — hands spread, tiles burst, ring forms
  { from: 24.3, to: 24.3, screens: 1.5, hold: true }, // pinned: drag / hover / click
  { from: 24.3, to: 29.8, screens: 1.4 }, // robot dissolves
  { from: 29.8, to: 29.8, screens: 0.5 }, // settle, then the section releases
]

/** Video-time milestones driving the overlays. */
export const robotBeats = {
  nameIn: [0.5, 5], // eyebrow + subline fade in
  aside: [11.8, 16], // text moves aside
  burst: [17.4, 22.8], // tiles fly from the hands onto their rings
  interactive: [23.6, 25.2], // drag / hover / click enabled (covers the hold)
  dissolve: [26, 29.4], // tiles scatter with the robot
}

/** Phones show only these 20 (one or more per ring). */
export const mobileTopSkills = [
  'LangGraph', 'LangChain', 'RAG', 'MCP', 'Tool calling',
  'Bedrock', 'AgentCore', 'OpenAI', 'Gemini',
  'LangSmith', 'LLM-as-judge',
  'Python', 'Node.js',
  'TypeScript', 'React', 'Next.js',
  'PostgreSQL', 'Pinecone',
  'Docker', 'AWS',
]
