import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { resumeService } from '@/services/resumeService'
import type { Adaptation } from '@/types'
import toast from 'react-hot-toast'
import Header from '@/components/LoginHeader'
import BottomNav from '@/components/BottomNav'

export default function DashboardPage() {
  const { user } = useAuthStore()
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
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen w-full">
      {/* Top Header */}
      <Header notificationCount={adaptations.length} />

      {/* Main Content Area */}
      <main className="w-full flex flex-col gap-6 p-4 pb-24">
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
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
