import { Router } from 'express'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

// ESモジュールで__dirnameを再現する
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

// 音声文字起こしエンドポイント
router.post('/generate', async (req, res) => {
  try {
    const { audioFile } = req.body

    if (!audioFile) {
      return res.status(400).json({ error: '音声ファイルが必要です' })
    }

    // 一時ファイルとしてダウンロード
    const tempDir = path.join(path.dirname(path.dirname(__dirname)), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    
    const tempFilePath = path.join(tempDir, `temp_audio_${Date.now()}.mp3`)
    
    // URLからファイルをダウンロード
    const response = await fetch(audioFile)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync(tempFilePath, buffer)
    
    // OpenAIのWhisper APIを使用して音声をトランスクリプト
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
    })
    
    // 一時ファイルを削除
    fs.unlinkSync(tempFilePath)

    res.json({ transcript: transcription.text })
  } catch (error) {
    console.error('音声文字起こしエラー:', error)
    res.status(500).json({ error: '音声文字起こしに失敗しました' })
  }
})

// 翻訳APIエンドポイント
router.post('/translate', async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: 'テキストが必要です' })
    }

    // OpenAIのChatGPT APIを使用して翻訳
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "あなたは優秀な翻訳者です。英語を自然な日本語に翻訳してください。"
        },
        {
          role: "user",
          content: `以下の英文を日本語に翻訳してください：\n\n${text}`
        }
      ],
      temperature: 0.3
    })

    res.json({ translation: response.choices[0].message.content })
  } catch (error) {
    console.error('翻訳エラー:', error)
    res.status(500).json({ error: '翻訳に失敗しました' })
  }
})

export default router 