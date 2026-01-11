import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { resumeService } from '@/services/resumeService'
import type { AdaptationDetail } from '@/types'

export default function PreviewPage() {
  const { adaptationId } = useParams<{ adaptationId: string }>()
  const navigate = useNavigate()
  const [adaptation, setAdaptation] = useState<AdaptationDetail | null>(null)
  const [activeTab, setActiveTab] = useState<'insights' | 'preview'>('insights')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdaptation()
  }, [adaptationId])

  const loadAdaptation = async () => {
    if (!adaptationId) return

    try {
      const data = await resumeService.getAdaptation(parseInt(adaptationId))
      setAdaptation(data)
    } catch (error) {
      toast.error('Error al cargar la adaptación')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!adaptation) return null

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden h-screen flex flex-col max-w-md mx-auto shadow-2xl">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 bg-background-light dark:bg-background-dark z-20 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
        >
          <span className="material-symbols-outlined text-2xl">chevron_left</span>
        </button>
        <h1 className="text-base font-bold text-slate-900 dark:text-white">Revisión de Adaptación</h1>
        <button className="flex items-center justify-center size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-primary">
          <span className="material-symbols-outlined text-[20px]">edit</span>
        </button>
      </header>

      {/* Tabs */}
      <div className="shrink-0 px-4 pb-2 pt-2 bg-background-light dark:bg-background-dark z-20">
        <div className="flex h-12 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800/80 p-1 relative">
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 flex items-center justify-center h-full rounded-lg text-sm font-semibold transition-all duration-300 ${
              activeTab === 'insights'
                ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined mr-2 text-[18px]">auto_awesome</span>
            AI Insights
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 flex items-center justify-center h-full rounded-lg text-sm font-semibold transition-all duration-300 ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined mr-2 text-[18px]">description</span>
            CV Preview
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar pb-32">
        {activeTab === 'insights' ? (
          <div className="flex flex-col gap-5 px-5 pt-4 pb-8">
            {/* Match Score */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Match Score</p>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {adaptation.match_score}%
                  </h2>
                </div>
                <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-md text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>+12%</span>
                </div>
              </div>
              <div className="relative h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
                  style={{ width: `${adaptation.match_score}%` }}
                ></div>
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tu CV está altamente optimizado para{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-200">{adaptation.job_title}</span>.
              </p>
            </div>

            {/* Keywords Added */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                Optimizaciones Aplicadas
              </h3>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="shrink-0 size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">key</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Palabras Clave Añadidas</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Coinciden con la oferta</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pl-11">
                  {adaptation.keywords_added.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-600"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="shrink-0 size-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <span className="material-symbols-outlined text-[20px]">psychology</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Habilidades Enfatizadas</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Reordenadas por relevancia</p>
                  </div>
                </div>
                <ul className="pl-11 space-y-2">
                  <li className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-green-500">arrow_upward</span>
                    Priorizado <strong>{adaptation.optimized_content.skills[0]}</strong> al inicio
                  </li>
                  <li className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-green-500">arrow_upward</span>
                    Destacado <strong>Liderazgo Cross-funcional</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-4 pt-2 pb-8 h-full">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Plantilla Moderna</span>
              </div>
              <button className="text-xs font-bold text-primary flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-[16px]">palette</span>
                Cambiar Plantilla
              </button>
            </div>

            <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-lg p-2 overflow-hidden relative shadow-inner flex items-start justify-center min-h-[400px]">
              <div className="bg-white text-slate-900 p-6 shadow-xl mt-2 text-xs max-w-full scale-75">
                <div className="border-b-2 border-slate-900 pb-3 mb-4">
                  <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">{adaptation.optimized_content.name}</h1>
                  <p className="text-xs font-medium text-slate-600 tracking-widest uppercase">{adaptation.optimized_content.title}</p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase border-b border-slate-300 pb-1 mb-2">Perfil</h3>
                  <p className="text-[9px] text-slate-600 leading-relaxed">{adaptation.optimized_content.summary}</p>
                </div>

                <div className="mt-4">
                  <h3 className="text-xs font-bold uppercase border-b border-slate-300 pb-1 mb-2">Habilidades</h3>
                  <div className="flex flex-wrap gap-1">
                    {adaptation.optimized_content.skills.map((skill, idx) => (
                      <span key={idx} className="text-[8px] bg-slate-100 px-1 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-xs font-bold uppercase border-b border-slate-300 pb-1 mb-2">Experiencia</h3>
                  {adaptation.optimized_content.experience.map((exp, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-[10px] font-bold">{exp.title}</h4>
                        <span className="text-[8px] text-slate-500">{exp.date}</span>
                      </div>
                      <p className="text-[9px] italic text-slate-500 mb-1">{exp.company}</p>
                      <ul className="list-disc list-inside text-[9px] text-slate-600 pl-1 space-y-0.5">
                        {exp.achievements.map((achievement, aidx) => (
                          <li key={aidx}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">Vista previa del CV adaptado</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 pb-6 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Editar Manual
          </button>
          <button
            onClick={() => toast.success('Descarga iniciada')}
            className="flex-[2] flex items-center justify-center h-12 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:bg-blue-600 transition-colors gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Descargar CV
          </button>
        </div>
      </footer>
    </div>
  )
}
