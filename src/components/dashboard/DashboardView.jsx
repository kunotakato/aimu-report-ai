import { ArrowRight, BookOpenCheck, CalendarCheck2, NotebookPen } from 'lucide-react'
import { toLocalDateValue } from '../../utils/dailyReportUtils'

export default function DashboardView({ records, onNavigate }) {
  const today = toLocalDateValue()
  const todayRecord = records.find((record) => record.date === today)
  const reportCount = records.filter((record) => record.reportMarkdown).length
  const noteCount = records.reduce((sum, record) => sum + record.notes.length, 0)

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl bg-navy-900 p-6 text-white shadow-sm sm:p-8">
          <p className="text-sm font-medium text-brand-200">Aimu Report AI v0.2</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">今日の行動を、明日の成長へ。</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-100 sm:text-base">
            活動を少しずつ記録し、1日の終わりに事実に基づいた振り返りと次の行動を整理できます。
          </p>
          <button
            type="button"
            onClick={() => onNavigate('activity')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold transition hover:bg-brand-400"
          >
            今日の活動を記録する
            <ArrowRight size={17} />
          </button>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard icon={NotebookPen} label="今日のメモ" value={`${todayRecord?.notes.length || 0}件`} />
          <MetricCard icon={BookOpenCheck} label="保存済み日報" value={`${reportCount}件`} />
          <MetricCard icon={CalendarCheck2} label="累計活動メモ" value={`${noteCount}件`} />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="font-bold text-navy-900">おすすめの進め方</h3>
          <ol className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
            <Step number="1" title="活動を記録" text="できごとや学びを、その都度短く残します。" />
            <Step number="2" title="内容を確認" text="1日のメモを見直してからAIへ送ります。" />
            <Step number="3" title="編集して保存" text="AIの日報を自分の言葉に整えて保存します。" />
          </ol>
        </section>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={19} />
      </div>
      <p className="mt-4 text-sm text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy-900">{value}</p>
    </div>
  )
}

function Step({ number, title, text }) {
  return (
    <li className="rounded-xl bg-slate-50 p-4">
      <span className="text-xs font-bold text-brand-600">STEP {number}</span>
      <p className="mt-1 font-bold text-navy-900">{title}</p>
      <p className="mt-1 leading-relaxed">{text}</p>
    </li>
  )
}
