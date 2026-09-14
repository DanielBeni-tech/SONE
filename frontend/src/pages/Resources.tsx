import { useState, useEffect } from 'react'
import { apiGet } from '../api/client'
import BottomNav from '../components/BottomNav'
import PageHeader from '../components/PageHeader'
import { FileText, Download } from 'lucide-react'

interface Resource {
  id: number
  title: string
  description: string | null
  subject: string
  level: string
  file_url: string
  created_at: string
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiGet<Resource[]>('/resources/').then(setResources).catch(() => {})
  }, [])

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.subject.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen flex justify-center bg-base">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col">
        <PageHeader title="Ressources" />
        <div className="px-4 pb-2 bg-surface">
          <input
            type="text"
            placeholder="Rechercher par matière..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-base border border-line outline-none focus:border-brand text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-surface rounded-2xl border border-line p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                <FileText size={22} className="text-brand-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{r.title}</h3>
                {r.description && <p className="text-sm text-gray-500 truncate">{r.description}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-base border border-line">{r.subject}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-base border border-line">{r.level}</span>
                </div>
              </div>
              <button className="shrink-0 w-9 h-9 rounded-full bg-ink flex items-center justify-center text-surface">
                <Download size={18} />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-20">Aucune ressource trouvée</div>
          )}
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
