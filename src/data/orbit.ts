/**
 * "Orbit of skills" data. Tiles map 1:1 to `skills.clusters[*].items`
 * (same order), so group counts always match the skill list.
 * Logos come from Simple Icons; skills without a logo get a text tile.
 */
import {
  siApacheparquet, siChakraui, siDocker, siExpress, siFramer, siGit, siGooglegemini, siJavascript, siJenkins,
  siJsonwebtokens, siLangchain, siLanggraph, siMinio, siModelcontextprotocol, siMongodb, siMui, siNetlify, siNextdotjs,
  siNodedotjs, siOpenrouter, siPandas, siPolars, siPostgresql, siPython, siReact, siRedux, siRust, siShadcnui, siSqlite,
  siSupabase, siTailwindcss, siTauri, siTypescript, siVercel, siVite,
} from 'simple-icons'
import { skills } from './content'

export type Icon = { path: string; title: string }
export type OrbitTile = { label: string; full: string; icon?: Icon }
export type OrbitGroup = { id: string; name: string; color: string; tiles: OrbitTile[] }

/**
 * The gesture video in the centre. `sweepAt` is when the hand sweep starts
 * (seconds, per loop) and `sweepDir` its screen direction: 1 = to the right.
 * Source: design/video/gesture.mov, processed with
 * `WIDE=1 export_orbit_video.py` (person on pure black, full 16:9 so the hand isn't cropped).
 */
export const orbitVideo = {
  mp4: '/video/orbit.mp4',
  poster: '/video/orbit-poster.jpg',
  aspect: 16 / 9,
  sweepAt: 4.6, // hand starts crossing his body
  sweepDir: -1 as 1 | -1, // …and sweeps to the left of the screen
}

// Short tile label + optional logo, in the same order as the skill list.
type Spec = [label: string, icon?: Icon]
const specs: Record<string, Spec[]> = {
  agents: [['LangGraph', siLanggraph], ['LangChain', siLangchain], ['Tool calling'], ['RAG'], ['Prompt engineering'], ['Multi-agent'], ['Agent memory'], ['MCP', siModelcontextprotocol], ['Vector search']],
  platforms: [['Bedrock'], ['AgentCore'], ['OpenRouter', siOpenrouter], ['OpenAI'], ['Gemini', siGooglegemini], ['Copilot Studio'], ['Azure AI Foundry'], ['QuickSuite Flows']],
  eval: [['LangSmith'], ['LLM-as-judge'], ['Hallucination eval'], ['Tool accuracy'], ['Latency & cost']],
  backend: [['Python', siPython], ['Rust', siRust], ['Node.js', siNodedotjs], ['Express', siExpress], ['REST APIs'], ['SSE streaming'], ['JWT auth', siJsonwebtokens], ['MVC']],
  frontend: [
    ['React', siReact], ['Next.js', siNextdotjs], ['TypeScript', siTypescript], ['JavaScript', siJavascript], ['Vite', siVite], ['Redux', siRedux], ['Tailwind', siTailwindcss],
    ['shadcn/ui', siShadcnui], ['MUI', siMui], ['Chakra UI', siChakraui], ['Framer Motion', siFramer], ['Recharts'], ['Tauri', siTauri], ['Teams JS SDK'],
  ],
  data: [
    ['Pandas', siPandas], ['Polars', siPolars], ['Parquet', siApacheparquet], ['openpyxl'], ['xlsxwriter'], ['fastexcel'], ['Doc parsing'],
    ['PostgreSQL', siPostgresql], ['Aurora'], ['Supabase', siSupabase], ['MongoDB', siMongodb], ['SQLite', siSqlite], ['Alembic'], ['Pinecone'],
  ],
  cloud: [['AWS'], ['Docker', siDocker], ['Jenkins', siJenkins], ['MinIO', siMinio], ['Vercel', siVercel], ['Netlify', siNetlify], ['Git', siGit]],
}

// One colour per ring (Apple system palette; GenAI uses the site accent).
const colors: Record<string, string> = {
  agents: '#F5A524',
  platforms: '#0A84FF',
  eval: '#30D158',
  backend: '#FF375F',
  frontend: '#64D2FF',
  data: '#BF5AF2',
  cloud: '#5E5CE6',
}

const ORDER = ['agents', 'platforms', 'eval', 'backend', 'frontend', 'data', 'cloud']

export const orbitGroups: OrbitGroup[] = ORDER.map((id) => {
  const cluster = skills.clusters.find((c) => c.id === id)!
  const spec = specs[id]
  if (import.meta.env.DEV && spec.length !== cluster.items.length) console.warn(`orbit: ${id} has ${spec.length} tiles but ${cluster.items.length} skills`)
  return {
    id,
    name: cluster.name,
    color: colors[id],
    tiles: cluster.items.map((full, i) => ({ full, label: spec[i]?.[0] ?? full, icon: spec[i]?.[1] ? { path: spec[i][1]!.path, title: spec[i][1]!.title } : undefined })),
  }
})

/** The group not shown in the orbit (kept as a line beneath it). */
export const orbitExtra = skills.clusters.find((c) => c.id === 'tools')!
