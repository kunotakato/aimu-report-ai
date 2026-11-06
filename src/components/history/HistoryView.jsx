import { ChevronRight, History, MessageSquare } from 'lucide-react'
import { formatDateTime } from '../../utils/chatUtils'

export default function HistoryView({ sessions, onSelectSession }) {
  const savedSessions = sessions
    .filter((session) => session.messages.some((message) => message.role === 'user'))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 text-sm text-slate-600">このブラウザで作成したチャットを新しい順に表示します。</p>

        {savedSessions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <History size={22} />
            </div>
            <p className="font-bold text-navy-900">まだ履歴はありません</p>
            <p className="text-sm text-slate-600">日報作成でメッセージを送信すると、ここに表示されます。</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {savedSessions.map((session) => {
              const userCount = session.messages.filter((message) => message.role === 'user').length
              return (
                <li key={session.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSession(session.id)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-300 hover:shadow-md focus-visible:ring-4 focus-visible:ring-brand-100 focus-visible:outline-none"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                      <MessageSquare size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-navy-900">{session.title}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {formatDateTime(session.updatedAt)} ・ {userCount}件のメッセージ
                      </p>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-slate-400" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
