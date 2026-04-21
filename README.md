# Code Paleontology

Explore the history of any GitHub repository through dramatic AI-generated stories with cartoon illustrations.

## Run Locally

**Prerequisites:** Node.js, Bun

1. Install dependencies:
   ```bash
   bun install
   ```

2. Create `.env.local` with your API keys:
   ```
   AI_API_URL=http://your-ai-api-url/v1/chat/completions
   AI_API_KEY=your-api-key
   ```

3. Start both frontend and API:
   ```bash
   bun run dev:all
   ```

   Or run them separately:
   ```bash
   bun run dev          # Vite frontend on :3000
   bun run dev:api      # Hono API server on :3003
   ```

4. Open `http://localhost:3000`

## How It Works

1. Paste a GitHub repo URL
2. The server fetches repo context (README, issues, PRs, commits) via GitHub API
3. An AI generates a dramatic 6-slide story about the repo's history
4. Each slide's scene is illustrated as a cartoon image
5. Results are displayed in a carousel
