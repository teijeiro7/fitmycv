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

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased min-h-screen">
      <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark">
        {/* Top Navigation */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
          <Link to="/" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </Link>
          <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
            <img src="/images/logopequeno.png" alt="FitMyCV Logo" className="w-6 h-6" />
            <h2 className="text-base font-semibold tracking-tight">FitMyCV</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col pb-8">
          {/* Hero */}
          <div className="px-6 pt-6 pb-2">
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white mb-2">
              Mejora tu CV
              <br />
              <span className="text-primary">con Inteligencia Artificial</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Únete a miles de profesionales que han conseguido el trabajo de sus sueños.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex flex-col items-start gap-3 border border-slate-100 dark:border-slate-700">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">auto_fix_high</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Adapta en segundos</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Personalización instantánea</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex flex-col items-start gap-3 border border-slate-100 dark:border-slate-700">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <span className="material-symbols-outlined">filter_alt</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Supera filtros ATS</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Optimización de palabras clave</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Nombre Completo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <input
                  className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-primary transition-all shadow-sm"
                  placeholder="Ej. Juan Pérez"
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Correo Electrónico</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input
                  className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-primary transition-all shadow-sm"
                  placeholder="nombre@ejemplo.com"
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input
                  className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-10 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-primary transition-all shadow-sm"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 px-1">Mínimo 8 caracteres</p>
            </div>

            <div className="flex items-start gap-2 mt-2">
              <input className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary bg-slate-50 dark:bg-slate-800 dark:border-slate-600" type="checkbox" required />
              <label className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Acepto los <a className="text-primary hover:underline" href="#">Términos de Servicio</a> y la <a className="text-primary hover:underline" href="#">Política de Privacidad</a>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creando cuenta...' : 'Crear Cuenta'}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8 px-6">
            <div className="absolute inset-0 flex items-center px-6">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background-light dark:bg-background-dark px-2 text-xs text-slate-400 font-medium">O continúa con</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="px-6 flex gap-3">
            <button
              type="button"
              onClick={() => authService.loginWithGoogle()}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 py-3 rounded-xl transition-colors"
            >
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Google</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 py-3 rounded-xl transition-colors">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Apple</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center pb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ¿Ya tienes una cuenta?{' '}
              <Link className="text-primary font-semibold hover:underline" to="/login">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
