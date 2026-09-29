/** "Agents, *end to end.*" → tokens; words inside *…* render in the serif italic. */
export function parseAccent(text: string) {
  const tokens: { word: string; accent: boolean }[] = []
  text.split(/(\*[^*]+\*)/).forEach((chunk) => {
    const accent = chunk.startsWith('*') && chunk.endsWith('*')
    const body = accent ? chunk.slice(1, -1) : chunk
    body
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word) => tokens.push({ word, accent }))
  })
  return tokens
}

export const plain = (text: string) => text.replace(/\*/g, '')
