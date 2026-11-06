import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { createApp } from '../server/app.js'

const conversationId = '45701982-8118-4bc5-8e9b-64562b4555f2'
const servers = []

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))))
})

async function startTestServer(fetchImpl, overrides = {}) {
  const app = createApp({
    fetchImpl,
    config: {
      apiKey: 'test-key',
      apiBaseUrl: 'https://api.dify.test/v1',
      inputs: {},
      timeoutMs: 1_000,
      ...overrides,
    },
  })
  const server = app.listen(0, '127.0.0.1')
  servers.push(server)
  await new Promise((resolve) => server.once('listening', resolve))
  return `http://127.0.0.1:${server.address().port}`
}

test('新規チャットをDifyのblocking APIへ送りconversation_idを返す', async () => {
  let capturedRequest
  const baseUrl = await startTestServer(async (url, options) => {
    capturedRequest = { url, options }
    return Response.json({ answer: '## 本日の日報\n- 完了', conversation_id: conversationId })
  })

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
    body: JSON.stringify({ message: '顧客対応を完了', userId: 'web-test-user' }),
  })
  const data = await response.json()
  const upstreamBody = JSON.parse(capturedRequest.options.body)

  assert.equal(response.status, 200)
  assert.equal(data.conversationId, conversationId)
  assert.equal(capturedRequest.url, 'https://api.dify.test/v1/chat-messages')
  assert.equal(capturedRequest.options.headers.Authorization, 'Bearer test-key')
  assert.deepEqual(upstreamBody, {
    inputs: {},
    query: '顧客対応を完了',
    user: 'web-test-user',
    response_mode: 'blocking',
  })
})

test('既存のconversation_idをDifyへ引き継ぐ', async () => {
  let upstreamBody
  const baseUrl = await startTestServer(async (_url, options) => {
    upstreamBody = JSON.parse(options.body)
    return Response.json({ answer: '続きの回答', conversation_id: conversationId })
  })

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '続きです', userId: 'web-test-user', conversationId }),
  })

  assert.equal(response.status, 200)
  assert.equal(upstreamBody.conversation_id, conversationId)
})

test('長すぎる入力はDifyへ送らず400を返す', async () => {
  let called = false
  const baseUrl = await startTestServer(async () => {
    called = true
    return Response.json({})
  })

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'a'.repeat(6_001), userId: 'web-test-user' }),
  })

  assert.equal(response.status, 400)
  assert.equal(called, false)
})

test('ローカル以外のOriginを拒否する', async () => {
  const baseUrl = await startTestServer(async () => Response.json({}))
  const response = await fetch(`${baseUrl}/api/health`, { headers: { Origin: 'https://example.com' } })

  assert.equal(response.status, 403)
})
