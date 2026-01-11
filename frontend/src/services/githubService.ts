import api from './api'

export interface GithubRepo {
  id: number
  user_id: number
  repo_id: string
  name: string
  full_name: string
  description: string | null
  url: string
  language: string | null
  languages: Record<string, number>
  topics: string[]
  stars: number
  is_selected: boolean
  created_at: string
  updated_at: string | null
}

export interface SyncReposResponse {
  message: string
  count: number
}

export const githubService = {
  /**
   * Initiate GitHub OAuth connection
   */
  async connect(): Promise<{ auth_url: string }> {
    const response = await api.get<{ auth_url: string }>('/api/github/connect')
    return response.data
  },

  /**
   * Sync user's GitHub repositories
   */
  async syncRepos(): Promise<SyncReposResponse> {
    const response = await api.post<SyncReposResponse>('/api/github/sync-repos')
    return response.data
  },

  /**
   * Get user's synced GitHub repositories
   */
  async getRepos(): Promise<GithubRepo[]> {
    const response = await api.get<GithubRepo[]>('/api/github/repos')
    return response.data
  },

  /**
   * Toggle repository selection for CV
   */
  async toggleRepo(repoId: number): Promise<{ is_selected: boolean }> {
    const response = await api.put<{ is_selected: boolean }>(`/api/github/repos/${repoId}/toggle`)
    return response.data
  },

  /**
   * Disconnect GitHub account
   */
  async disconnect(): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>('/api/github/disconnect')
    return response.data
  },

  /**
   * Get selected repositories for CV generation
   */
  async getSelectedRepos(): Promise<GithubRepo[]> {
    const repos = await this.getRepos()
    return repos.filter(repo => repo.is_selected)
  },

  /**
   * Get technology summary from selected repos
   */
  async getTechSummary(): Promise<Record<string, number>> {
    const repos = await this.getSelectedRepos()
    const techSummary: Record<string, number> = {}

    repos.forEach(repo => {
      // Count primary language
      if (repo.language) {
        techSummary[repo.language] = (techSummary[repo.language] || 0) + 1
      }

      // Count all languages by percentage
      if (repo.languages) {
        const totalBytes = Object.values(repo.languages).reduce((a, b) => (a as number) + (b as number), 0) as number
        Object.entries(repo.languages).forEach(([lang, bytes]) => {
          const weight = (bytes as number) / totalBytes
          techSummary[lang] = (techSummary[lang] || 0) + weight
        })
      }
    })

    // Sort by usage
    return Object.fromEntries(
      Object.entries(techSummary)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20) // Top 20 technologies
    )
  },
}
