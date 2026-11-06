import { useCallback, useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import PageHeader from './components/layout/PageHeader'
import ChatView from './components/chat/ChatView'
import HistoryView from './components/history/HistoryView'
import SettingsView from './components/settings/SettingsView'
import { createSession, makeSessionTitle } from './utils/chatUtils'

const VIEW_TITLES = {
  chat: '日報作成',
  history: '履歴',
  settings: '設定',
}

export default function App() {
  const [initialSession] = useState(createSession)
  const [sessions, setSessions] = useState([initialSession])
  const [activeSessionId, setActiveSessionId] = useState(initialSession.id)
  const [view, setView] = useState('chat')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const activeSession = sessions.find((session) => session.id === activeSessionId)

  // 非同期の返信が届いた時点で表示中のチャットが変わっていても、送信元のチャットへ確実に追加する
  const appendMessage = useCallback((sessionId, message) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session
        const isFirstUserMessage =
          message.role === 'user' && !session.messages.some((item) => item.role === 'user')
        return {
          ...session,
          title: isFirstUserMessage ? makeSessionTitle(message.content) : session.title,
          updatedAt: message.createdAt,
          messages: [...session.messages, message],
        }
      }),
    )
  }, [])

  const updateConversationId = useCallback((sessionId, conversationId) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, conversationId } : session,
      ),
    )
  }, [])

  const navigateTo = (nextView) => {
    setView(nextView)
    setIsSidebarOpen(false)
  }

  const handleNewChat = () => {
    const session = createSession()
    setSessions((prev) => [session, ...prev])
    setActiveSessionId(session.id)
    navigateTo('chat')
  }

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId)
    navigateTo('chat')
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50 text-navy-900">
      <Sidebar
        isOpen={isSidebarOpen}
        activeView={view}
        onNavigate={navigateTo}
        onNewChat={handleNewChat}
      />

      {isSidebarOpen && (
        <div
          aria-hidden="true"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-navy-900/40 md:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <PageHeader title={VIEW_TITLES[view]} onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="min-h-0 flex-1">
          {/* チャットは表示を切り替えるだけにして、返信待ちの状態を画面移動後も保持する */}
          <div className={view === 'chat' ? 'h-full' : 'hidden'}>
            <ChatView
              session={activeSession}
              onAppendMessage={appendMessage}
              onUpdateConversationId={updateConversationId}
            />
          </div>
          {view === 'history' && <HistoryView sessions={sessions} onSelectSession={handleSelectSession} />}
          {view === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  )
}
