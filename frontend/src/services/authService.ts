import api from './api'
import type { AuthResponse, User } from '@/types'

export const authService = {
  async register(email: string, password: string, fullName: string): Promise<User> {
    const response = await api.post<User>('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    })
    return response.data
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    
    const response = await api.post<AuthResponse>('/api/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/api/users/me')
    return response.data
  },

  async loginWithGoogle(): Promise<void> {
    try {
      const response = await api.get<{ auth_url: string }>('/api/auth/google')
      window.location.href = response.data.auth_url
    } catch (error) {
      console.error('Error getting Google auth URL:', error)
      throw error
    }
  },
}
