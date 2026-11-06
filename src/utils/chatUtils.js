export const WELCOME_MESSAGE =
  'こんにちは！今日の業務内容を教えてください。箇条書きでも大丈夫です。AIが日報に整理します。'
export const EXAMPLE_INPUT = '今日は顧客対応5件、営業資料の作成、社内会議を行いました。'
export const DEFAULT_SESSION_TITLE = '新しいチャット'

const TITLE_MAX_LENGTH = 20

export const REPORT_SECTIONS = [
  { key: 'businessContent', label: '業務内容' },
  { key: 'achievements', label: '成果' },
  { key: 'issues', label: '課題' },
  { key: 'improvements', label: '改善案' },
  { key: 'tomorrowPlan', label: '明日の予定' },
]

export function createId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

export function createMessage(role, content, report = null) {
  return {
    id: createId(),
    role,
    content,
    report,
    createdAt: new Date().toISOString(),
  }
}

export function createSession() {
  const now = new Date().toISOString()
  return {
    id: createId(),
    title: DEFAULT_SESSION_TITLE,
    createdAt: now,
    updatedAt: now,
    conversationId: null,
    messages: [createMessage('assistant', WELCOME_MESSAGE)],
  }
}

export function makeSessionTitle(text) {
  const trimmed = text.trim()
  return trimmed.length > TITLE_MAX_LENGTH ? `${trimmed.slice(0, TITLE_MAX_LENGTH)}…` : trimmed
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function reportToText(report) {
  return REPORT_SECTIONS.map(({ key, label }) => {
    const items = report[key].length ? report[key] : ['特になし']
    return `【${label}】\n${items.map((item) => `・${item}`).join('\n')}`
  }).join('\n\n')
}
