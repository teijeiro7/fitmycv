import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { resumeService } from '@/services/resumeService'
import type { Adaptation } from '@/types'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, clearAuth } = useAuthStore()
  const { toggleTheme, isDark } = useThemeStore()
  const navigate = useNavigate()
  const [adaptations, setAdaptations] = useState<Adaptation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('home')

  useEffect(() => {
    loadAdaptations()
  }, [])

  const loadAdaptations = async () => {
    try {
      const data = await resumeService.getAdaptations()
      setAdaptations(data)
    } catch (error) {
      toast.error('Error al cargar historial')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
    toast.success('Sesión cerrada')
  }

  const getStatusBadge = (adaptation: Adaptation) => {
    // Si tiene match_score, está completado
    if (adaptation.match_score && adaptation.match_score > 0) {
      return (
        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Ready
        </span>
      )
    }
    return (
      <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
        Draft
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const usedCredits = adaptations.length
  const totalCredits = 20
  const percentage = (usedCredits / totalCredits) * 100

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen pb-24 relative overflow-x-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-background-light/90 dark:bg-background-dark/90 px-4 py-3 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
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
            {adaptations.length > 0 && (
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-col gap-6 p-4">
        {/* Stats Section */}
        <section>
          <div className="flex flex-col gap-3 rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-slate-900 dark:text-white text-base font-semibold">Monthly Usage</p>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                Resets in 5 days
              </span>
            </div>
            <div className="flex items-end gap-1">
              <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">{usedCredits}</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-1.5">
                / {totalCredits} Adaptations
              </p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mt-1 overflow-hidden">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
              You have {totalCredits - usedCredits} credits remaining this month.
            </p>
          </div>
        </section>

        {/* New Adaptation CTA */}
        <button 
          onClick={() => navigate('/upload')}
          className="w-full flex items-center justify-center gap-2 rounded-xl h-14 bg-primary text-white text-base font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-all hover:bg-blue-600"
        >
          <span className="material-symbols-outlined text-[24px]">add_circle</span>
          <span>New Adaptation</span>
        </button>

        {/* Recent Adaptations Grid */}
        <section>
          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Recent Activity</h2>
            <button className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : adaptations.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[64px]">
                description
              </span>
              <p className="text-slate-500 dark:text-slate-400 mt-4">No adaptations yet</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                Create your first CV adaptation to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {adaptations.slice(0, 5).map((adaptation) => (
                <button
                  key={adaptation.id}
                  onClick={() => navigate(`/preview/${adaptation.id}`)}
                  className="group flex gap-4 rounded-xl bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all active:bg-slate-50 dark:active:bg-slate-700/50 text-left"
                >
                  <div className="bg-white dark:bg-slate-700 p-2 rounded-lg size-12 shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-600">
                    <span className="material-symbols-outlined text-primary text-[32px]">
                      description
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-slate-900 dark:text-white text-base font-bold leading-tight line-clamp-1">
                        {adaptation.job_title || 'Untitled Position'}
                      </h3>
                      {getStatusBadge(adaptation)}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        {adaptation.match_score ? `${adaptation.match_score}% match` : 'Processing...'}
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-xs">
                        {formatDate(adaptation.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Bottom Spacer */}
        <div className="h-6"></div>
      </main>

      {/* FAB: Floating Action Button (Alternative placement for quick access) */}
      <div className="fixed bottom-24 right-4 z-40 md:hidden">
        <button 
          onClick={() => navigate('/upload')}
          className="flex items-center justify-center size-14 rounded-full bg-primary text-white shadow-xl shadow-primary/40 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-[28px]">edit_document</span>
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50">
        <div className="flex justify-around items-center h-16 px-2">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              activeTab === 'home' 
                ? 'text-primary' 
                : 'text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary'
            }`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === 'home' ? 'filled' : ''}`}>
              home
            </span>
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('resumes')}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              activeTab === 'resumes' 
                ? 'text-primary' 
                : 'text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">description</span>
            <span className="text-[10px] font-medium">Resumes</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              activeTab === 'search' 
                ? 'text-primary' 
                : 'text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">work</span>
            <span className="text-[10px] font-medium">Job Search</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              activeTab === 'menu' 
                ? 'text-primary' 
                : 'text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">grid_view</span>
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
        
        {/* Safe Area for iOS Home Indicator */}
        <div className="h-1 bg-transparent"></div>
      </nav>
    </div>
  )
}
