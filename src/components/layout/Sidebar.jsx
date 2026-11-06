import { History, NotebookPen, Plus, Settings, Sparkles } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'chat', label: '日報作成', icon: NotebookPen },
  { id: 'history', label: '履歴', icon: History },
  { id: 'settings', label: '設定', icon: Settings },
]

export default function Sidebar({ isOpen, activeView, onNavigate, onNewChat }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col bg-navy-900 text-white shadow-xl transition-transform duration-300 ease-out md:static md:w-64 md:max-w-none md:shrink-0 md:translate-x-0 md:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
          <Sparkles size={18} />
        </div>
        <span className="text-lg font-bold tracking-tight">Aimu Report AI</span>
      </div>

      <div className="px-4">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-500 active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:outline-none"
        >
          <Plus size={18} />
          新しいチャット
        </button>
      </div>

      <nav aria-label="メインメニュー" className="mt-6 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:outline-none ${
                isActive ? 'bg-white/10 text-white' : 'text-navy-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          )
        })}
      </nav>

      <p className="px-6 py-5 text-xs text-navy-300">小規模企業向け 業務効率化ツール</p>
    </aside>
  )
}
