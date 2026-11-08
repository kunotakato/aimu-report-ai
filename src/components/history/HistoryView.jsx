import { useMemo, useState } from 'react'
import { CalendarSearch, ChevronRight, FileText, Search, Trash2 } from 'lucide-react'
import { filterDailyReports } from '../../utils/dailyReportUtils'

export default function HistoryView({ records, onOpenReport, onDeleteReport }) {
  const [keyword, setKeyword] = useState('')
  const [date, setDate] = useState('')
  const filteredReports = useMemo(
    () => filterDailyReports(records, { keyword, date }),
    [records, keyword, date],
  )

  const handleDelete = (record) => {
    if (!window.confirm(`${record.date} の日報を削除しますか？活動メモは残ります。`)) return
    onDeleteReport(record)
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="relative">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">キーワード</span>
              <Search size={17} className="absolute bottom-3 left-3 text-slate-400" />
              <input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="日報・活動メモを検索" className="w-full rounded-xl border border-slate-300 py-2.5 pr-3 pl-10 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none" />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-bold text-slate-600">日付で絞り込み</span>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none" />
            </label>
          </div>
          {(keyword || date) && <button type="button" onClick={() => { setKeyword(''); setDate('') }} className="mt-3 text-xs font-bold text-brand-700 hover:underline">検索条件をクリア</button>}
        </section>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-navy-900">保存済み日報</h2>
            <p className="mt-1 text-xs text-slate-500">このブラウザに保存された日報です。</p>
          </div>
          <span className="text-sm font-bold text-brand-700">{filteredReports.length}件</span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600"><CalendarSearch size={22} /></div>
            <p className="font-bold text-navy-900">該当する日報がありません</p>
            <p className="text-sm text-slate-600">活動記録から日報を生成し、編集画面で保存してください。</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredReports.map((record) => (
              <li key={record.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700"><FileText size={18} /></div>
                  <button type="button" onClick={() => onOpenReport(record.date)} className="min-w-0 flex-1 text-left">
                    <p className="font-bold text-navy-900">{record.date} の日報</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{record.reportMarkdown.replace(/[#*`]/g, '').slice(0, 140)}</p>
                    <p className="mt-2 text-xs text-slate-500">活動メモ {record.notes.length}件・更新 {new Date(record.updatedAt).toLocaleString('ja-JP')}</p>
                  </button>
                  <button type="button" onClick={() => handleDelete(record)} aria-label="日報を削除" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"><Trash2 size={17} /></button>
                  <button type="button" onClick={() => onOpenReport(record.date)} aria-label="日報を開く" className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"><ChevronRight size={18} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          日報と活動メモはこの端末のブラウザだけに保存されます。端末間では同期されず、ブラウザデータを削除すると失われる可能性があります。
        </p>
      </div>
    </div>
  )
}
