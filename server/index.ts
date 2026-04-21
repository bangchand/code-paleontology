import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'

const app = new Hono()
app.use('/api/*', cors())

const AI_API_URL = process.env.AI_API_URL!
const AI_API_KEY = process.env.AI_API_KEY!

if (!AI_API_URL || !AI_API_KEY) {
  console.error('[Fatal] AI_API_URL and AI_API_KEY env vars are required.')
  process.exit(1)
}

const GH_HEADERS = {
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'code-paleontology',
}

// --- GitHub helpers ---

function parseGithubUrl(url: string) {
  const match = url.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: GH_HEADERS })
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}

async function getGithubContext(owner: string, repo: string) {
  const base = `https://api.github.com/repos/${owner}/${repo}`
  console.log(`[GH] Fetching context for ${owner}/${repo}...`)

  const [repoInfo, readmeRes, issues, pulls, commits] = await Promise.all([
    fetchJSON<any>(base),
    fetchJSON<any>(`${base}/readme`),
    fetchJSON<any[]>(`${base}/issues?state=all`),
    fetchJSON<any[]>(`${base}/pulls?state=all`),
    fetchJSON<any[]>(`${base}/commits?`),
  ])

  if (!repoInfo) {
    console.log(`[GH] Repository ${owner}/${repo} not found or inaccessible`)
    return null
  }
  console.log(`[GH] Repo found: ${repoInfo.full_name} (${repoInfo.stargazers_count} stars)`)

  const readmeText = readmeRes?.content
    ? Buffer.from(readmeRes.content, 'base64').toString('utf-8').slice(0, 3000)
    : 'No README found.'
  console.log(`[GH] README: ${readmeText !== 'No README found.' ? `${readmeText.length} chars` : 'none'}`)
  console.log(`[GH] Issues: ${(issues || []).filter((i) => !i.pull_request).length} | Pulls: ${(pulls || []).length} | Commits: ${(commits || []).length}`)

  const issueList = (issues || [])
    .filter((i) => !i.pull_request)
    .slice(0, 8)
    .map((i) => `- ${i.title}${i.body ? `: ${i.body.slice(0, 150)}` : ''}`)

  const pullList = (pulls || [])
    .slice(0, 8)
    .map((p) => `- ${p.title}${p.body ? `: ${p.body.slice(0, 150)}` : ''}`)

  const commitList = (commits || [])
    .slice(0, 8)
    .map((c) => `- [${c.commit?.author?.date}] ${c.commit?.message?.slice(0, 120)}`)

  return {
    url: `https://github.com/${owner}/${repo}`,
    issuesUrl: `https://github.com/${owner}/${repo}/issues`,
    pullsUrl: `https://github.com/${owner}/${repo}/pulls`,
    name: repoInfo.full_name,
    description: repoInfo.description || 'No description',
    stars: repoInfo.stargazers_count,
    createdAt: repoInfo.created_at,
    readme: readmeText,
    issues: issueList.join('\n') || 'No issues found.',
    pulls: pullList.join('\n') || 'No pull requests found.',
    commits: commitList.join('\n') || 'No commits found.',
  }
}

// --- AI helpers ---

async function generateStory(ctx: Awaited<ReturnType<typeof getGithubContext>> & {}) {
  const prompt = `You are a dramatic historian telling the story of a GitHub repository as if it were an epic tale.

Repository: ${ctx.name}
URL: ${ctx.url}
Description: ${ctx.description}
Stars: ${ctx.stars} | Created: ${ctx.createdAt}

README:
${ctx.readme}

Recent Issues (user pain points):
${ctx.issues}

Recent Pull Requests (community contributions):
${ctx.pulls}

Recent Commits:
${ctx.commits}

Using the README, figure out WHY this repository was created — what problem it solves.
Weave in "side stories" from the pull requests and user issues.

Return ONLY a raw JSON array (no markdown fences, no explanation). Format:
[{"index":1,"image_prompt":"cartoon black-and-white ink sketch style: description of the scene...","narration":"dramatic paragraph telling the story..."},{"index":2,...}]

Rules:
- Make 6 slides
- Each image_prompt must start with "cartoon black-and-white ink sketch style:" and describe a vivid scene
- Each narration is 2-3 dramatic sentences
- Story arc: problem discovery → struggle → solution → community → legacy`

  const res = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error(`[AI:Story] Failed with status ${res.status}: ${errText}`)
    throw new Error(`Story API failed: ${res.status}`)
  }
  const data = await res.json()
  const text: string = data.choices?.[0]?.message?.content || ''
  console.log(`[AI:Story] Raw response length: ${text.length} chars`)

  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    console.error(`[AI:Story] Could not find JSON array in response. First 500 chars: ${text.slice(0, 500)}`)
    throw new Error('Could not parse story JSON from AI response')
  }

  const parsed = JSON.parse(jsonMatch[0]) as Array<{
    index: number
    image_prompt: string
    narration: string
  }>
  console.log(`[AI:Story] Parsed ${parsed.length} slides`)
  return parsed
}

async function generateImage(imagePrompt: string, slideIndex: number): Promise<string> {
  console.log(`[AI:Image] Generating image for slide #${slideIndex}...`)
  const res = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gemini-3.1-flash-image',
      messages: [{ role: 'user', content: imagePrompt }],
    }),
  })

  if (!res.ok) {
    console.error(`[AI:Image] Slide #${slideIndex} failed with status ${res.status}`)
    return ''
  }
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    console.warn(`[AI:Image] Slide #${slideIndex} returned empty content`)
    return ''
  }

  // If content is base64 image data, wrap as data URL
  if (typeof content === 'string' && /^[A-Za-z0-9+/=]+$/.test(content) && content.length > 200) {
    console.log(`[AI:Image] Slide #${slideIndex} got base64 image (${content.length} chars)`)
    return `data:image/png;base64,${content}`
  }

  console.log(`[AI:Image] Slide #${slideIndex} got URL/image (${content.slice(0, 80)}...)`)
  return content
}

// --- Route ---

app.post('/api/analyze', async (c) => {
  const body = await c.req.json<{ url: string }>()
  if (!body.url) return c.json({ error: 'url is required' }, 400)

  const parsed = parseGithubUrl(body.url)
  if (!parsed) return c.json({ error: 'Invalid GitHub URL' }, 400)

  console.log(`\n========== New Analysis: ${parsed.owner}/${parsed.repo} ==========`)

  const ctx = await getGithubContext(parsed.owner, parsed.repo)
  if (!ctx) return c.json({ error: 'Repository not found or is private' }, 404)

  try {
    console.log('[Story] Generating story...')
    const slides = await generateStory(ctx)

    console.log(`[Image] Generating ${slides.length} images in parallel...`)
    const results = await Promise.all(
      slides.map(async (slide) => {
        const imageUrl = await generateImage(slide.image_prompt, slide.index)
        return {
          index: slide.index,
          image_url: imageUrl,
          narration: slide.narration,
        }
      }),
    )

    console.log(`========== Analysis complete: ${results.length} slides returned ==========\n`)
    return c.json(results)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    console.error(`[Error] Analysis failed: ${message}`)
    return c.json({ error: message }, 500)
  }
})

const port = Number(process.env.PORT) || 3003
console.log(`API server running on http://localhost:${port}`)
serve({ fetch: app.fetch, port })
