import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authService.login(email, password)
      // Primero guardar el token en localStorage
      localStorage.setItem('token', response.access_token)
      // Luego obtener los datos del usuario
      const user = await authService.getCurrentUser()
      // Finalmente actualizar el store
      setAuth(user, response.access_token)
      toast.success('¡Bienvenido!')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.detail || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    authService.loginWithGoogle()
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white dark:bg-[#1a232e] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 overflow-hidden relative">
        {/* Header */}
        <div className="pt-8 pb-2 px-6 flex flex-col items-center text-center">
          <img src="/images/logopequeno.png" alt="FitMyCV Logo" className="w-16 h-16 mb-5" />
          <h2 className="text-[#0d131b] dark:text-white tracking-tight text-[26px] font-bold leading-tight pb-2">
            Bienvenido a FitMyCV
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal px-4">
            Adapta tu currículum en segundos con IA
          </p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          {/* Email Field */}
          <div className="flex flex-col gap-1">
            <label className="text-[#0d131b] dark:text-slate-200 text-sm font-medium leading-normal pb-1">
              Correo Electrónico
            </label>
            <input
              className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-[#0d131b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#cfd9e7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:border-primary h-12 placeholder:text-[#4c6c9a] p-[15px] text-base font-normal leading-normal transition-all"
              placeholder="ejemplo@correo.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          {/* Remember & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                className="w-4 h-4 rounded border-[#cfd9e7] dark:border-slate-600 text-primary focus:ring-primary/20 cursor-pointer"
                type="checkbox"
              />
              <span className="text-slate-600 dark:text-slate-400 text-sm group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">
                Recordarme
              </span>
            </label>
            <a
              className="text-primary text-sm font-medium hover:text-primary/80 hover:underline transition-all"
              href="#"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Primary Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary hover:bg-[#0f5bbb] text-white rounded-lg text-base font-semibold shadow-md shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
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
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
            >
              <span className="text-slate-700 dark:text-white text-sm font-medium">Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
            >
              <span className="text-slate-700 dark:text-white text-sm font-medium">LinkedIn</span>
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-900/40 py-4 px-6 text-center border-t border-slate-100 dark:border-slate-800/60">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ¿No tienes una cuenta?{' '}
            <Link className="text-primary font-semibold hover:underline" to="/register">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
