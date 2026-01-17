import { Link } from 'react-router-dom'

export default function LandingFooter() {
  return (
    <footer className="bg-background-light dark:bg-background-dark py-8 border-t border-slate-200 dark:border-slate-800">
      <div className="px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div className="flex items-center gap-2">
          <span className="text-slate-700 dark:text-slate-300 font-bold text-sm">
            FitMyCV
          </span>
        </div>
        <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
          <a className="hover:text-primary transition-colors" href="#">
            Características
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Precios
          </a>
          <Link className="hover:text-primary transition-colors" to="/login">
            Login
          </Link>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">© 2026 FitMyCV.</p>
      </div>
    </footer>
  )
}
