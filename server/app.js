import express from 'express'

const MAX_MESSAGE_LENGTH = 6_000
const MAX_USER_ID_LENGTH = 80
const CONVERSATION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const USER_ID_PATTERN = /^[a-zA-Z0-9_-]+$/
const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/

function isLocalRequest(req) {
  const origin = req.get('origin')
  return !origin || LOCAL_ORIGIN_PATTERN.test(origin)
}

function validateRequest(body) {
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) return 'メッセージを入力してください。'
  if (message.length > MAX_MESSAGE_LENGTH) {
    return `メッセージは${MAX_MESSAGE_LENGTH}文字以内で入力してください。`
  }

  if (
    typeof body.userId !== 'string' ||
    body.userId.length > MAX_USER_ID_LENGTH ||
    !USER_ID_PATTERN.test(body.userId)
  ) {
    return 'ユーザー識別子が不正です。'
  }

  if (body.conversationId && !CONVERSATION_ID_PATTERN.test(body.conversationId)) {
    return '会話識別子が不正です。'
  }

  return null
}

function safeUpstreamError(status) {
  if (status === 401 || status === 403) return 'Dify APIの認証またはアクセス設定を確認してください。'
  if (status === 429) return 'Dify APIが混み合っています。時間をおいて再試行してください。'
  return 'Dify APIで応答を生成できませんでした。'
}

export function createApp({ config, fetchImpl = fetch }) {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '16kb', strict: true }))

  app.use('/api', (req, res, next) => {
    if (!isLocalRequest(req)) {
      return res.status(403).json({ error: 'ローカル開発元からのみアクセスできます。' })
    }
    return next()
  })

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', difyConfigured: Boolean(config.apiKey) })
  })

  app.post('/api/chat', async (req, res) => {
    const validationError = validateRequest(req.body || {})
    if (validationError) return res.status(400).json({ error: validationError })
    if (!config.apiKey) {
      return res.status(503).json({ error: 'サーバーのDify API設定が完了していません。' })
    }

    const payload = {
      inputs: config.inputs,
      query: req.body.message.trim(),
      user: req.body.userId,
      response_mode: 'blocking',
    }
    if (req.body.conversationId) payload.conversation_id = req.body.conversationId

    try {
      const upstreamResponse = await fetchImpl(`${config.apiBaseUrl}/chat-messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(config.timeoutMs),
      })

      if (!upstreamResponse.ok) {
        return res.status(upstreamResponse.status === 429 ? 503 : 502).json({
          error: safeUpstreamError(upstreamResponse.status),
        })
      }

      const data = await upstreamResponse.json()
      if (typeof data.answer !== 'string' || typeof data.conversation_id !== 'string') {
        return res.status(502).json({ error: 'Dify APIから不正な応答を受信しました。' })
      }

      return res.json({ answer: data.answer, conversationId: data.conversation_id })
    } catch (error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        return res.status(504).json({ error: 'Dify APIの応答がタイムアウトしました。' })
      }
      return res.status(502).json({ error: 'Dify APIに接続できませんでした。' })
    }
  })

  app.use((error, _req, res, _next) => {
    if (error?.type === 'entity.too.large') {
      return res.status(413).json({ error: 'リクエストのサイズが上限を超えています。' })
    }
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: 'JSONリクエストの形式が不正です。' })
    }
    return res.status(500).json({ error: 'サーバーでエラーが発生しました。' })
  })

  return app
}
