import { HardDrive, Settings } from 'lucide-react'

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
        <div className="mt-4 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <HardDrive size={22} className="mt-0.5 shrink-0 text-amber-700" />
          <div>
            <h2 className="font-bold text-amber-950">ブラウザ保存について</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-900">
              活動メモと日報は、この端末のブラウザ内にだけ保存されます。端末間では同期されず、ブラウザデータを削除すると失われる可能性があります。Dify APIキーなどの秘密情報は保存しません。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
