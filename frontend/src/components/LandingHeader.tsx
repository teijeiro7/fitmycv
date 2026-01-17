import { Link } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'

interface LandingHeaderProps {
  showThemeToggle?: boolean
}

export default function LandingHeader({ showThemeToggle = false }: LandingHeaderProps) {
  const { isDark, toggleTheme } = useThemeStore()

  return (
    <header className="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 border-b border-slate-200 dark:border-slate-800 justify-between">
      <div className="flex items-center gap-3">
        <Link to="/">
          <img src="/images/logopequeno.png" alt="FitMyCV Logo" className="w-8 h-8" />
        </Link>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
          FitMyCV
        </h2>
      </div>
      <div className="flex items-center gap-4">
        {showThemeToggle && (
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        )}
        <Link
          to="/login"
          className="hidden sm:block text-slate-600 dark:text-slate-300 font-medium text-sm hover:text-primary transition-colors"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="hidden sm:flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-white text-sm font-bold shadow-sm hover:bg-blue-600 transition-colors"
        >
          Registrarse
        </Link>
      </div>
    </header>
  )
}
