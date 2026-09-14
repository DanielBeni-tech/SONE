import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from '../api/client'
import BottomNav from '../components/BottomNav'
import PageHeader from '../components/PageHeader'
import { Users, ArrowRight } from 'lucide-react'

interface Zone {
  id: number
  name: string
  description: string | null
  type: string
  member_count: number
  is_member: boolean
}

const typeConfig: Record<string, { label: string; color: string }> = {
  admin: { label: 'Administration', color: 'bg-orange-100 text-orange-600' },
  student: { label: 'Estudiantine', color: 'bg-green-100 text-green-600' },
  classic: { label: 'Classique', color: 'bg-brand/10 text-brand-dark' },
}

export default function Zones() {
  const [zones, setZones] = useState<Zone[]>([])
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const load = () => apiGet<Zone[]>('/zones/').then(setZones).catch(() => {})

  useEffect(() => { load() }, [])

  const handleJoin = async (e: React.MouseEvent, zoneId: number) => {
    e.stopPropagation()
    await apiPost(`/zones/${zoneId}/join`)
    load()
  }

  const handleEnter = (zoneId: number) => navigate(`/zones/${zoneId}`)

  const filtered = zones.filter(z =>
    z.name.toLowerCase().includes(search.toLowerCase()) ||
    (z.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen flex justify-center bg-base">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col">
        <PageHeader title="Zones" />
        <div className="px-4 pb-2 bg-surface">
          <input
            type="text"
            placeholder="Rechercher une Zone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-base border border-line outline-none focus:border-brand text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {filtered.map(z => {
            const tc = typeConfig[z.type] || typeConfig.classic
            return (
              <div
                key={z.id}
                onClick={() => z.is_member ? handleEnter(z.id) : handleJoin({ stopPropagation: () => {} } as any, z.id)}
                className="bg-surface rounded-2xl border border-line p-4 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{z.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tc.color}`}>{tc.label}</span>
                    </div>
                    {z.description && <p className="text-sm text-gray-500 mt-1">{z.description}</p>}
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Users size={14} />
                      <span>{z.member_count} membre{z.member_count > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  {z.is_member ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEnter(z.id) }}
                      className="shrink-0 ml-3 w-9 h-9 rounded-full bg-brand flex items-center justify-center text-surface"
                    >
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleJoin(e, z.id)}
                      className="shrink-0 ml-3 px-4 py-2 rounded-full bg-ink text-surface text-sm font-medium"
                    >
                      Rejoindre
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-20">Aucune Zone trouvée</div>
          )}
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
