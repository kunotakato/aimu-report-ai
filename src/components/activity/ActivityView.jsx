import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, CircleAlert, Clock3, FileText, Pencil, Plus, Trash2, X } from 'lucide-react'
import { sendMessage } from '../../services/chatService'
import { addActivityNote, prepareDailyReportGeneration, removeActivityNote, updateActivityNote } from '../../utils/dailyReportUtils'

export default function ActivityView({ record, selectedDate, onDateChange, onSaveRecord, onGenerated }) {
  const [noteText, setNoteText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    setNoteText('')
    setEditingId(null)
    setShowConfirmation(false)
    setMessage(null)
  }, [selectedDate])

  const sortedNotes = [...record.notes].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = noteText.trim()
    if (!trimmed) return

    const nextRecord = editingId
      ? updateActivityNote(record, editingId, trimmed)
      : addActivityNote(record, trimmed)
    if (!onSaveRecord(nextRecord)) {
      setMessage({ type: 'error', text: '活動メモを保存できませんでした。入力内容はそのまま残しています。' })
      return
    }

    setNoteText('')
    setEditingId(null)
    setMessage({ type: 'success', text: editingId ? '活動メモを更新しました。' : '活動メモを追加しました。' })
  }

  const handleEdit = (note) => {
    setEditingId(note.id)
    setNoteText(note.text)
    setMessage(null)
  }

  const handleDelete = (note) => {
    if (!window.confirm('この活動メモを削除しますか？')) return
    if (!onSaveRecord(removeActivityNote(record, note.id))) {
      setMessage({ type: 'error', text: '活動メモを削除できませんでした。' })
      return
    }
    if (editingId === note.id) {
      setEditingId(null)
      setNoteText('')
    }
  }

  const handleGenerate = async () => {
    const { prompt, error } = prepareDailyReportGeneration(record)
    if (error) {
      setMessage({ type: 'error', text: error })
      return
    }

    setIsGenerating(true)
    setMessage(null)
    try {
      const reply = await sendMessage({ message: prompt, conversationId: null })
      onGenerated(record.date, reply.text)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || '日報を生成できませんでした。活動メモは保存されています。' })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold text-brand-700">活動日</p>
              <h2 className="mt-1 text-xl font-bold text-navy-900">1日の活動を記録</h2>
              <p className="mt-2 text-sm text-slate-600">メモの追加ではAI通信を行いません。記録はこのブラウザに保存されます。</p>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-navy-800">
              <CalendarDays size={18} className="text-brand-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => onDateChange(event.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
              />
            </label>
          </div>
        </section>

        {message && <StatusMessage message={message} onDismiss={() => setMessage(null)} />}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <form onSubmit={handleSubmit}>
            <label htmlFor="activity-note" className="text-sm font-bold text-navy-900">
              {editingId ? '活動メモを編集' : '活動メモを追加'}
            </label>
            <textarea
              id="activity-note"
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              rows={3}
              maxLength={3000}
              placeholder="例：架空の顧客要望を整理し、画面設計を見直した。"
              className="mt-3 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-relaxed focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500">{noteText.length.toLocaleString()} / 3,000文字</span>
              <div className="flex gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); setNoteText('') }}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    キャンセル
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Plus size={17} />
                  {editingId ? '変更を保存' : 'メモを追加'}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-navy-900">{selectedDate} の活動メモ</h3>
              <p className="mt-1 text-xs text-slate-500">入力時刻の古い順に表示しています。</p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{sortedNotes.length}件</span>
          </div>

          {sortedNotes.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center text-sm text-slate-500">
              この日の活動メモはまだありません。
            </div>
          ) : (
            <ol className="mt-5 space-y-3">
              {sortedNotes.map((note) => (
                <li key={note.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Clock3 size={14} />
                      {new Date(note.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => handleEdit(note)} aria-label="メモを編集" className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-brand-700">
                        <Pencil size={16} />
                      </button>
                      <button type="button" onClick={() => handleDelete(note)} aria-label="メモを削除" className="rounded-lg p-2 text-slate-600 hover:bg-red-50 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-navy-900">{note.text}</p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:p-6">
          {!showConfirmation ? (
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-bold text-navy-900">今日の記録を日報にまとめる</h3>
                <p className="mt-1 text-sm text-slate-600">ボタンを押した後、送信内容を確認できます。</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (record.notes.length === 0) {
                    setMessage({ type: 'error', text: '日報を作成するには、活動メモを1件以上追加してください。' })
                    return
                  }
                  setShowConfirmation(true)
                }}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-navy-800 px-5 py-3 text-sm font-bold text-white hover:bg-navy-700"
              >
                <FileText size={18} />
                日報を作成する
              </button>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-navy-900">Difyへ送る内容を確認</h3>
              <p className="mt-1 text-sm text-slate-600">日付と以下のメモだけを新しい会話として送信します。</p>
              <div className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-brand-200 bg-white p-4">
                <p className="text-sm font-bold text-navy-900">{record.date}</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {sortedNotes.map((note) => <li key={note.id}>・{note.text}</li>)}
                </ul>
              </div>
              {record.reportMarkdown && (
                <p className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-900">
                  保存済み日報があります。生成結果は編集用の下書きとして開き、保存するまで既存日報を上書きしません。
                </p>
              )}
              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowConfirmation(false)} disabled={isGenerating} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  戻って編集
                </button>
                <button type="button" onClick={handleGenerate} disabled={isGenerating} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:bg-brand-400">
                  {isGenerating ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />AIが日報を作成中…</> : 'この内容で生成'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatusMessage({ message, onDismiss }) {
  const isError = message.type === 'error'
  return (
    <div role={isError ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${isError ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
      {isError ? <CircleAlert size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
      <p className="flex-1 leading-relaxed">{message.text}</p>
      <button type="button" onClick={onDismiss} aria-label="メッセージを閉じる" className="rounded p-1 hover:bg-black/5"><X size={15} /></button>
    </div>
  )
}
