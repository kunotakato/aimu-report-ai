import { Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatTime, reportToText } from '../../utils/chatUtils'
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

function MarkdownContent({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="mt-0 mb-2 text-xl font-bold leading-tight">{children}</h1>,
        h2: ({ children }) => <h2 className="mt-3 mb-1 text-lg font-bold leading-snug first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-2 mb-1 font-bold leading-snug first:mt-0">{children}</h3>,
        p: ({ children }) => <p className="my-1 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="my-1 list-disc space-y-0.5 pl-5 leading-relaxed">{children}</ul>,
        ol: ({ children }) => <ol className="my-1 list-decimal space-y-0.5 pl-5 leading-relaxed">{children}</ol>,
        li: ({ children }) => <li className="pl-0.5">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="my-1.5 border-l-4 border-brand-200 pl-3 text-slate-700">{children}</blockquote>
        ),
        code: ({ children }) => <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">{children}</code>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer" className="text-brand-700 underline">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
