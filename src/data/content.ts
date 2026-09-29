/**
 * ALL site copy lives here. Edit text, links and media without touching components.
 *
 * Rules (from the build brief):
 *  - No phone number, salary, or unconfirmed client/product names.
 *  - Don't invent achievements or numbers.
 *  - `TODO(abhishek)` marks things waiting on confirmation.
 */

export type Media = {
  /** Poster / fallback image (always required when media is set). */
  poster: string
  mp4?: string
  webm?: string
  /** Optional portrait (9:16) sources for mobile. */
  mobileMp4?: string
  mobileWebm?: string
}

export type Link = { label: string; href: string }

export const site = {
  name: 'Abhishek Dukare',
  title: 'Abhishek Dukare — AI Engineer | Agentic AI, LangGraph, AWS Bedrock',
  description:
    'AI Engineer with 2.5 years building GenAI products end to end — LangGraph agents, RAG and LLM apps on AWS Bedrock, shipped to production. Open to Bengaluru, Pune, Hyderabad or Remote.',
  url: 'https://abhi21121211.github.io',
  email: 'abhishekdukare689@gmail.com',
  github: 'https://github.com/abhi21121211',
  linkedin: 'https://www.linkedin.com/in/abhishek-dukare-937156257/',
  resume: '/resume/Abhishek_Dukare_AI_Engineer_Resume.pdf',
  locations: ['Bengaluru', 'Pune', 'Hyderabad', 'Remote'],
  webforge: 'https://webforge.in',
}

export type Photo = { src: string; srcSm: string; alt: string; w: number; h: number }

/** Portrait photography. Originals live in /design/photos. */
export const photos: Record<'hero' | 'about' | 'work' | 'contact', Photo> = {
  hero: { src: '/img/photos/suit-night.webp', srcSm: '/img/photos/suit-night-sm.webp', alt: 'Abhishek Dukare in a black suit, standing by a river at night', w: 1100, h: 1467 },
  about: { src: '/img/photos/laptop.webp', srcSm: '/img/photos/laptop-sm.webp', alt: 'Abhishek working on a laptop in a lounge', w: 1100, h: 1100 },
  work: { src: '/img/photos/suit-office.webp', srcSm: '/img/photos/suit-office-sm.webp', alt: 'Abhishek in a black suit in a modern office', w: 1100, h: 1650 },
  contact: { src: '/img/photos/cafe.webp', srcSm: '/img/photos/cafe-sm.webp', alt: 'Abhishek sitting in a café, relaxed', w: 1100, h: 1299 },
}

/** Scrolling tech band between sections. */
export const marquee = ['LangGraph', 'Amazon Bedrock', 'AgentCore', 'RAG', 'MCP', 'FastAPI', 'Next.js', 'LangSmith', 'Aurora Serverless', 'Human-in-the-loop', 'Tool calling', 'LLM evaluation']

/** Optional background loops. Leave `null` until the Veo renders exist — the 3D scene covers it. */
export const media: { heroLoop: Media | null; dataCore: Media | null } = {
  heroLoop: null, // e.g. { poster: '/video/hero-loop.jpg', webm: '/video/hero-loop.webm', mp4: '/video/hero-loop.mp4', mobileMp4: '/video/hero-loop-9x16.mp4' }
  dataCore: null,
}

/** The path through the graph. Order = scroll order = camera stations. */
export const stations = [
  { id: 'start', node: 'node_00', label: 'start' },
  { id: 'about', node: 'node_01', label: 'about' },
  { id: 'relevance-lab', node: 'node_02', label: 'relevance_lab' },
  { id: 'carmatec', node: 'node_03', label: 'carmatec' },
  { id: 'quicktouch', node: 'node_04', label: 'quicktouch' },
  { id: 'projects', node: 'node_05', label: 'projects' },
  { id: 'skills', node: 'node_06', label: 'skills' },
  { id: 'contact', node: 'end', label: 'contact' },
] as const

export type StationId = (typeof stations)[number]['id']

export const hero = {
  label: 'node_00 / start',
  name: 'ABHISHEK DUKARE',
  role: 'AI Engineer',
  roleTags: ['Agentic AI', 'LLM Applications', 'RAG'],
  sub: 'I build AI agents that turn days of manual work into hours — and ship them to production.',
  cta: { work: 'View my work', resume: 'Download resume' },
}

export const about = {
  label: 'node_01 / about',
  heading: 'Agents, *end to end.*',
  // Segments marked `hl` are highlighted numbers.
  body: [
    [{ t: 'AI Engineer with ' }, { t: '2.5 years', hl: true }, { t: ' building GenAI products end to end.' }],
    [
      { t: 'Built IngestIQ — a ' },
      { t: '13-node', hl: true },
      { t: ' LangGraph agent on Amazon Bedrock AgentCore that turns a ' },
      { t: '4–5 person, 6-day', hl: true },
      { t: ' data-mapping effort into a ' },
      { t: 'single day', hl: true },
      { t: '.' },
    ],
    [
      {
        t: 'Strong across agents, RAG, tool calling, MCP and LLM evaluation, plus the FastAPI / Next.js engineering to take a PoC to production and demo it to clients.',
      },
    ],
  ] as { t: string; hl?: boolean }[][],
  stats: [
    { kind: 'count', to: 2.5, decimals: 1, suffix: ' yrs', caption: 'experience' },
    { kind: 'arrow', from: '6 days', to: '1 day', caption: 'data-mapping effort, IngestIQ' },
    { kind: 'count', to: 2000, decimals: 0, suffix: '+', caption: 'npm downloads at launch' },
  ] as const,
}

export type Rich = { t: string; hl?: boolean }[]

export type Role = {
  id: StationId
  node: string
  company: string
  title: string
  location: string
  period: string
  blocks: {
    heading?: string
    note?: string
    points?: Rich[]
    miniGraph?: boolean
  }[]
}

export const experience: { heading: string; roles: Role[]; side: { node: string; company: string; title: string; period: string } } = {
  heading: 'Where I have *shipped*',
  roles: [
    {
      id: 'relevance-lab',
      node: 'node_02 / relevance_lab',
      company: 'Relevance Lab',
      title: 'Software Engineer, GenAI',
      location: 'Bengaluru',
      period: 'Feb 2026 – Present',
      blocks: [
        {
          heading: 'IngestIQ — LLM-powered data transformation platform',
          miniGraph: true,
          points: [
            [
              { t: 'Agentic platform mapping incoming Excel/data files to target templates at sheet, table and column level; cleans data and routes it through human review with a full audit trail — ' },
              { t: '4–5 people’s 6-day workload now done in one day', hl: true },
              { t: '.' },
            ],
            [
              { t: '13-node LangGraph agent', hl: true },
              { t: ' with human-in-the-loop approvals (FastAPI, Next.js, PostgreSQL, MinIO, Docker, Jenkins); migrated to ' },
              { t: 'Amazon Bedrock, AgentCore, Aurora Serverless and S3', hl: true },
              { t: '.' },
            ],
            [
              { t: 'Load-tested a ' },
              { t: '205 MB workbook (10 sheets, 200 columns, 20K rows)', hl: true },
              { t: ' end to end; fixed stale-response and intermittent 500 errors; moved secrets to AWS Secrets Manager.' },
            ],
            [
              { t: 'Cut AWS spend by ' },
              { t: '~40%', hl: true },
              { t: ' (Budgets alerts, Cost Explorer, scheduled Aurora shutdowns).' },
            ],
          ],
        },
        {
          heading: 'Multi-tenant AI agent platform',
          note: 'Rust + TypeScript · ~150 crates · ~30 MCP connectors',
          points: [[{ t: 'Tauri desktop chat features, Playwright E2E tests, AI coding-assistant workflow guide, client demo agents.' }]],
        },
        {
          heading: 'Client PoCs',
          points: [
            [{ t: 'Insurance Assistant', hl: true }, { t: ' — text-to-SQL + RAG.' }],
            [{ t: 'Project Intake Agent', hl: true }, { t: ' — document extraction, Microsoft Teams approval.' }],
            [{ t: 'Returns Automation', hl: true }, { t: ' — AWS QuickSuite Flows.' }],
          ],
        },
      ],
    },
    {
      id: 'carmatec',
      node: 'node_03 / carmatec',
      company: 'Carmatec',
      title: 'Software Engineer (AI Engineer | Full Stack)',
      location: 'Bengaluru (Remote)',
      period: 'Sep 2025 – Feb 2026',
      blocks: [
        {
          points: [
            [{ t: 'LLM-based content moderation and intelligent search for ' }, { t: 'Pipaan', hl: true }, { t: ' (social platform).' }],
            [{ t: 'API integrations and AI product recommendations for ' }, { t: 'Babiken', hl: true }, { t: ' (e-commerce).' }],
          ],
        },
      ],
    },
    {
      id: 'quicktouch',
      node: 'node_04 / quicktouch',
      company: 'QuickTouch',
      title: 'Software Engineer (Frontend | AI)',
      location: 'New Delhi',
      period: 'May 2024 – Aug 2025',
      blocks: [
        {
          points: [
            [
              { t: 'QuickCampus', hl: true },
              { t: ' cloud school ERP used by ' },
              { t: '200–250 schools', hl: true },
              { t: ': Result & Template Management with AI-assisted report formatting.' },
            ],
            [{ t: 'Partner onboarding platform with AI-assisted form validation; reusable React components.' }],
          ],
        },
      ],
    },
  ],
  side: { node: 'side_node / masai', company: 'Masai School', title: 'Assessment Assistant (part-time)', period: 'Oct 2023 – Mar 2024' },
}

export type Project = {
  name: string
  tagline: string
  desc: string
  highlight?: string
  tech: string[]
  image?: string
  imageAlt?: string
  media?: Media | null
  links: Link[]
  /** Shown when links are still missing. */
  pending?: string
}

export const projects: { label: string; heading: string; featured: Project[]; archive: { name: string; href?: string }[] } = {
  label: 'node_05 / projects',
  heading: 'Selected *builds*',
  featured: [
    {
      name: 'Project PA',
      tagline: 'AI-narrated guided presentations for web projects',
      desc: 'A CLI that generates AI-narrated guided presentations (tours) for web projects — preview locally, then deploy.',
      highlight: '2,000+ downloads at launch',
      tech: ['Node.js', 'CLI', 'LLM narration', 'npm'],
      image: '/img/projects/project-pa-cli.webp',
      imageAlt: 'Project PA CLI running in a terminal',
      links: [
        { label: 'npm', href: 'https://www.npmjs.com/package/@abhi21121211/project-pa-cli' },
        { label: 'GitHub', href: 'https://github.com/abhi21121211/project-pa' },
      ],
    },
    {
      name: 'RoomLoop',
      tagline: 'AI-powered virtual events & meetups',
      desc: 'Virtual events and meetups platform with real-time chat, live rooms and an AI assistant, “Ted”.',
      tech: ['React', 'Node.js', 'Real-time chat', 'AI assistant'],
      image: '/img/projects/roomloop-chat.webp',
      imageAlt: 'RoomLoop live room with chat',
      links: [
        { label: 'Live', href: 'https://roomloop-client.vercel.app/' },
        { label: 'GitHub', href: 'https://github.com/abhi21121211/roomloop-client' },
      ],
    },
    {
      name: 'human-readable-errors',
      tagline: 'npm package',
      // TODO(abhishek): confirm description (link is from the resume)
      desc: 'An npm package for turning raw errors into messages people can read.',
      tech: ['TypeScript', 'npm'],
      links: [{ label: 'npm', href: 'https://www.npmjs.com/package/human-readable-errors' }],
    },
    {
      name: 'ToolStack',
      tagline: 'Private, client-side developer utilities',
      desc: 'Free, fast, privacy-friendly online tools — 21+ utilities (converters, formatters, encoders) that run fully client-side with no data collection.',
      tech: ['React', 'TypeScript', 'Client-side only'],
      image: '/img/projects/toolstack-dashboard.webp',
      imageAlt: 'ToolStack dashboard listing developer utilities',
      links: [
        { label: 'Live', href: 'https://tool-stack-phi.vercel.app' },
        { label: 'GitHub', href: 'https://github.com/abhi21121211/ToolStack' },
      ],
    },
  ],
  archive: [
    { name: 'Electon', href: 'https://electon.vercel.app/' },
    { name: 'ShopClues clone', href: 'https://shopclues-clone-w5.netlify.app/' },
    { name: 'Bluefly clone', href: 'https://bluefly-clone-team5.netlify.app/' },
    { name: 'Foodrocket', href: 'https://github.com/abhi21121211/FoodRocket' },
    { name: 'Older portfolios', href: 'https://github.com/abhi21121211/Portfolio-2' },
  ],
}

export const skills = {
  label: 'node_06 / skills',
  heading: 'The stack behind *the agents*',
  clusters: [
    {
      id: 'agentic',
      name: 'Agentic AI & LLMs',
      color: 'blue',
      items: ['LangGraph (HITL, checkpointing)', 'LangChain', 'Multi-agent systems', 'Tool calling', 'RAG', 'Embeddings', 'MCP', 'Prompt engineering', 'LangSmith', 'LLM-as-judge evaluation'],
    },
    {
      id: 'platforms',
      name: 'LLM Platforms',
      color: 'violet',
      items: ['Amazon Bedrock (Converse, Nova)', 'Bedrock AgentCore', 'OpenAI', 'Claude', 'Gemini', 'Azure AI Foundry', 'Copilot Studio'],
    },
    {
      id: 'engineering',
      name: 'Engineering',
      color: 'blue',
      items: ['Python (FastAPI, Pydantic, pytest)', 'TypeScript', 'Node.js', 'React', 'Next.js', 'Tailwind', 'SSE streaming', 'Playwright', 'Rust (basic)'],
    },
    {
      id: 'data',
      name: 'Data & Cloud',
      color: 'violet',
      items: ['PostgreSQL', 'Aurora Serverless', 'Supabase', 'MongoDB', 'Pinecone', 'Pandas', 'Polars', 'AWS (S3, Secrets Manager, CloudWatch, Budgets)', 'Docker', 'Jenkins CI/CD'],
    },
  ],
}

export const education = {
  heading: 'Education',
  items: [
    { title: 'MBA – Information Technology', where: 'Uttaranchal University (Online)', when: 'Expected 2027' },
    { title: 'BBA (Computer Applications)', where: 'K.J. Somaiya College, SPPU', when: '2023 · CGPA 7.55' },
  ],
  certs: [
    { title: 'AI/ML Engineering', where: 'Apna College', when: '2025' },
    { title: 'Full Stack Web Development', where: 'Masai School', when: '2023' },
  ],
}

export const contact = {
  label: 'end',
  heading: 'Let’s build an agent that saves your team *days.*',
  sub: 'Open to AI Engineer roles in Bengaluru, Pune, Hyderabad or Remote — and to teams who want an agent in production, not just a demo.',
}

export const footer = {
  credit: 'Designed & built by Webforge',
  joke: 'Made with LangGraph-level care.',
}
