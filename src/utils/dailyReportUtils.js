export const MAX_DAILY_REPORT_PROMPT_LENGTH = 6_000

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function toLocalDateValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createDailyRecord(date, now = new Date()) {
  const timestamp = now.toISOString()
  return {
    id: createId(),
    date,
    notes: [],
    reportMarkdown: '',
    reportCreatedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function addActivityNote(record, text, now = new Date()) {
  const timestamp = now.toISOString()
  return {
    ...record,
    notes: [
      ...record.notes,
      { id: createId(), text: text.trim(), createdAt: timestamp, updatedAt: timestamp },
    ],
    updatedAt: timestamp,
  }
}

export function updateActivityNote(record, noteId, text, now = new Date()) {
  const timestamp = now.toISOString()
  return {
    ...record,
    notes: record.notes.map((note) =>
      note.id === noteId ? { ...note, text: text.trim(), updatedAt: timestamp } : note,
    ),
    updatedAt: timestamp,
  }
}

export function removeActivityNote(record, noteId, now = new Date()) {
  return {
    ...record,
    notes: record.notes.filter((note) => note.id !== noteId),
    updatedAt: now.toISOString(),
  }
}

export function saveReportMarkdown(record, reportMarkdown, now = new Date()) {
  const timestamp = now.toISOString()
  return {
    ...record,
    reportMarkdown,
    reportCreatedAt: record.reportCreatedAt || timestamp,
    updatedAt: timestamp,
  }
}

export function clearReportMarkdown(record, now = new Date()) {
  return {
    ...record,
    reportMarkdown: '',
    reportCreatedAt: null,
    updatedAt: now.toISOString(),
  }
}

export function upsertDailyRecord(records, nextRecord) {
  const existingIndex = records.findIndex((record) => record.date === nextRecord.date)
  if (existingIndex === -1) return [...records, nextRecord]
  return records.map((record, index) => (index === existingIndex ? nextRecord : record))
}

export function findOrCreateDailyRecord(records, date) {
  return records.find((record) => record.date === date) || createDailyRecord(date)
}

export function filterDailyReports(records, { keyword = '', date = '' } = {}) {
  const normalizedKeyword = keyword.trim().toLocaleLowerCase('ja-JP')
  return records
    .filter((record) => record.reportMarkdown)
    .filter((record) => !date || record.date === date)
    .filter((record) => {
      if (!normalizedKeyword) return true
      const haystack = [record.reportMarkdown, ...record.notes.map((note) => note.text)]
        .join('\n')
        .toLocaleLowerCase('ja-JP')
      return haystack.includes(normalizedKeyword)
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function buildDailyReportPrompt(record) {
  const notes = [...record.notes]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((note) => `- ${new Date(note.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}｜${note.text}`)
    .join('\n')

  return `以下は${record.date}にユーザー本人が記録した活動メモです。記録された事実だけを使い、指定の2形式を1つのMarkdown回答として作成してください。

【活動メモ】
${notes}

【出力①：1日の振り返りと自己成長】
1. 日付
2. 今日の主な出来事
3. 感謝の瞬間
4. 達成したこと
5. 学んだこと
6. 課題と改善点
7. 感じた気づき
8. ポジティブな言葉
9. 明日への目標
10. 今日の自分に対する評価（1〜10）

【出力②：AIアクション報告】
# 活動時間
# 活動内容
- AI開発
- 社会課題・キャリア
- 読書・学習
- その他（必要な場合）
# 振り返り
- P｜目標
- D｜行動
- C｜結果
- A｜次の改善
# 今日の本質的な学び

【厳守するルール】
- 記録された事実を優先し、記録にない成果・数値・活動を追加しない。
- 活動時間を推測しない。メモに所要時間がなければ「未記録」とする。
- 感謝の瞬間や自己評価を捏造せず、根拠がなければ「未記録」とする。
- 未記録の項目は「未記録」と表示する。
- AIの改善案は「AIからの提案」と明記し、記録された事実と区別する。
- 日付は必ず${record.date}を使用する。
- 2つの出力を省略せず、Markdownで読みやすく整形する。`
}

export function prepareDailyReportGeneration(record) {
  if (record.notes.length === 0) {
    return {
      prompt: null,
      error: '日報を作成するには、活動メモを1件以上追加してください。',
    }
  }

  const prompt = buildDailyReportPrompt(record)
  if (prompt.length > MAX_DAILY_REPORT_PROMPT_LENGTH) {
    return {
      prompt: null,
      error: `活動メモをまとめた入力がAPI上限の${MAX_DAILY_REPORT_PROMPT_LENGTH.toLocaleString()}文字を超えています。内容は切り捨てていません。メモを整理してから再実行してください。`,
    }
  }

  return { prompt, error: null }
}

export function markdownToPlainText(markdown) {
  return markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '・')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()
}

export function createReportExportFiles(date, markdown) {
  const safeDate = date.replaceAll('-', '')
  return {
    markdown: {
      filename: `aimu-report-${safeDate}.md`,
      content: markdown,
      type: 'text/markdown;charset=utf-8',
    },
    text: {
      filename: `aimu-report-${safeDate}.txt`,
      content: markdownToPlainText(markdown),
      type: 'text/plain;charset=utf-8',
    },
  }
}
