import { useEffect, useRef, useState } from 'react'
import { CircleAlert, X } from 'lucide-react'
import { sendMessage } from '../../services/chatService'
import { createMessage, EXAMPLE_INPUT } from '../../utils/chatUtils'
import ChatInput from './ChatInput'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

const SEND_ERROR_MESSAGE = '送信に失敗しました。時間をおいて、もう一度お試しください。'

export default function ChatView({ session, onAppendMessage, onUpdateConversationId }) {
  const [pendingSessionId, setPendingSessionId] = useState(null)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)

  const isLoading = pendingSessionId === session.id
  const errorMessage = error?.sessionId === session.id ? error.message : null
  const hasUserMessage = session.messages.some((message) => message.role === 'user')

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [session.id, session.messages.length, isLoading, errorMessage])

  const handleSend = async (text) => {
    const sessionId = session.id
    setError(null)
    onAppendMessage(sessionId, createMessage('user', text))
    setPendingSessionId(sessionId)

    try {
      const reply = await sendMessage({ message: text, conversationId: session.conversationId })
      onUpdateConversationId(sessionId, reply.conversationId)
      onAppendMessage(sessionId, createMessage('assistant', reply.text))
    } catch (requestError) {
      setError({ sessionId, message: requestError.message || SEND_ERROR_MESSAGE })
    } finally {
      setPendingSessionId(null)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {session.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {!hasUserMessage && <ExampleHint />}
          {isLoading && <TypingIndicator />}
          {errorMessage && <ErrorBanner message={errorMessage} onDismiss={() => setError(null)} />}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <ChatInput onSend={handleSend} disabled={pendingSessionId !== null} />
        </div>
      </div>
    </div>
  )
}

function ExampleHint() {
  return (
    <div className="ml-12 rounded-xl border border-dashed border-brand-200 bg-brand-50 px-4 py-3 text-sm text-navy-800">
      <p className="mb-1 text-xs font-bold text-brand-700">入力例</p>
      <p className="leading-normal">{EXAMPLE_INPUT}</p>
    </div>
  )
}

function ErrorBanner({ message, onDismiss }) {
  return (
    <div
      role="alert"
      className="ml-12 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <CircleAlert size={18} className="mt-0.5 shrink-0 text-red-600" />
      <p className="flex-1 leading-normal">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="エラーを閉じる"
        className="rounded-lg p-1 text-red-700 transition hover:bg-red-100"
      >
        <X size={16} />
      </button>
    </div>
  )
}
