import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { loadDailyRecords, saveDailyRecords, STORAGE_KEY } from '../src/services/dailyReportStorage.js'
import {
  addActivityNote,
  buildDailyReportPrompt,
  clearReportMarkdown,
  createReportExportFiles,
  createDailyRecord,
  filterDailyReports,
  markdownToPlainText,
  prepareDailyReportGeneration,
  removeActivityNote,
  saveReportMarkdown,
  updateActivityNote,
  upsertDailyRecord,
} from '../src/utils/dailyReportUtils.js'

function createMemoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    values,
  }
}

test('活動メモを複数追加・変更・削除できる', () => {
  let record = createDailyRecord('2026-11-06', new Date('2026-11-06T09:00:00+09:00'))
  record = addActivityNote(record, '設計を確認', new Date('2026-11-06T09:10:00+09:00'))
  record = addActivityNote(record, '架空データでテスト', new Date('2026-11-06T10:00:00+09:00'))
  assert.equal(record.notes.length, 2)

  const firstId = record.notes[0].id
  record = updateActivityNote(record, firstId, '設計を再確認', new Date('2026-11-06T11:00:00+09:00'))
  assert.equal(record.notes[0].text, '設計を再確認')

  record = removeActivityNote(record, firstId, new Date('2026-11-06T12:00:00+09:00'))
  assert.deepEqual(record.notes.map((note) => note.text), ['架空データでテスト'])
})

test('日付ごとの記録を分離し再読み込み後も復元できる', () => {
  const storage = createMemoryStorage()
  const first = addActivityNote(createDailyRecord('2026-11-05'), '前日の記録')
  const second = addActivityNote(createDailyRecord('2026-11-06'), '当日の記録')
  const records = upsertDailyRecord(upsertDailyRecord([], first), second)

  saveDailyRecords(records, storage)
  const loaded = loadDailyRecords(storage)

  assert.equal(loaded.error, null)
  assert.equal(loaded.records.length, 2)
  assert.equal(loaded.records.find((record) => record.date === '2026-11-05').notes[0].text, '前日の記録')
  assert.equal(loaded.records.find((record) => record.date === '2026-11-06').notes[0].text, '当日の記録')
})

test('壊れた保存データでもアプリ用の空配列と警告を返す', () => {
  const storage = createMemoryStorage()
  storage.values.set(STORAGE_KEY, '{broken json')
  const loaded = loadDailyRecords(storage)

  assert.deepEqual(loaded.records, [])
  assert.match(loaded.error, /読み込めませんでした/)
})

test('日報を編集保存・削除でき、日付とキーワードで検索できる', () => {
  const first = saveReportMarkdown(
    addActivityNote(createDailyRecord('2026-11-05'), '読書をした'),
    '# 学び\nReactの状態管理を復習した',
  )
  const second = saveReportMarkdown(
    addActivityNote(createDailyRecord('2026-11-06'), '架空のAI開発をした'),
    '# 成果\nモックAPIを完成した',
  )

  assert.deepEqual(filterDailyReports([first, second], { keyword: 'モック' }).map((item) => item.date), ['2026-11-06'])
  assert.deepEqual(filterDailyReports([first, second], { date: '2026-11-05' }).map((item) => item.date), ['2026-11-05'])
  assert.equal(clearReportMarkdown(second).reportMarkdown, '')
})

test('Dify用プロンプトに2種類の形式・日付・事実優先ルールを含める', () => {
  const record = addActivityNote(createDailyRecord('2026-11-06'), '架空のレビューを1件実施')
  const prompt = buildDailyReportPrompt(record)

  assert.match(prompt, /【出力①：1日の振り返りと自己成長】/)
  assert.match(prompt, /【出力②：AIアクション報告】/)
  assert.match(prompt, /2026-11-06/)
  assert.match(prompt, /記録にない成果・数値・活動を追加しない/)
})

test('Markdownをプレーンテキストへ変換できる', () => {
  assert.equal(markdownToPlainText('# 見出し\n- **項目**'), '見出し\n・項目')
})

test('保存失敗時は専用エラーを返し、呼び出し側が通知できる', () => {
  const storage = {
    getItem: () => null,
    setItem: () => { throw new Error('quota exceeded') },
  }

  assert.throws(
    () => saveDailyRecords([createDailyRecord('2026-11-06')], storage),
    /ブラウザへ保存できませんでした/,
  )
})

test('空の活動記録では生成できず、上限超過時も内容を切り捨てない', () => {
  const emptyResult = prepareDailyReportGeneration(createDailyRecord('2026-11-08'))
  assert.equal(emptyResult.prompt, null)
  assert.match(emptyResult.error, /活動メモを1件以上/)

  const oversizedRecord = addActivityNote(createDailyRecord('2026-11-08'), '架空'.repeat(3_000))
  const oversizedResult = prepareDailyReportGeneration(oversizedRecord)
  assert.equal(oversizedResult.prompt, null)
  assert.match(oversizedResult.error, /切り捨てていません/)
})

test('Markdownとプレーンテキストの出力内容・ファイル名を作成できる', () => {
  const files = createReportExportFiles('2026-11-08', '# 日報\n- 架空の活動')
  assert.equal(files.markdown.filename, 'aimu-report-20261108.md')
  assert.equal(files.markdown.content, '# 日報\n- 架空の活動')
  assert.equal(files.text.filename, 'aimu-report-20261108.txt')
  assert.equal(files.text.content, '日報\n・架空の活動')
})

test('A4縦向きの印刷CSSと印刷専用日報領域が定義されている', async () => {
  const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
  assert.match(css, /@page\s*{[\s\S]*size:\s*A4 portrait/)
  assert.match(css, /@media print[\s\S]*\.report-print-area/)
})
