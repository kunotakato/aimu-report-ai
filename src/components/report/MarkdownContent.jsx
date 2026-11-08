import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownContent({ content }) {
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
