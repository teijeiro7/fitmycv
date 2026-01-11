import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { resumeService } from '@/services/resumeService'

export default function UploadPage() {
  const navigate = useNavigate()
  const [jobUrl, setJobUrl] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    maxSize: 5242880, // 5MB
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        setFile(acceptedFiles[0])
        toast.success('Archivo cargado')
      }
    },
  } as any)

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Por favor sube tu CV')
      return
    }

    if (!jobUrl && !jobDescription) {
      toast.error('Por favor proporciona URL o descripción de la oferta')
      return
    }

    setLoading(true)

    try {
      // 1. Upload resume
      const resume = await resumeService.uploadResume(file, file.name)
      toast.success('CV subido correctamente')

      // 2. Scrape/parse job
      const jobData = await resumeService.scrapeJob(jobUrl || undefined, jobDescription || undefined)
      toast.success('Oferta analizada')

      // 3. Optimize resume
      const adaptation = await resumeService.optimizeResume(
        resume.id,
        jobData.title,
        jobData.description,
        jobUrl || undefined
      )

      toast.success('¡CV adaptado exitosamente!')
      navigate(`/preview/${adaptation.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al procesar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col max-w-md mx-auto border-x border-slate-200 dark:border-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 -ml-2 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
          <img src="/images/logopequeno.png" alt="FitMyCV Logo" className="w-6 h-6" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">FitMyCV</h1>
        </div>
        <div className="w-10"></div>
      </header>

      {/* Stepper */}
      <div className="px-6 py-6 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-0"></div>
          <div className="relative z-10 flex flex-col items-center gap-1 group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold ring-4 ring-white dark:ring-slate-900 shadow-sm">
              1
            </div>
            <span className="text-[10px] font-semibold text-primary absolute -bottom-5 w-max">Upload</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-bold ring-4 ring-white dark:ring-slate-900">
              2
            </div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 absolute -bottom-5 w-max">Review</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-bold ring-4 ring-white dark:ring-slate-900">
              3
            </div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 absolute -bottom-5 w-max">Download</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-8">
        {/* Job Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined text-[20px]">work</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Detalles de la Oferta</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL de la Oferta</label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
                  placeholder="https://linkedin.com/jobs/view/..."
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                />
                <span className="material-symbols-outlined absolute left-3.5 text-slate-400">link</span>
              </div>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                O PEGA TEXTO
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción del Trabajo</label>
              <div className="relative">
                <textarea
                  className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none text-sm leading-relaxed"
                  placeholder="Pega la descripción completa del trabajo aquí..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <span className="absolute right-3 bottom-3 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-1 text-xs">
                  {jobDescription.length} caracteres
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Resume Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined text-[20px]">description</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Tu Currículum</h2>
          </div>

          <div {...getRootProps()} className="relative group cursor-pointer">
            <input {...(getInputProps() as any)} />
            <div
              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-colors ${
                isDragActive || file
                  ? 'border-primary bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {file ? (
                <>
                  <div className="w-12 h-12 mb-3 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 mb-3 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-200">
                    <span className="material-symbols-outlined text-2xl">upload_file</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {isDragActive ? 'Suelta el archivo aquí' : 'Clic para seleccionar archivo'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Soporta .docx hasta 5MB</p>
                </>
              )}
            </div>
          </div>

          {file && (
            <button
              onClick={() => setFile(null)}
              className="mt-2 text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Remover archivo
            </button>
          )}
        </section>

        {/* Tip */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex gap-3">
          <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-sm">info</span>
          <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
            Nuestra IA analizará las palabras clave de la descripción y reescribirá tu experiencia para que coincida perfectamente.
          </p>
        </div>
      </div>

      {/* Footer Action */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-20">
        <button
          onClick={handleSubmit}
          disabled={loading || !file || (!jobUrl && !jobDescription)}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Analizando...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">auto_fix_high</span>
              Analizar & Adaptar
            </>
          )}
        </button>
      </div>
    </div>
  )
}
