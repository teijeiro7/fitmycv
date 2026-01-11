import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const username = searchParams.get('username')
      const provider = searchParams.get('provider') || 'oauth'
      
      if (!token) {
        toast.error('Error en la autenticación')
        navigate('/login')
        return
      }

      try {
        // If it's GitHub callback, save GitHub-specific info
        if (username) {
          localStorage.setItem('github_token', token)
          localStorage.setItem('github_username', username)
        }
        
        // Save token and fetch user info
        localStorage.setItem('token', token)
        const user = await authService.getCurrentUser()
        setAuth(user, token)
        
        const welcomeMessage = username 
          ? `¡Bienvenido, ${username}!` 
          : '¡Bienvenido!'
        toast.success(welcomeMessage)
        navigate('/dashboard')
      } catch (error) {
        console.error('Auth callback error:', error)
        toast.error('Error al autenticar')
        navigate('/login')
      }
    }

    handleCallback()
  }, [searchParams, navigate, setAuth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">
          {searchParams.get('username') ? 'Conectando con GitHub...' : 'Autenticando...'}
        </p>
      </div>
    </div>
  )
}
