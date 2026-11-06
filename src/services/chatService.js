const CLIENT_USER_ID_KEY = 'aimu-report-client-user-id'

function getClientUserId() {
  const saved = window.localStorage.getItem(CLIENT_USER_ID_KEY)
  if (saved) return saved

  const id = `web-${crypto.randomUUID()}`
  window.localStorage.setItem(CLIENT_USER_ID_KEY, id)
  return id
}

/**
 * ユーザーの業務メモを送信し、AIの回答を受け取る。
 * @param {{ message: string, conversationId?: string | null }} request
 * @returns {Promise<{ text: string, conversationId: string }>}
 */
export async function sendMessage({ message, conversationId }) {
  let response
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        conversationId: conversationId || undefined,
        userId: getClientUserId(),
      }),
    })
  } catch {
    throw new Error('サーバーに接続できませんでした。起動状態を確認してください。')
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error || 'チャットAPIへの接続に失敗しました。')
  }

  if (typeof data?.answer !== 'string' || typeof data?.conversationId !== 'string') {
    throw new Error('チャットAPIから不正な応答を受信しました。')
  }

  return {
    text: data.answer,
    conversationId: data.conversationId,
  }
}
