import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

const STATUS_RESET_MS = 2000

export default function CopyButton({ text }) {
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (status === 'idle') return undefined
    const timer = setTimeout(() => setStatus('idle'), STATUS_RESET_MS)
    return () => clearTimeout(timer)
  }, [status])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  const label = {
    idle: 'コピー',
    copied: 'コピーしました',
    failed: 'コピーできませんでした',
  }[status]

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-brand-700 focus-visible:ring-4 focus-visible:ring-brand-100 focus-visible:outline-none"
    >
      {status === 'copied' ? <Check size={14} /> : <Copy size={14} />}
      <span>{label}</span>
    </button>
  )
}
