import { Bot, User } from 'lucide-react'
import { formatTime, reportToText } from '../../utils/chatUtils'
import MarkdownContent from '../report/MarkdownContent'
import CopyButton from './CopyButton'
import ReportCard from './ReportCard'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const copyText = message.report ? reportToText(message.report) : message.content

  return (
    <div className={`flex items-start gap-3 animate-fade-in-up ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-navy-800 text-white' : 'bg-brand-50 text-brand-600'
        }`}
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      <div className={`flex min-w-0 flex-col gap-2 ${isUser ? 'max-w-[80%] items-end sm:max-w-[70%]' : 'w-full items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-normal break-words sm:text-base ${
            isUser
              ? 'rounded-tr-sm bg-brand-600 text-white whitespace-pre-wrap'
              : 'rounded-tl-sm border border-slate-200 bg-white text-navy-900 whitespace-normal shadow-sm'
          }`}
        >
          {isUser ? message.content : <MarkdownContent content={message.content} />}
        </div>

        {message.report && <ReportCard report={message.report} />}

        <div className={`flex items-center gap-3 text-xs text-slate-500 ${isUser ? 'flex-row-reverse' : ''}`}>
          <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
          {!isUser && <CopyButton text={copyText} />}
        </div>
      </div>
    </div>
  )
}
