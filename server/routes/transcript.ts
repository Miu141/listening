import { Router } from 'express'
import { OpenAI } from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const router = Router()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 音声から文字起こしを行うAPI
router.post('/', async (req, res) => {
  try {
    const { audioUrl } = req.body

    if (!audioUrl) {
      return res.status(400).json({ error: '音声URLが必要です' })
    }

    // 実際のアプリケーションでは、ここでOpenAIのWhisperAPIなどを使用して
    // 音声ファイルから文字起こしを行うロジックを実装します
    
    // サンプルのレスポンス
    const mockTranscript = `Hello, my name is Sarah. I'm from New York. I work as a software engineer. 
In my free time, I enjoy hiking, reading books, and playing the piano. 
I've been learning Japanese for about two years now. 
I hope to visit Japan someday and practice my language skills.`

    res.json({ transcript: mockTranscript })
  } catch (error) {
    console.error('文字起こしエラー:', error)
    res.status(500).json({ error: '文字起こし処理中にエラーが発生しました' })
  }
})

export const transcriptRoute = router 