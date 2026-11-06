const DEFAULT_DIFY_API_BASE_URL = 'https://api.dify.ai/v1'
const DEFAULT_TIMEOUT_MS = 45_000
const MIN_TIMEOUT_MS = 1_000
const MAX_TIMEOUT_MS = 120_000

function parseTimeout(value) {
  const parsed = Number(value || DEFAULT_TIMEOUT_MS)
  if (!Number.isFinite(parsed)) return DEFAULT_TIMEOUT_MS
  return Math.min(Math.max(parsed, MIN_TIMEOUT_MS), MAX_TIMEOUT_MS)
}

function parseInputs(value) {
  if (!value) return {}

  try {
    const inputs = JSON.parse(value)
    if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) {
      throw new Error('DIFY_INPUTS_JSON must be a JSON object')
    }
    return inputs
  } catch (error) {
    throw new Error(`DIFY_INPUTS_JSONの形式が不正です: ${error.message}`)
  }
}

export function getConfig(env = process.env) {
  return {
    apiKey: env.DIFY_API_KEY?.trim() || '',
    apiBaseUrl: (env.DIFY_API_BASE_URL || DEFAULT_DIFY_API_BASE_URL).replace(/\/+$/, ''),
    inputs: parseInputs(env.DIFY_INPUTS_JSON),
    timeoutMs: parseTimeout(env.DIFY_API_TIMEOUT_MS),
    port: Number(env.PORT) || 3001,
  }
}
