import { Menu } from 'lucide-react'

export default function PageHeader({ title, onMenuClick }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="メニューを開く"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-navy-800 transition hover:bg-slate-100 md:hidden"
      >
        <Menu size={22} />
      </button>
      <h1 className="text-lg font-bold text-navy-900">{title}</h1>
    </header>
  )
}
