import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../api/client'
import { useWebSocket } from '../context/WebSocketContext'
import BottomNav from '../components/BottomNav'
import PageHeader from '../components/PageHeader'
import Logo from '../components/Logo'

interface Conversation {
  user_id: number
  pseudo: string
  is_online: boolean
  last_message: string | null
  last_message_time: string | null
  unread_count: number
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { subscribe } = useWebSocket()

  const load = () => apiGet<Conversation[]>('/chats/conversations').then(setConversations).catch(() => {})

  useEffect(() => {
    load()
    const unsub = subscribe((data) => {
      if (data.type === 'private_message') load()
    })
    return unsub
  }, [])

  const filtered = conversations.filter(c => c.pseudo.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen flex justify-center bg-base">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col">
        <PageHeader title="Messages" />
        <div className="px-4 pb-2 bg-surface">
          <input
            type="text"
            placeholder="Rechercher par pseudo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-base border border-line outline-none focus:border-brand text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Logo size={48} />
              <p className="mt-4 text-sm">Aucune conversation pour le moment</p>
              <p className="text-xs mt-1">Rejoignez une Zone pour commencer à discuter</p>
            </div>
          ) : (
            filtered.map(c => (
              <div
                key={c.user_id}
                onClick={() => navigate(`/chat/${c.user_id}`)}
                className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-line cursor-pointer active:bg-gray-50 transition-colors"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-ink flex items-center justify-center">
                    <span className="text-surface font-bold text-lg">{c.pseudo[0]?.toUpperCase()}</span>
                  </div>
                  {c.is_online && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-surface" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{c.pseudo}</span>
                    {c.last_message_time && (
                      <span className="text-xs text-gray-400 shrink-0 ml-2">
                        {new Date(c.last_message_time).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{c.last_message || 'Aucun message'}</p>
                </div>
                {c.unread_count > 0 && (
                  <div className="w-5 h-5 rounded-full bg-brand text-surface text-xs flex items-center justify-center font-bold shrink-0">
                    {c.unread_count}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
