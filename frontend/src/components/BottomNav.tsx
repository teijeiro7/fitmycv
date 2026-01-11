import { useNavigate } from 'react-router-dom'

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const navigate = useNavigate()
  
  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    
    // Navigate to specific pages based on tab
    switch(tab) {
      case 'home':
        navigate('/dashboard')
        break
      case 'menu':
        navigate('/settings')
        break
      // Add other cases as needed
      default:
        break
    }
  }
  
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        <button 
          onClick={() => handleTabChange('home')}
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
          onClick={() => handleTabChange('resumes')}
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
          onClick={() => handleTabChange('search')}
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
          onClick={() => handleTabChange('menu')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
            activeTab === 'menu' 
              ? 'text-primary' 
              : 'text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] ${activeTab === 'menu' ? 'filled' : ''}`}>
            settings
          </span>
          <span className="text-[10px] font-medium">Ajustes</span>
        </button>
      </div>
      
      {/* Safe Area for iOS Home Indicator */}
      <div className="h-1 bg-transparent"></div>
    </nav>
  )
}
