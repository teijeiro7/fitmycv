import api from './api'
import type { Resume, Adaptation, AdaptationDetail, JobDescription } from '@/types'

export const resumeService = {
  async uploadResume(file: File, title: string): Promise<Resume> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    
    const response = await api.post<Resume>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async listResumes(): Promise<Resume[]> {
    const response = await api.get<Resume[]>('/api/upload')
    return response.data
  },

  async scrapeJob(url?: string, description?: string): Promise<JobDescription> {
    const response = await api.post<JobDescription>('/api/scrape', {
      url,
      description,
    })
    return response.data
  },

  async optimizeResume(
    resumeId: number,
    jobTitle: string,
    jobDescription: string,
    jobUrl?: string
  ): Promise<AdaptationDetail> {
    const response = await api.post<AdaptationDetail>('/api/optimize/adapt', {
      resume_id: resumeId,
      job_title: jobTitle,
      job_description: jobDescription,
      job_url: jobUrl,
    })
    return response.data
  },

  async getAdaptations(): Promise<Adaptation[]> {
    const response = await api.get<Adaptation[]>('/api/optimize/history')
    return response.data
  },

  async getAdaptation(id: number): Promise<AdaptationDetail> {
    const response = await api.get<AdaptationDetail>(`/api/optimize/${id}`)
    return response.data
  },
}
