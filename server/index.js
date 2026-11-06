import 'dotenv/config'
import { createApp } from './app.js'
import { getConfig } from './config.js'

const config = getConfig()
const app = createApp({ config })

app.listen(config.port, '127.0.0.1', () => {
  console.log(`Aimu Report AI server: http://127.0.0.1:${config.port}`)
  if (!config.apiKey) console.warn('DIFY_API_KEYが未設定です。.envを確認してください。')
})
