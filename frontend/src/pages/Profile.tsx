import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'
import Logo from '../components/Logo'
import { Settings, LogOut, ChevronRight, Wifi } from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex justify-center bg-base">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col">
        <div className="bg-surface px-4 py-6 flex flex-col items-center border-b border-line">
          <Logo size={80} />
          <h2 className="text-xl font-bold mt-3">{user?.pseudo}</h2>
          <div className="flex items-center gap-2 mt-2">
            {user?.level && (
              <span className="text-xs px-3 py-1 rounded-full bg-base border border-line">{user.level}</span>
            )}
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${user?.role === 'admin' ? 'bg-brand/10 text-brand-dark' : 'bg-base border border-line'}`}>
              {user?.role === 'admin' ? 'Administrateur' : 'Étudiant'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-sm">
            <div className={`w-2 h-2 rounded-full ${user?.network_type === 'intranet' ? 'bg-green-500' : 'bg-blue-500'}`} />
            <span className="text-gray-500">{user?.network_type === 'intranet' ? 'Intranet' : 'Internet'}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div className="bg-surface rounded-2xl border border-line overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
              <Settings size={20} className="text-gray-400" />
              <span className="flex-1 text-sm">Paramètres</span>
              <ChevronRight size={18} className="text-gray-300" />
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Wifi size={20} className="text-gray-400" />
              <span className="flex-1 text-sm">Type de réseau</span>
              <span className="text-sm text-gray-500">{user?.network_type === 'intranet' ? 'Intranet' : 'Internet'}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-surface border border-line text-red-500 font-medium"
          >
            <LogOut size={18} />
            <span className="text-sm">Se déconnecter</span>
          </button>
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
