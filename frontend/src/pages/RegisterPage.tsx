import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '@/services/authService'

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authService.register(formData.email, formData.password, formData.fullName)
      toast.success('¡Cuenta creada! Por favor inicia sesión')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await authService.loginWithGoogle()
    } catch (error) {
      console.error('Google login error:', error)
      toast.error('No se puede conectar con Google. Verifica que el servidor esté funcionando.')
    }
  }

  const handleGithubLogin = async () => {
    try {
      await authService.loginWithGithub()
    } catch (error) {
      console.error('GitHub login error:', error)
      toast.error('No se puede conectar con GitHub. Verifica que el servidor esté funcionando.')
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[420px] bg-white dark:bg-[#1a232e] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="pt-8 pb-2 px-6 flex flex-col items-center text-center">
          <img src="/images/logopequeno.png" alt="FitMyCV Logo" className="w-16 h-16 mb-5" />
          <h2 className="text-[#0d131b] dark:text-white tracking-tight text-[26px] font-bold leading-tight pb-2">
            Crea tu cuenta
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal px-4">
            Mejora tu CV con Inteligencia Artificial
          </p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Full Name Field */}
          <div className="flex flex-col gap-1">
            <label className="text-[#0d131b] dark:text-slate-200 text-sm font-medium leading-normal pb-1">
              Nombre Completo
            </label>
            <input
              className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-[#0d131b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#cfd9e7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:border-primary h-12 placeholder:text-[#4c6c9a] p-[15px] text-base font-normal leading-normal transition-all"
              placeholder="Ej. Juan Pérez"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1">
            <label className="text-[#0d131b] dark:text-slate-200 text-sm font-medium leading-normal pb-1">
              Correo Electrónico
            </label>
            <input
              className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-[#0d131b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#cfd9e7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:border-primary h-12 placeholder:text-[#4c6c9a] p-[15px] text-base font-normal leading-normal transition-all"
              placeholder="nombre@ejemplo.com"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1">
            <label className="text-[#0d131b] dark:text-slate-200 text-sm font-medium leading-normal pb-1">
              Contraseña
            </label>
            <div className="flex w-full items-stretch rounded-lg relative">
              <input
                className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-[#0d131b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#cfd9e7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:border-primary h-12 placeholder:text-[#4c6c9a] p-[15px] pr-12 text-base font-normal leading-normal transition-all"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                className="absolute right-0 top-0 h-full px-3 text-[#4c6c9a] hover:text-primary dark:text-slate-400 flex items-center justify-center rounded-r-lg transition-colors"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mínimo 8 caracteres</p>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              className="w-4 h-4 mt-0.5 rounded border-[#cfd9e7] dark:border-slate-600 text-primary focus:ring-primary/20 cursor-pointer"
              type="checkbox"
              required
            />
            <label className="text-slate-600 dark:text-slate-400 text-xs leading-normal">
              Acepto los{' '}
              <a className="text-primary hover:underline" href="#">
                Términos de Servicio
              </a>{' '}
              y la{' '}
              <a className="text-primary hover:underline" href="#">
                Política de Privacidad
              </a>
              .
            </label>
          </div>

          {/* Primary Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary hover:bg-[#0f5bbb] text-white rounded-lg text-base font-semibold shadow-md shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>

          {/* Social Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              O continúa con
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
            >
              <span className="text-slate-700 dark:text-white text-sm font-medium">Google</span>
            </button>
            <button
              type="button"
              onClick={handleGithubLogin}
              className="flex items-center justify-center gap-2 h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
            >
              <span className="text-slate-700 dark:text-white text-sm font-medium">GitHub</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
            >
              <span className="text-slate-700 dark:text-white text-sm font-medium">Apple</span>
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-900/40 py-4 px-6 text-center border-t border-slate-100 dark:border-slate-800/60">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ¿Ya tienes una cuenta?{' '}
            <Link className="text-primary font-semibold hover:underline" to="/login">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
