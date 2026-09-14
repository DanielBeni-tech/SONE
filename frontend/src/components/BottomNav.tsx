import { useNavigate, useLocation } from 'react-router-dom'
import { MessageCircle, Globe, BookOpen, Calendar, User } from 'lucide-react'

const items = [
  { path: '/', icon: MessageCircle, label: 'Messages' },
  { path: '/zones', icon: Globe, label: 'Zones' },
  { path: '/resources', icon: BookOpen, label: 'Ressources' },
  { path: '/events', icon: Calendar, label: 'Événements' },
  { path: '/profile', icon: User, label: 'Profil' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex items-center justify-around bg-surface border-t border-line py-2 pb-3">
      {items.map(item => {
        const active = location.pathname === item.path
        const Icon = item.icon
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 px-2 py-1 transition-colors ${active ? 'text-brand-dark' : 'text-gray-400'}`}
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
