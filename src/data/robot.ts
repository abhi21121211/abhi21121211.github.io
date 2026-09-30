/**
 * Skills section: the robot video autoplays when in view (no scroll pinning)
 * and stops on the ring frame. Source: design/video/robot.mov, first 25 s.
 *   desktop  robot.mp4    1280×720, full frame
 *   phones   robot-m.mp4  600×804, crop x 1060…2674 of 3840 (centre on him)
 */
export const robotVideo = {
  desktop: { src: '/video/robot.mp4', crop: { x: 0, w: 1 }, aspect: 16 / 9, fit: 'cover' as const },
  mobile: { src: '/video/robot-m.mp4', crop: { x: 1060 / 3840, w: 1614 / 3840 }, aspect: 600 / 804, fit: 'contain' as const },
  poster: '/video/robot-poster.jpg',
  ringPoster: '/video/robot-ring.jpg',
  /** Pause here — the ring is formed and the orbit is live. */
  stopAt: 24.6,
}

/** Anchors measured on the source frame (normalised 0–1 of the full 16:9 frame). */
export const robotAnchors = {
  ring: { x: 0.486, y: 0.449, halfWidth: 0.181 }, // glowing ring at ~24 s
  hands: [
    { x: 0.352, y: 0.535 },
    { x: 0.621, y: 0.535 },
  ], // open hands at ~18 s
}

/** Video-time milestones driving the overlays. */
export const robotBeats = {
  nameIn: [0.5, 5], // eyebrow + subline fade in
  aside: [11.8, 16], // text moves aside
  burst: [17.4, 22.8], // tiles fly from the hands onto their rings
  interactive: [23.6], // drag / hover / click enabled from here on
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
