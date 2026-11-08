import { useEffect, useState } from 'react'
import { Check, Clipboard, Download, Eye, FileDown, PencilLine, Printer, RotateCcw, Save } from 'lucide-react'
import { createReportExportFiles } from '../../utils/dailyReportUtils'
import MarkdownContent from './MarkdownContent'

function downloadFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function ReportEditorView({ date, initialMarkdown, savedBaseMarkdown = initialMarkdown, onSave, onBack, onDirtyChange }) {
  const [draft, setDraft] = useState(initialMarkdown)
  const [savedMarkdown, setSavedMarkdown] = useState(savedBaseMarkdown)
  const [status, setStatus] = useState(null)
  const [mobileMode, setMobileMode] = useState('edit')
  const isDirty = draft !== savedMarkdown

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const handleSave = () => {
    if (!draft.trim()) {
      setStatus({ type: 'error', text: '空の日報は保存できません。' })
      return
    }
    if (!onSave(draft)) {
      setStatus({ type: 'error', text: '日報を保存できませんでした。編集内容は画面に残しています。' })
      return
    }
    setSavedMarkdown(draft)
    setStatus({ type: 'success', text: '日報を保存しました。' })
  }

  const handleCancel = () => {
    if (isDirty && !window.confirm('未保存の変更を破棄して、最後に保存した内容へ戻しますか？')) return
    setDraft(savedMarkdown)
    setStatus(null)
  }

  const handleBack = () => {
    if (isDirty && !window.confirm('未保存の変更があります。保存せずにこの画面を離れますか？')) return
    onDirtyChange(false)
    onBack()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft)
      setStatus({ type: 'success', text: '日報をコピーしました。' })
    } catch {
      setStatus({ type: 'error', text: 'コピーできませんでした。ブラウザの権限を確認してください。' })
    }
  }

  const exportFiles = createReportExportFiles(date, draft)

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="print-hidden flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <button type="button" onClick={handleBack} className="text-sm font-medium text-brand-700 hover:underline">← 日報履歴へ戻る</button>
            <h2 className="mt-2 text-xl font-bold text-navy-900">{date} の日報</h2>
          </div>
          {isDirty && <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900">未保存の変更があります</span>}
        </div>

        {status && (
          <div role={status.type === 'error' ? 'alert' : 'status'} className={`print-hidden rounded-xl border px-4 py-3 text-sm ${status.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
            {status.text}
          </div>
        )}

        <div className="print-hidden flex rounded-xl border border-slate-200 bg-white p-1 md:hidden">
          <button type="button" onClick={() => setMobileMode('edit')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${mobileMode === 'edit' ? 'bg-brand-50 text-brand-700' : 'text-slate-600'}`}><PencilLine size={16} />編集</button>
          <button type="button" onClick={() => setMobileMode('preview')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${mobileMode === 'preview' ? 'bg-brand-50 text-brand-700' : 'text-slate-600'}`}><Eye size={16} />プレビュー</button>
        </div>

        <div className="grid min-h-[520px] gap-4 md:grid-cols-2">
          <section className={`print-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${mobileMode === 'preview' ? 'hidden md:block' : ''}`}>
            <label htmlFor="report-markdown" className="flex items-center gap-2 text-sm font-bold text-navy-900"><PencilLine size={17} className="text-brand-600" />Markdownを編集</label>
            <textarea
              id="report-markdown"
              value={draft}
              onChange={(event) => { setDraft(event.target.value); setStatus(null) }}
              className="mt-3 min-h-[450px] w-full resize-y rounded-xl border border-slate-300 p-4 font-mono text-sm leading-relaxed focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
            />
          </section>

          <section className={`report-print-area rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 ${mobileMode === 'edit' ? 'hidden md:block' : ''}`}>
            <div className="mb-5 border-b border-slate-200 pb-3">
              <p className="text-xs font-bold tracking-wide text-brand-700">AIMU REPORT AI</p>
              <h1 className="mt-1 text-2xl font-bold text-navy-900">日報</h1>
              <p className="mt-1 text-sm text-slate-500">{date}</p>
            </div>
            <div className="text-sm text-navy-900 sm:text-base"><MarkdownContent content={draft || 'プレビューする内容がありません。'} /></div>
          </section>
        </div>

        <div className="print-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700"><Save size={17} />変更を保存</button>
            <button type="button" onClick={handleCancel} disabled={!isDirty} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RotateCcw size={17} />編集をキャンセル</button>
            <button type="button" onClick={handleCopy} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><Clipboard size={17} />コピー</button>
            <button type="button" onClick={() => downloadFile(exportFiles.markdown.filename, exportFiles.markdown.content, exportFiles.markdown.type)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><Download size={17} />Markdown</button>
            <button type="button" onClick={() => downloadFile(exportFiles.text.filename, exportFiles.text.content, exportFiles.text.type)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><FileDown size={17} />テキスト</button>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><Printer size={17} />PDF保存・印刷</button>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><Check size={14} />PDFはブラウザの印刷画面で「PDFとして保存」を選択してください。</p>
        </div>
      </div>
    </div>
  )
}
