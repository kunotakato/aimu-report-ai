import { useCallback, useState } from 'react'
import ActivityView from './components/activity/ActivityView'
import ChatView from './components/chat/ChatView'
import DashboardView from './components/dashboard/DashboardView'
import HistoryView from './components/history/HistoryView'
import PageHeader from './components/layout/PageHeader'
import Sidebar from './components/layout/Sidebar'
import ReportEditorView from './components/report/ReportEditorView'
import SettingsView from './components/settings/SettingsView'
import { loadDailyRecords, saveDailyRecords } from './services/dailyReportStorage'
import { createSession, makeSessionTitle } from './utils/chatUtils'
import {
  clearReportMarkdown,
  findOrCreateDailyRecord,
  saveReportMarkdown,
  toLocalDateValue,
  upsertDailyRecord,
} from './utils/dailyReportUtils'

const VIEW_TITLES = {
  dashboard: 'ダッシュボード',
  activity: '今日の活動記録',
  chat: 'AI日報作成',
  history: '日報履歴',
  report: '日報の編集・出力',
  settings: '設定',
}

export default function App() {
  const [initialSession] = useState(createSession)
  const [sessions, setSessions] = useState([initialSession])
  const [activeSessionId, setActiveSessionId] = useState(initialSession.id)
  const [view, setView] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [initialDailyData] = useState(loadDailyRecords)
  const [dailyRecords, setDailyRecords] = useState(initialDailyData.records)
  const [storageMessage, setStorageMessage] = useState(initialDailyData.error)
  const [selectedDate, setSelectedDate] = useState(toLocalDateValue)
  const [reportWorkspace, setReportWorkspace] = useState(null)
  const [hasUnsavedReport, setHasUnsavedReport] = useState(false)

  const activeSession = sessions.find((session) => session.id === activeSessionId)
  const selectedRecord = findOrCreateDailyRecord(dailyRecords, selectedDate)

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
    if (
      hasUnsavedReport &&
      nextView !== 'report' &&
      !window.confirm('日報に未保存の変更があります。保存せずに画面を移動しますか？')
    ) return

    if (nextView !== 'report') setHasUnsavedReport(false)
    setView(nextView)
    setIsSidebarOpen(false)
  }

  const persistRecord = (record) => {
    const nextRecords = upsertDailyRecord(dailyRecords, record)
    try {
      saveDailyRecords(nextRecords)
      setDailyRecords(nextRecords)
      setStorageMessage(null)
      return true
    } catch (error) {
      setStorageMessage(error.message)
      return false
    }
  }

  const handleNewChat = () => {
    const session = createSession()
    setSessions((prev) => [session, ...prev])
    setActiveSessionId(session.id)
    navigateTo('chat')
  }

  const handleGenerated = (date, markdown) => {
    const savedRecord = findOrCreateDailyRecord(dailyRecords, date)
    setReportWorkspace({
      key: `${date}-${Date.now()}`,
      date,
      initialMarkdown: markdown,
      savedBaseMarkdown: savedRecord.reportMarkdown,
    })
    setView('report')
  }

  const handleOpenReport = (date) => {
    const record = findOrCreateDailyRecord(dailyRecords, date)
    setReportWorkspace({
      key: `${date}-${record.updatedAt}`,
      date,
      initialMarkdown: record.reportMarkdown,
      savedBaseMarkdown: record.reportMarkdown,
    })
    setView('report')
  }

  const handleSaveReport = (markdown) => {
    const record = findOrCreateDailyRecord(dailyRecords, reportWorkspace.date)
    const saved = persistRecord(saveReportMarkdown(record, markdown))
    if (saved) {
      setHasUnsavedReport(false)
      setReportWorkspace((current) => ({ ...current, savedBaseMarkdown: markdown }))
    }
    return saved
  }

  const handleDeleteReport = (record) => {
    persistRecord(clearReportMarkdown(record))
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50 text-navy-900">
      <div className="print-hidden contents">
        <Sidebar
          isOpen={isSidebarOpen}
          activeView={view === 'report' ? 'history' : view}
          onNavigate={navigateTo}
          onNewChat={handleNewChat}
        />

        {isSidebarOpen && (
          <div aria-hidden="true" onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-navy-900/40 md:hidden" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="print-hidden"><PageHeader title={VIEW_TITLES[view]} onMenuClick={() => setIsSidebarOpen(true)} /></div>

        {storageMessage && (
          <div role="alert" className="print-hidden border-b border-red-200 bg-red-50 px-4 py-2 text-center text-xs text-red-800 sm:px-8">
            {storageMessage}
          </div>
        )}

        <main className="min-h-0 flex-1">
          {view === 'dashboard' && <DashboardView records={dailyRecords} onNavigate={navigateTo} />}
          {view === 'activity' && (
            <ActivityView
              record={selectedRecord}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onSaveRecord={persistRecord}
              onGenerated={handleGenerated}
            />
          )}
          <div className={view === 'chat' ? 'h-full' : 'hidden'}>
            <ChatView session={activeSession} onAppendMessage={appendMessage} onUpdateConversationId={updateConversationId} />
          </div>
          {view === 'history' && <HistoryView records={dailyRecords} onOpenReport={handleOpenReport} onDeleteReport={handleDeleteReport} />}
          {view === 'report' && reportWorkspace && (
            <ReportEditorView
              key={reportWorkspace.key}
              date={reportWorkspace.date}
              initialMarkdown={reportWorkspace.initialMarkdown}
              savedBaseMarkdown={reportWorkspace.savedBaseMarkdown}
              onSave={handleSaveReport}
              onBack={() => navigateTo('history')}
              onDirtyChange={setHasUnsavedReport}
            />
          )}
          {view === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  )
}
