import { Settings } from 'lucide-react'

export default function SettingsView() {
  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Settings size={22} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-navy-900">設定</h2>
            <p className="text-sm leading-normal text-slate-600">
              アカウント情報や日報の出力形式などの設定は、今後のアップデートで追加される予定です。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
