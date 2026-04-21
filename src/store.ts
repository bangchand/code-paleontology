import { create } from 'zustand'

export interface AnalysisResult {
  index: number
  image_url: string
  narration: string
}

interface AnalysisState {
  results: AnalysisResult[]
  loading: boolean
  error: string | null
  analyze: (repoUrl: string) => Promise<void>
  reset: () => void
}

export const useAnalysisStore = create<AnalysisState>()((set) => ({
  results: [],
  loading: false,
  error: null,

  analyze: async (repoUrl: string) => {
    set({ loading: true, error: null, results: [] })

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl }),
      })

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)

      const data: AnalysisResult[] = await res.json()
      set({ results: data, loading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Unknown error',
        loading: false,
      })
    }
  },

  reset: () => set({ results: [], loading: false, error: null }),
}))
