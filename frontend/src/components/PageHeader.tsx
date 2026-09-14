import { Bell } from 'lucide-react'

export default function PageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-4 bg-surface">
      <h1 className="text-xl font-bold">{title}</h1>
      <button className="relative p-1">
        <Bell size={22} className="text-gray-500" />
        <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-brand" />
      </button>
    </div>
  )
}
