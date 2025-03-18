import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { OpenAI } from 'openai'
import { transcriptRoute } from './routes/transcript'
import { feedbackRoute } from './routes/feedback'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// OpenAI設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ミドルウェア
app.use(cors())
app.use(express.json())

// APIルート
app.use('/api/transcript', transcriptRoute)
app.use('/api/feedback', feedbackRoute)

// 簡単なヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'サーバーは正常に動作しています' })
})

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`)
}) 