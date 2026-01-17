import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import toast from 'react-hot-toast'

interface HeaderProps {
  notificationCount?: number
}

export default function Header({ notificationCount = 0 }: HeaderProps) {
  const { user, clearAuth } = useAuthStore()
  const { toggleTheme, isDark } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
    toast.success('Sesión cerrada')
  }

  return (
    <header className="sticky top-0 z-30 w-full flex items-center justify-between bg-background-light/90 dark:bg-background-dark/90 px-4 py-3 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="bg-primary/20 dark:bg-primary/30 rounded-full size-10 border-2 border-white dark:border-slate-700 shadow-sm flex items-center justify-center">
            <span className="text-primary font-bold text-lg">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
        </div>
        <div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            Hola, {user?.full_name?.split(' ')[0] || 'Usuario'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Free Plan</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          {notificationCount > 0 && (
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
          )}
        </button>
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors"
          title="Cerrar sesión"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  )
}
