const STORAGE_KEY = 'aimu-report-ai:daily-reports:v1'

export class DailyReportStorageError extends Error {
  constructor(message, cause) {
    super(message, { cause })
    this.name = 'DailyReportStorageError'
  }
}

function isValidNote(note) {
  return (
    note &&
    typeof note.id === 'string' &&
    typeof note.text === 'string' &&
    typeof note.createdAt === 'string' &&
    typeof note.updatedAt === 'string'
  )
}

function isValidRecord(record) {
  return (
    record &&
    typeof record.id === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(record.date) &&
    Array.isArray(record.notes) &&
    record.notes.every(isValidNote) &&
    typeof record.reportMarkdown === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string'
  )
}

export function loadDailyRecords(storage = window.localStorage) {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return { records: [], error: null }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('root value is not an array')

    const validRecords = parsed.filter(isValidRecord)
    const error = validRecords.length === parsed.length
      ? null
      : '一部の保存データが壊れていたため、読み込める記録だけを表示しています。'
    return { records: validRecords, error }
  } catch (cause) {
    return {
      records: [],
      error: 'ブラウザの保存データを読み込めませんでした。新しい記録は作成できます。',
      cause,
    }
  }
}

export function saveDailyRecords(records, storage = window.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (cause) {
    throw new DailyReportStorageError(
      'ブラウザへ保存できませんでした。空き容量やプライベートブラウズ設定を確認してください。',
      cause,
    )
  }
}

export { STORAGE_KEY }
