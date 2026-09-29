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
    'AI Engineer with 3+ years building GenAI products end to end — LangGraph agents, RAG and LLM apps on AWS Bedrock, shipped to production. Open to Bengaluru, Pune, Hyderabad or Remote.',
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
    [{ t: 'AI Engineer with ' }, { t: '3+ years', hl: true }, { t: ' building GenAI products end to end.' }],
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
    { kind: 'count', to: 3, decimals: 0, suffix: '+ yrs', caption: 'experience' },
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
  /** One-line company description (optional). */
  about?: string
  blocks: {
    heading?: string
    note?: string
    points?: Rich[]
    /** Technologies used on this project — shown as a quiet list. */
    stack?: string[]
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
          note: 'Key project',
          miniGraph: true,
          points: [
            [
              { t: 'Built a platform that maps incoming data files (Excel and other formats) to target templates at sheet/table and column level, cleans the data, and routes it through human review before execution, with a full audit trail — ' },
              { t: '4–5 people’s 6-day workload now done in one day', hl: true },
              { t: '.' },
            ],
            [{ t: 'Designed a ' }, { t: '13-node LangGraph agent', hl: true }, { t: ' with approval interrupts.' }],
            [{ t: 'Migrated IngestIQ from OpenRouter, Docker and Postgres to ' }, { t: 'Amazon Bedrock, Bedrock AgentCore, Aurora Serverless and S3', hl: true }, { t: '.' }],
            [{ t: 'Load-tested a ' }, { t: '205 MB Excel workbook (10 sheets, 200 columns, 20,000 rows)', hl: true }, { t: ' end to end on the deployed AgentCore runtime.' }],
            [{ t: 'Fixed root causes of stale agent responses and intermittent 500 errors; moved database credentials into AWS Secrets Manager.' }],
            [{ t: 'Cut AWS spend by ' }, { t: '~40%', hl: true }, { t: ' with Budgets alerts, Cost Explorer analysis and stopping Aurora between test sessions.' }],
            [{ t: 'Now leading the production-readiness work.', hl: true }],
          ],
          stack: ['LangGraph', 'FastAPI', 'Next.js', 'PostgreSQL', 'MinIO', 'Docker', 'Jenkins CI/CD', 'Amazon Bedrock', 'AgentCore', 'Aurora Serverless', 'S3', 'Secrets Manager'],
        },
        {
          // TODO(abhishek): product name withheld — say if it can be shown.
          heading: 'Multi-tenant AI agent platform',
          note: 'Contributor',
          points: [
            [{ t: 'Contributing to a multi-tenant AI agent platform built in Rust and TypeScript: ' }, { t: '~150 Rust crates, a Tauri desktop app, ~30 MCP connectors', hl: true }, { t: ' and generated SDKs.' }],
            [{ t: 'Wrote the team’s task workflow guide and AI coding-assistant guidance: ' }, { t: 'five typed task flows', hl: true }, { t: ' with quality gates and CI checks.' }],
            [{ t: 'Worked on the desktop chat experience (pasted-screenshot attachments, streaming replies) and wrote Playwright end-to-end tests for it.' }],
            [{ t: 'Built client solution demos on the platform: an AI leave-management demo and DSL agent definitions for a client engagement.' }],
          ],
          stack: ['Rust', 'TypeScript', 'Tauri', 'MCP', 'Playwright'],
        },
        {
          heading: 'Client PoCs',
          points: [
            [
              { t: 'Insurance Assistant', hl: true },
              { t: ' — a natural-language assistant to explore insurance products across banking partners, combining SQL queries, RAG over policy brochures (Pinecone), aggregation insights and cross-turn user-profile memory.' },
            ],
            [
              { t: 'Project Intake Agent & Project Info Extractor', hl: true },
              { t: ' — a document-extraction agent built on Copilot Studio, Azure AI Foundry and OpenRouter to compare platforms, connected to the client’s Microsoft Teams app with human approval before data entry.' },
            ],
            [
              { t: 'AI return-processing automation', hl: true },
              { t: ' — a workflow on AWS QuickSuite Flows that extracts return-note data, analyses product images and decides refund, replacement or rejection, with results stored in Supabase.' },
            ],
          ],
          stack: ['Next.js', 'FastAPI', 'Gemini 2.0 Flash', 'Pinecone', 'Supabase', 'JWT auth', 'Copilot Studio', 'Azure AI Foundry', 'OpenRouter', 'Microsoft Teams', 'AWS QuickSuite Flows'],
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
      about: 'A global IT services company specialising in digital transformation for startups and enterprises.',
      blocks: [
        {
          points: [
            [{ t: 'Integrated AI-powered features, including ' }, { t: 'LLM-based content moderation and intelligent search', hl: true }, { t: ', to improve platform efficiency.' }],
            [{ t: 'Optimised frontend–backend integration to improve performance, reliability and UI/UX.' }],
            [{ t: 'Pipaan', hl: true }, { t: ' (social media platform): admin panel and user-side development with AI-assisted moderation and search.' }],
            [{ t: 'Babiken', hl: true }, { t: ' (e-commerce platform): API integration, UI optimisation and AI-driven product recommendations.' }],
          ],
          stack: ['LLM moderation', 'Intelligent search', 'Recommendations', 'API integration'],
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
      about: 'QuickTouch Technologies Limited — listed on NSE Emerge (QUICKTOUCH-SM).',
      blocks: [
        {
          points: [
            [{ t: 'Developed modern, responsive UI components for digital products, with AI-assisted features to improve usability and automation.' }],
            [
              { t: 'QuickCampus', hl: true },
              { t: ' (cloud-based school ERP, used by ' },
              { t: '200–250 schools', hl: true },
              { t: '): developed Result & Template Management with AI-assisted report formatting and validation to reduce manual errors.' },
            ],
            [{ t: 'Partner Program', hl: true }, { t: ': developed a partner onboarding platform with AI-assisted form validation and insights, improving conversion and user experience.' }],
          ],
          stack: ['React', 'Responsive UI', 'AI-assisted validation'],
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
  /** Tile variant in the light edition. */
  kind?: 'research' | 'app' | 'client'
  /** Headline results (research tile). */
  stats?: { v: string; l: string }[]
  /** Extra detail line (e.g. SEO work on client sites). */
  extra?: string
  /** Built-in UI illustration instead of a screenshot. */
  mock?: 'voice-transaction'
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
      name: 'Artificial Mind With Stakes',
      tagline: 'AI research programme',
      kind: 'research',
      desc: 'Can an AI agent grow its own personality from its history, instead of having one written for it? Q-learning simulations where the agent has a body, memory and forgetting — then a memory graph around frozen LLMs (llama3.2 through Ollama, and OpenRouter).',
      stats: [
        { v: 'r = −0.99', l: 'It disproved its own founding hypothesis, across 12/12 runs.' },
        { v: '67.9% → 14.2%', l: 'Death rate once the agent was given a body.' },
        { v: '0.983', l: 'Identity-coherence score on a 50-case benchmark, graded by a separate LLM judge.' },
        { v: 'TVD 0.684', l: 'Two identical LLMs with this memory grew into measurably different individuals.' },
      ],
      tech: ['Reinforcement learning', 'Agent memory', 'LLM-as-judge', 'Benchmark design', 'FastAPI'],
      links: [],
    },
    {
      name: 'Nivesh AI',
      tagline: 'Money Manager AI — personal finance with an AI assistant',
      kind: 'app',
      mock: 'voice-transaction',
      desc: 'Accounts, transactions, budgets and investments, with an AI assistant: type or say “spent 450 on groceries” and it files the transaction. It also imports PDF bank statements.',
      tech: ['Next.js 16', 'Postgres + Prisma (7 tables)', 'NextAuth', 'Zod', 'OpenRouter', 'Whisper'],
      links: [],
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
      name: 'ToolStack',
      tagline: 'Private, client-side developer utilities',
      desc: 'Free, fast, privacy-friendly online tools — 21+ utilities (converters, formatters, encoders) that run fully client-side with no data collection.',
      tech: ['React', 'TypeScript', 'Client-side only'],
      image: '/img/projects/toolstack-dashboard.webp',
      imageAlt: 'ToolStack dashboard listing developer utilities',
      links: [
        { label: 'Live', href: 'https://tool-stack-phi.vercel.app' },
        // GitHub repo is private — link removed until it's public.
      ],
    },
    {
      name: 'Webforge',
      tagline: 'My studio’s website · webforge.in',
      kind: 'client',
      desc: 'A complete online presence for local shops — website, Google profile and a WhatsApp assistant — shown to the owner as a free demo before they pay. Designed, built and shipped end to end.',
      tech: ['Premium animated design', 'Google profile', 'WhatsApp assistant'],
      image: '/img/webforge.webp',
      imageAlt: 'The webforge.in homepage',
      links: [{ label: 'Live', href: 'https://webforge.in' }],
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
    { id: 'agents', name: 'GenAI & Agents', color: 'blue', items: ['LangGraph (StateGraph, HITL interrupts, Postgres checkpointing)', 'LangChain', 'Tool / function-calling agents', 'RAG', 'Prompt engineering', 'Multi-agent systems', 'Agent memory', 'MCP (Model Context Protocol)', 'Vector search & embeddings'] },
    { id: 'platforms', name: 'LLM Platforms', color: 'violet', items: ['Amazon Bedrock (Converse API, Nova)', 'Bedrock AgentCore', 'OpenRouter (Claude, Gemini 2.0 Flash)', 'OpenAI APIs & embeddings', 'Gemini APIs', 'Microsoft Copilot Studio (Direct Line)', 'Azure AI Foundry', 'AWS QuickSuite Flows'] },
    { id: 'eval', name: 'Evaluation & Observability', color: 'blue', items: ['LangSmith', 'LLM-as-judge', 'Hallucination evaluation', 'Tool-accuracy evaluation', 'Latency & cost evaluation'] },
    { id: 'backend', name: 'Backend', color: 'violet', items: ['Python (FastAPI, Pydantic, uv)', 'Rust (basic)', 'Node.js', 'Express.js', 'REST APIs', 'SSE streaming', 'JWT / bcrypt auth', 'MVC architecture'] },
    { id: 'frontend', name: 'Frontend', color: 'blue', items: ['React.js', 'Next.js (App Router)', 'TypeScript', 'JavaScript (ES6+)', 'Vite', 'Redux / RTK Query', 'Tailwind CSS', 'shadcn/ui', 'MUI', 'Chakra UI', 'Framer Motion', 'Recharts', 'Tauri (desktop)', 'Microsoft Teams JS SDK'] },
    { id: 'data', name: 'Data & Databases', color: 'violet', items: ['Pandas', 'Polars', 'PyArrow / Parquet', 'openpyxl', 'xlsxwriter', 'fastexcel', 'PDF, DOCX & XLSX parsing', 'PostgreSQL', 'Aurora Serverless', 'Supabase', 'MongoDB (Mongoose)', 'SQLite', 'Alembic migrations', 'Pinecone'] },
    { id: 'cloud', name: 'Cloud & DevOps', color: 'blue', items: ['AWS (Bedrock, AgentCore, Aurora, S3, Secrets Manager, CloudWatch, Cost Explorer, Budgets)', 'Docker / Docker Compose', 'Jenkins CI/CD', 'MinIO', 'Vercel', 'Netlify', 'Git branching & release flow'] },
    { id: 'tools', name: 'Testing & Tools', color: 'violet', items: ['pytest', 'Playwright (E2E)', 'Claude Code', 'Cursor', 'GitHub Copilot', 'Windsurf', 'Postman', 'Power BI', 'python-pptx', 'GrapesJS', 'Yarn workspaces', 'OpenAPI SDK generation'] },
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

/* ───────────────────────── Light (Apple-style) edition ───────────────────────── */

export const light = {
  hero: {
    eyebrow: 'AI Engineer',
    title: 'Abhishek Dukare.',
    // Appears as he turns to face you.
    reveal: 'Agents that turn days of work into hours.',
    sub: 'Agentic AI · LLM Applications · RAG — built with LangGraph and AWS Bedrock, shipped to production.',
  },
  statement: [
    { t: 'AI Engineer with ' },
    { t: '3+ years', hl: true },
    { t: ' building GenAI products end to end. I design the agent, build the product around it, and ' },
    { t: 'take it to production', hl: true },
    { t: '.' },
  ] as Rich,
  /** Full-screen moment: the counter rolls from 6 to 1 as you scroll. */
  days: {
    before: 'A 4–5 person team. Six days of data mapping.',
    after: 'The same work, done in one day — with IngestIQ.',
  },
  numbers: [
    { value: '~40%', label: 'Lower AWS spend.', size: 'sm', tone: 'plain' },
    { value: '2,000+', label: 'Project PA downloads at launch.', size: 'sm', tone: 'plain' },
    { value: '13', label: 'Nodes in a LangGraph agent, with human approval built in.', size: 'sm', tone: 'dark' },
    { value: '205 MB', label: 'Workbook load-tested end to end: 10 sheets, 200 columns, 20K rows.', size: 'wide', tone: 'plain' },
    { value: '200–250', label: 'Schools using the QuickCampus ERP modules I built.', size: 'sm', tone: 'plain' },
  ],
  ingest: {
    eyebrow: 'IngestIQ',
    title: ['Six days of mapping.', 'Now one.'] as [string, string],
    steps: [
      { k: 'Understand', t: 'Maps incoming Excel and data files to target templates — at sheet, table and column level.' },
      { k: 'Decide', t: 'A 13-node LangGraph agent cleans the data and plans the transformation.' },
      { k: 'Approve', t: 'A human reviews every decision. Full audit trail, nothing silent.' },
      { k: 'Scale', t: 'Migrated to Amazon Bedrock, AgentCore, Aurora Serverless and S3 — with ~40% lower AWS spend.' },
    ],
  },
  film: { eyebrow: 'In person', title: 'Meet Abhishek.', sub: 'Based in Bengaluru. Open to Pune, Hyderabad and remote teams.' },
  work: { eyebrow: 'Experience', title: 'Where I’ve shipped.' },
  projects: { eyebrow: 'Projects', title: 'Things I’ve built.' },
  skills: { eyebrow: 'Toolkit', title: 'The stack behind the agents.' },
  life: { eyebrow: 'Off the clock', title: 'Beyond the code.' },
  contact: { title: ['Let’s build an agent that saves your team', 'days.'] as [string, string], sub: 'Open to AI Engineer roles in Bengaluru, Pune, Hyderabad or Remote.' },
}

/**
 * "Also building" section. Set `show: false` to hide it (e.g. for large corporate
 * applications) — nothing else on the site references Webforge except the footer credit.
 */
export const webforgeSection = {
  show: true,
  eyebrow: 'Also building',
  title: 'Webforge.',
  line: 'I design, build and ship complete products for real customers, from first demo to launch.',
  what: 'A complete online presence for local shops — website, Google profile and a WhatsApp assistant — shown to the owner as a free demo before they pay.',
  href: 'https://webforge.in',
  image: '/img/webforge.webp',
  imageAlt: 'The webforge.in homepage: “Your whole shop online, built and shown to you free first.”',
}
