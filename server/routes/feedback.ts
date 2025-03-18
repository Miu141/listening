import { Router } from 'express'
import { OpenAI } from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const router = Router()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// リスニング結果からフィードバックを生成するAPI
router.post('/', async (req, res) => {
  try {
    const { transcript, userAnswers, level, goal } = req.body

    if (!transcript || !userAnswers) {
      return res.status(400).json({ error: '文字起こしとユーザーの回答が必要です' })
    }

    // 実際のアプリケーションでは、ここでOpenAIのGPT-4などを使用して
    // 文字起こしとユーザーの回答を比較し、フィードバックを生成するロジックを実装します

    // サンプルのレスポンス
    const mockFeedback = {
      score: 85,
      timeSpent: '3:45',
      feedback: [
        '挨拶と自己紹介のパートは良く理解できています',
        '仕事の説明については概ね理解できていましたが、一部聞き取りにくい部分がありました',
        '趣味の説明は非常に良く理解できています',
        '今後の目標についても理解できています',
      ],
      suggestions: [
        'リスニング速度をさらに上げるために、1.25倍速での練習も試してみましょう',
        '似た発音の単語（例：work/walk）の聞き分けを練習すると良いでしょう',
        '次はより長い会話や複数人での会話に挑戦してみましょう',
      ]
    }

    res.json(mockFeedback)
  } catch (error) {
    console.error('フィードバック生成エラー:', error)
    res.status(500).json({ error: 'フィードバック生成中にエラーが発生しました' })
  }
})

export const feedbackRoute = router 