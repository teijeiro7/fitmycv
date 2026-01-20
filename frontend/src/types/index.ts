export interface User {
  id: number
  email: string
  full_name: string | null
  is_active: boolean
  is_verified: boolean
  oauth_provider: string | null
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface Resume {
  id: number
  title: string
  original_filename: string
  created_at: string
}

export interface Adaptation {
  id: number
  job_title: string
  job_company?: string
  job_location?: string
  match_score: number | null
  created_at: string
}

export interface AdaptationDetail {
  id: number
  job_title: string
  match_score: number
  keywords_added: string[]
  optimized_content: {
    name: string
    title: string
    summary: string
    experience: Array<{
      title: string
      company: string
      date: string
      achievements: string[]
    }>
    skills: string[]
    education: any[]
  }
  language?: string
  language_reason?: string
  selected_github_projects?: Array<{
    name: string
    reason: string
  }>
  changes_made?: string[]
  recommendations?: string[]
  adapted_file_path: string
  pdf_file_path: string | null
}

export interface JobDescription {
  title: string
  description: string
  keywords: string[]
  skills: string[]
}
