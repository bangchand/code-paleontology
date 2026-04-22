import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { GoogleGenAI } from '@google/genai'

const app = new Hono()
app.use('/api/*', cors())

const AI_API_URL = process.env.AI_API_URL
const STORY_API_KEY = process.env.STORY_API_KEY
const IMAGE_API_KEYS = (process.env.IMAGE_API_KEYS || '').split(',').filter(Boolean)
let currentImageKeyIndex = 0;

function getNextImageApiKey() {
  const key = IMAGE_API_KEYS[currentImageKeyIndex];
  currentImageKeyIndex = (currentImageKeyIndex + 1) % IMAGE_API_KEYS.length;
  return key;
}

if (!AI_API_URL || !STORY_API_KEY || IMAGE_API_KEYS.length === 0) {
  console.error('[Fatal] AI_API_URL, STORY_API_KEY, and IMAGE_API_KEYS are required.')
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
  const prompt = `You are a storyteller explaining a GitHub repository to teenagers. Write the narration in casual Bahasa Indonesia.

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
[{"index":1,"image_prompt":"make a flat vector illustration style like a duolingo cartoon: description of the scene...","narration":"short casual Indonesian text..."},{"index":2,...}]

Rules:
- Make 6 slides
- Each image_prompt must start with "make a flat vector illustration style like a duolingo cartoon:" and describe a vivid scene
- Narration must flow like a story. Use format like "Pada suatu hari, ...", "Namun sayangnya, ...", "Akhirnya, ...", "Dan sejak saat itu, ...".
- Each narration is 1-2 short sentences in casual Bahasa Indonesia (easy for teens to understand).
- Story arc: problem discovery → struggle → solution → community → legacy`

  const res = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STORY_API_KEY}`,
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

async function generateImage(imagePrompt: string, slideIndex: number, attempt = 1): Promise<string> {
  const maxAttempts = 3;
  console.log(`[AI:Image] Generating image for slide #${slideIndex} (Attempt ${attempt}/${maxAttempts})...`)

  try {
    const ai = new GoogleGenAI({
      apiKey: getNextImageApiKey(),
    });

    const config = {
      responseModalities: ['IMAGE' as const],
    };

    // Explicitly ask for 16:9 ratio in the prompt
    const finalPrompt = `${imagePrompt}\n\nIMPORTANT: Generate image in 16:9 aspect ratio.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Keep existing model name but use SDK
      config,
      contents: [
        {
          role: 'user',
          parts: [{ text: finalPrompt }],
        },
      ],
    });

    if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const inlineData = response.candidates[0].content.parts[0].inlineData;
      const cleanContent = typeof inlineData.data === 'string' ? inlineData.data.replace(/\s+/g, '') : '';
      console.log(`[AI:Image] Slide #${slideIndex} got image content (${cleanContent.length} chars)`)
      return `data:${inlineData.mimeType};base64,${cleanContent}`;
    }

    console.warn(`[AI:Image] Slide #${slideIndex} returned no inlineData`);
    throw new Error('No inlineData returned');
  } catch (err) {
    console.error(`[AI:Image] Slide #${slideIndex} failed (Attempt ${attempt}/${maxAttempts}):`, err instanceof Error ? err.message : err);

    if (attempt < maxAttempts) {
      console.log(`[AI:Image] Slide #${slideIndex} waiting 10s before retry...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      return generateImage(imagePrompt, slideIndex, attempt + 1);
    }

    return '';
  }
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
