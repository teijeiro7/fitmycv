import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import api from '@/services/api'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export default function SettingsPage() {
  const { user, setAuth, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('menu')
  const [loading, setLoading] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  
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
  }, [user])

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
