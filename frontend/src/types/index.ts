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
  adapted_file_path: string
  pdf_file_path: string | null
}

export interface JobDescription {
  title: string
  description: string
  keywords: string[]
  skills: string[]
}
