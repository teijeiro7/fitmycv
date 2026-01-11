import { Link } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'

export default function LandingPage() {
  const { isDark, toggleTheme } = useThemeStore()

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 border-b border-slate-200 dark:border-slate-800 justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/logopequeno.png" alt="FitMyCV Logo" className="w-8 h-8" />
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            FitMyCV
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {/* <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button> */}
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

      {/* Hero Section */}
      <section className="relative w-full">
        <div className="container mx-auto px-4 py-8 pb-12">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Text Content */}
            <div className="flex flex-col gap-6 items-center text-center lg:items-start lg:text-left lg:w-1/2">
              <div className="flex flex-col gap-3">
                <span className="text-primary font-bold text-sm tracking-wide uppercase">
                  Potenciado por IA
                </span>
                <h1 className="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black leading-[1.1] tracking-[-0.033em]">
                  Consigue el trabajo de tus sueños con un CV adaptado
                </h1>
                <h2 className="text-slate-600 dark:text-slate-300 text-lg font-normal leading-relaxed max-w-[500px]">
                  Optimiza tu currículum en segundos para pasar los filtros ATS y destacar ante los reclutadores.
                </h2>
              </div>
              <div className="flex flex-col w-full gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="flex w-full sm:w-auto items-center justify-center rounded-lg h-12 px-6 bg-primary text-white text-base font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all hover:scale-[1.02]"
                >
                  Empieza Gratis
                </Link>
                <button className="flex w-full sm:w-auto items-center justify-center rounded-lg h-12 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-base font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                  Ver demo
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="material-symbols-outlined text-[16px] text-green-500">check_circle</span>
                No se requiere tarjeta de crédito
              </div>
            </div>

            {/* Hero Image */}
            <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center p-8">
                  <span className="material-symbols-outlined text-primary text-[120px]">auto_awesome</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-4">CV + IA = Éxito</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full bg-white dark:bg-slate-900 py-6 border-y border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap gap-4 px-4 justify-center">
          <div className="flex min-w-[140px] flex-1 flex-col gap-1 items-center justify-center p-4">
            <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-black leading-tight">
              10k+
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal text-center">
              CVs Optimizados
            </p>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
          <div className="flex min-w-[140px] flex-1 flex-col gap-1 items-center justify-center p-4">
            <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-black leading-tight">
              5x
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal text-center">
              Más Entrevistas
            </p>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
          <div className="flex min-w-[140px] flex-1 flex-col gap-1 items-center justify-center p-4">
            <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-black leading-tight">
              90%
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal text-center">
              Ahorro de Tiempo
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="pt-12 pb-6 px-4">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-primary font-bold text-sm tracking-wide uppercase mb-2 block">
            Proceso Simple
          </span>
          <h2 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
            Cómo funciona
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-base">
            Nuestra IA analiza tu perfil y la oferta de trabajo para crear el match perfecto en 3 simples pasos.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="pb-16 px-4 max-w-lg mx-auto w-full">
        <div className="grid grid-cols-[48px_1fr] gap-x-4">
          {/* Step 1 */}
          <div className="flex flex-col items-center pt-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-slate-800 text-primary border border-blue-100 dark:border-slate-700 z-10">
              <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
            </div>
            <div className="w-0.5 bg-slate-200 dark:bg-slate-700 h-full -mt-2 -mb-2"></div>
          </div>
          <div className="flex flex-col py-4 pb-8">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-snug mb-1">
              1. Sube tu CV actual
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Sube tu currículum en formato PDF o Word. Nuestra plataforma extraerá automáticamente tu experiencia y habilidades.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="w-0.5 bg-slate-200 dark:bg-slate-700 h-4"></div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-slate-800 text-primary border border-blue-100 dark:border-slate-700 z-10">
              <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            </div>
            <div className="w-0.5 bg-slate-200 dark:bg-slate-700 h-full -mt-2 -mb-2"></div>
          </div>
          <div className="flex flex-col py-4 pb-8">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-snug mb-1">
              2. Pega la descripción
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Copia y pega la oferta de trabajo que te interesa. La IA reescribirá tu perfil enfocándose en las palabras clave que buscan.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center pb-2">
            <div className="w-0.5 bg-slate-200 dark:bg-slate-700 h-4"></div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-slate-800 text-primary border border-blue-100 dark:border-slate-700 z-10">
              <span className="material-symbols-outlined text-[24px]">download</span>
            </div>
          </div>
          <div className="flex flex-col py-4">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-snug mb-1">
              3. Descarga optimizado
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Obtén tu nuevo CV en PDF perfectamente formateado y listo para impresionar, con un puntaje ATS alto garantizado.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-12 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col items-center text-center gap-6 max-w-md mx-auto">
          <h2 className="text-slate-900 dark:text-white text-2xl font-bold">
            ¿Listo para conseguir más entrevistas?
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Únete a miles de profesionales que ya han mejorado su carrera.
          </p>
          <Link
            to="/register"
            className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-primary text-white text-lg font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all"
          >
            Empieza Gratis Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background-light dark:bg-background-dark py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            {/* <span className="material-symbols-outlined text-slate-400">description</span> */}
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
    </div>
  )
}
