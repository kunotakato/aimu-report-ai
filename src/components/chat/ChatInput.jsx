import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'

const MAX_TEXTAREA_HEIGHT_PX = 160

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)
  const trimmed = value.trim()
  const canSend = trimmed.length > 0 && !disabled

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`
  }, [value])

  const submit = () => {
    if (!canSend) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (event) => {
    // 日本語変換の確定Enterでは送信しない
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    submit()
  }

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
        className="flex items-end gap-3 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          maxLength={6000}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="今日の業務内容を入力してください"
          aria-label="業務内容"
          className="min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-navy-900 placeholder:text-slate-500 focus:outline-none sm:text-base"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="送信"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 focus-visible:ring-4 focus-visible:ring-brand-200 focus-visible:outline-none"
        >
          <Send size={18} />
        </button>
      </form>
      <p className="mt-2 px-1 text-xs text-slate-500">Enterで送信 / Shift+Enterで改行</p>
    </div>
  )
}
