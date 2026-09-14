import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiGet } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useWebSocket } from '../context/WebSocketContext'
import { ArrowLeft, Send } from 'lucide-react'

interface ZoneMessage {
  id: number
  zone_id: number
  sender_id: number
  sender_pseudo: string
  content: string
  created_at: string
}

interface Zone {
  id: number
  name: string
  description: string | null
  type: string
  member_count: number
  is_member: boolean
}

export default function ZoneChat() {
  const { zoneId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { send, subscribe } = useWebSocket()
  const [messages, setMessages] = useState<ZoneMessage[]>([])
  const [zone, setZone] = useState<Zone | null>(null)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = parseInt(zoneId!)
    apiGet<ZoneMessage[]>(`/zones/${id}/messages`).then(setMessages).catch(() => {})
    apiGet<Zone[]>('/zones/').then(zones => {
      const z = zones.find(z => z.id === id)
      if (z) setZone(z)
    }).catch(() => {})
  }, [zoneId])

  useEffect(() => {
    const unsub = subscribe((data) => {
      if (data.type === 'zone_message' && data.zone_id === parseInt(zoneId!)) {
        setMessages(prev => [...prev, {
          id: data.id,
          zone_id: data.zone_id,
          sender_id: data.sender_id,
          sender_pseudo: data.sender_pseudo,
          content: data.content,
          created_at: data.created_at,
        }])
      }
    })
    return unsub
  }, [zoneId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const content = input.trim()
    setInput('')
    setMessages(prev => [...prev, {
      id: Date.now(),
      zone_id: parseInt(zoneId!),
      sender_id: user!.id,
      sender_pseudo: user!.pseudo,
      content,
      created_at: new Date().toISOString(),
    }])
    send({ type: 'zone_message', zone_id: parseInt(zoneId!), content })
  }

  return (
    <div className="min-h-screen flex justify-center bg-base">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-line">
          <button onClick={() => navigate('/zones')} className="p-1 -ml-1">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1">
            <div className="font-medium">{zone?.name}</div>
            <div className="text-xs text-gray-500">{zone?.member_count} membres</div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-10">Aucun message dans cette Zone</div>
          )}
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%]">
                {m.sender_id !== user?.id && (
                  <span className="text-xs text-brand-dark font-medium ml-1 block mb-0.5">{m.sender_pseudo}</span>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl ${
                    m.sender_id === user?.id
                      ? 'bg-ink text-surface rounded-br-md'
                      : 'bg-surface text-ink border border-line rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                  <p className="text-[10px] mt-1 text-gray-400">
                    {new Date(m.created_at).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 bg-surface border-t border-line pb-4">
          <input
            type="text"
            placeholder="Message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-full bg-base border border-line outline-none focus:border-brand text-sm"
          />
          <button type="submit" className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-surface shrink-0">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
