import { useState, useEffect } from 'react'
import { apiGet } from '../api/client'
import BottomNav from '../components/BottomNav'
import PageHeader from '../components/PageHeader'

interface EventItem {
  id: number
  title: string
  description: string | null
  event_type: string
  date: string
  class_name: string | null
}

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [tab, setTab] = useState<'schedule' | 'campus'>('schedule')

  useEffect(() => {
    apiGet<EventItem[]>('/events/').then(setEvents).catch(() => {})
  }, [])

  const filtered = events.filter(e => e.event_type === tab)

  return (
    <div className="min-h-screen flex justify-center bg-base">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col">
        <PageHeader title="Événements" />
        <div className="flex bg-surface px-4 pb-3 gap-2">
          <button
            onClick={() => setTab('schedule')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'schedule' ? 'bg-ink text-surface' : 'bg-base text-gray-500'}`}
          >
            Emplois du temps
          </button>
          <button
            onClick={() => setTab('campus')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'campus' ? 'bg-ink text-surface' : 'bg-base text-gray-500'}`}
          >
            Événements campus
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {filtered.map(e => (
            <div key={e.id} className="bg-surface rounded-2xl border border-line p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm text-brand-dark font-bold">
                    {new Date(e.date).toLocaleDateString('fr', { day: '2-digit' })}
                  </span>
                  <span className="text-[10px] text-brand-dark uppercase">
                    {new Date(e.date).toLocaleDateString('fr', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{e.title}</h3>
                  {e.description && <p className="text-sm text-gray-500 mt-0.5">{e.description}</p>}
                  {e.class_name && (
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-base border border-line">
                      {e.class_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-20">
              {tab === 'schedule' ? 'Aucun emploi du temps' : 'Aucun événement campus'}
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
