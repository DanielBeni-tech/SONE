import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiGet } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useWebSocket } from '../context/WebSocketContext'
import { ArrowLeft, Send } from 'lucide-react'

interface Message {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  status: string
  created_at: string
}

interface UserInfo {
  id: number
  pseudo: string
  is_online: boolean
}

export default function Chat() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { send, subscribe } = useWebSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [otherUser, setOtherUser] = useState<UserInfo | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = parseInt(userId!)
    apiGet<Message[]>(`/chats/${id}/messages`).then(setMessages).catch(() => {})
    apiGet<UserInfo>(`/users/${id}`).then(setOtherUser).catch(() => {})
  }, [userId])

  useEffect(() => {
    const unsub = subscribe((data) => {
      if (data.type === 'private_message' && data.sender_id === parseInt(userId!)) {
        setMessages(prev => [...prev, {
          id: data.id,
          sender_id: data.sender_id,
          receiver_id: user!.id,
          content: data.content,
          status: 'sent',
          created_at: data.created_at,
        }])
      }
    })
    return unsub
  }, [userId, user])

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
      sender_id: user!.id,
      receiver_id: parseInt(userId!),
      content,
      status: 'sent',
      created_at: new Date().toISOString(),
    }])
    send({ type: 'private_message', receiver_id: parseInt(userId!), content })
  }

  return (
    <div className="min-h-screen flex justify-center bg-base">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-line">
          <button onClick={() => navigate('/')} className="p-1 -ml-1">
            <ArrowLeft size={22} />
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center">
              <span className="text-surface font-bold">{otherUser?.pseudo[0]?.toUpperCase()}</span>
            </div>
            {otherUser?.is_online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-surface" />}
          </div>
          <div>
            <div className="font-medium">{otherUser?.pseudo}</div>
            <div className="text-xs text-gray-500">{otherUser?.is_online ? 'En ligne' : 'Hors ligne'}</div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-10">Démarrez votre conversation</div>
          )}
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
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
