import { CalendarDays, FileText, Lightbulb, ListChecks, TriangleAlert, Trophy } from 'lucide-react'
import { REPORT_SECTIONS } from '../../utils/chatUtils'

const SECTION_ICONS = {
  businessContent: ListChecks,
  achievements: Trophy,
  issues: TriangleAlert,
  improvements: Lightbulb,
  tomorrowPlan: CalendarDays,
}

export default function ReportCard({ report }) {
  return (
    <section aria-label="日報" className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-navy-50 px-5 py-3 text-navy-800">
        <FileText size={18} />
        <h3 className="text-sm font-bold">本日の日報</h3>
      </div>
      <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
        {REPORT_SECTIONS.map(({ key, label }) => {
          const Icon = SECTION_ICONS[key]
          const items = report[key]
          return (
            <div key={key} className="bg-white p-5 sm:last:col-span-2">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-800">
                <Icon size={16} className="text-brand-600" />
                {label}
              </h4>
              {items.length > 0 ? (
                <ul className="space-y-2 text-sm text-navy-900">
                  {items.map((item, index) => (
                    <li key={index} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">特になし</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
