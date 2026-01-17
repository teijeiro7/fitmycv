import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import api from '@/services/api'
import { githubService } from '@/services/githubService'
import { authService } from '@/services/authService'
import type { GithubRepo, GithubStatus } from '@/services/githubService'
import Header from '@/components/LoginHeader'
import BottomNav from '@/components/BottomNav'

export default function SettingsPage() {
  const { user, setAuth, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('menu')
  const [loading, setLoading] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)

  // GitHub states
  const [githubStatus, setGithubStatus] = useState<GithubStatus | null>(null)
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([])
  const [githubLoading, setGithubLoading] = useState(false)
  const [showGithubRepos, setShowGithubRepos] = useState(false)

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || '',
        email: user.email || '',
      }))
    }
    // Load GitHub status
    loadGithubStatus()
  }, [user])

  const loadGithubStatus = async () => {
    try {
      const status = await githubService.getStatus()
      setGithubStatus(status)
      if (status.connected) {
        const repos = await githubService.getRepos()
        setGithubRepos(repos)
      }
    } catch (error) {
      console.error('Error loading GitHub status:', error)
    }
  }

  const handleConnectGithub = async () => {
    try {
      const response = await api.get<{ auth_url: string; state: string }>('/api/auth/github')
      window.location.href = response.data.auth_url
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al conectar con GitHub')
    }
  }

  const handleDisconnectGithub = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres desconectar tu cuenta de GitHub? Se eliminarán todos los repositorios sincronizados.'
    )

    if (!confirmed) return

    setGithubLoading(true)
    try {
      await githubService.disconnect()
      setGithubStatus({ connected: false, username: null })
      setGithubRepos([])
      toast.success('Cuenta de GitHub desconectada')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al desconectar GitHub')
    } finally {
      setGithubLoading(false)
    }
  }

  const handleSyncRepos = async () => {
    setGithubLoading(true)
    try {
      const result = await githubService.syncRepos()
      toast.success(`${result.message}: ${result.count} repositorios`)
      await loadGithubStatus()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al sincronizar repositorios')
    } finally {
      setGithubLoading(false)
    }
  }

  const handleToggleRepo = async (repoId: number) => {
    try {
      await githubService.toggleRepo(repoId)
      // Update local state
      setGithubRepos(repos =>
        repos.map(repo =>
          repo.id === repoId ? { ...repo, is_selected: !repo.is_selected } : repo
        )
      )
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al actualizar repositorio')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate password if user wants to change it
    if (showPasswordFields) {
      if (!formData.newPassword || formData.newPassword.length < 8) {
        toast.error('La contraseña debe tener al menos 8 caracteres')
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden')
        return
      }
    }

    setLoading(true)

    try {
      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
      }

      if (showPasswordFields && formData.newPassword) {
        updateData.password = formData.newPassword
      }

      const response = await api.put('/api/users/me', updateData)
      
      // Update auth store with new user data
      const token = localStorage.getItem('token') || ''
      setAuth(response.data, token)
      
      toast.success('Perfil actualizado correctamente')
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
      setShowPasswordFields(false)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.detail || 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
    )
    
    if (confirmed) {
      toast.error('Función de eliminar cuenta aún no implementada')
      // TODO: Implement delete account endpoint
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      
      <main className="w-full flex flex-col gap-6 p-4 pb-24 max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configuración</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona tu cuenta y preferencias</p>
          </div>
        </div>

        {/* Profile Section */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Información Personal</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nombre Completo
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                placeholder="Ej. Juan Pérez"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                placeholder="ejemplo@correo.com"
              />
            </div>

            {/* Change Password Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-blue-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPasswordFields ? 'expand_less' : 'expand_more'}
                </span>
                {showPasswordFields ? 'Ocultar' : 'Cambiar contraseña'}
              </button>
            </div>

            {/* Password Fields */}
            {showPasswordFields && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                    placeholder="Repite la contraseña"
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </section>

        {/* Account Info */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Información de Cuenta</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Estado de la cuenta</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {user?.is_active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            
            {user?.oauth_provider && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Conectado con</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                  {user.oauth_provider}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Miembro desde</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </span>
            </div>
          </div>
        </section>

        {/* GitHub Integration */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-slate-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">GitHub</h2>
            </div>
            {githubStatus?.connected && (
              <span className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                @{githubStatus.username}
              </span>
            )}
          </div>

          {!githubStatus?.connected ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Conecta tu cuenta de GitHub para sincronizar tus repositorios y mejorar tu CV con tus proyectos.
              </p>
              <button
                onClick={handleConnectGithub}
                className="w-full h-12 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Conectar GitHub
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {githubRepos.length} repositorios sincronizados
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSyncRepos}
                    disabled={githubLoading}
                    className="px-4 h-10 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">sync</span>
                    Sincronizar
                  </button>
                  <button
                    onClick={handleDisconnectGithub}
                    disabled={githubLoading}
                    className="px-4 h-10 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">link_off</span>
                    Desconectar
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowGithubRepos(!showGithubRepos)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-blue-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showGithubRepos ? 'expand_less' : 'expand_more'}
                </span>
                {showGithubRepos ? 'Ocultar' : 'Ver repositorios'}
              </button>

              {showGithubRepos && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700 max-h-80 overflow-y-auto">
                  {githubRepos.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      No hay repositorios sincronizados
                    </p>
                  ) : (
                    githubRepos.map((repo) => (
                      <div
                        key={repo.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <a
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-slate-900 dark:text-white hover:text-primary transition-colors truncate"
                            >
                              {repo.name}
                            </a>
                            {repo.is_private && (
                              <span className="material-symbols-outlined text-[16px] text-slate-400">
                                lock
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            {repo.language && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {repo.language}
                              </span>
                            )}
                            {repo.stars > 0 && (
                              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-[14px]">star</span>
                                {repo.stars}
                              </span>
                            )}
                            {repo.forks > 0 && (
                              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-[14px]">fork_right</span>
                                {repo.forks}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleRepo(repo.id)}
                          className={`ml-3 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            repo.is_selected
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {repo.is_selected ? 'En CV' : 'No incluido'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/30 p-6">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Zona de Peligro</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Acciones irreversibles en tu cuenta
          </p>
          
          <button
            onClick={handleDeleteAccount}
            className="w-full h-12 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold rounded-lg border border-red-200 dark:border-red-900/30 active:scale-[0.98] transition-all"
          >
            Eliminar Cuenta
          </button>
        </section>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
