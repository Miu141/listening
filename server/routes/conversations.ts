import { Router, Request, Response } from 'express'
import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

// ルーターの初期化
const router = Router()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// デバッグ用ロギング関数
const logDebug = (message: string, data?: any) => {
  console.log(`[Conversations API] ${message}`, data || '')
}

// トピックのカテゴリ
const TOPIC_CATEGORIES = [
  "daily", // 日常会話
  "travel", // 旅行
  "business", // ビジネス
  "academic", // 学術
  "entertainment", // エンターテイメント
];

// トピックごとのプロンプト定義
const TOPIC_PROMPTS: Record<string, string> = {
  // 日常会話カテゴリ
  "daily-greetings": "挨拶と自己紹介に関する短い会話のサンプルを生成してください",
  "daily-shopping": "ショッピング中の短い会話のサンプルを生成してください",
  "daily-restaurant": "レストランでの短い会話のサンプルを生成してください",
  "daily-directions": "道案内に関する短い会話のサンプルを生成してください",
  "daily-weather": "天気に関する短い会話のサンプルを生成してください",

  // 旅行カテゴリ
  "travel-airport": "空港での短い会話のサンプルを生成してください",
  "travel-hotel": "ホテルでの短い会話のサンプルを生成してください",
  "travel-transportation": "交通機関利用時の短い会話のサンプルを生成してください",
  "travel-sightseeing": "観光地での短い会話のサンプルを生成してください",
  "travel-emergency": "旅行中の緊急時の短い会話のサンプルを生成してください",

  // ビジネスカテゴリ
  "business-meeting": "ビジネスミーティングでの短い会話のサンプルを生成してください",
  "business-presentation": "プレゼンテーションに関する短い会話のサンプルを生成してください",
  "business-negotiation": "ビジネス交渉での短い会話のサンプルを生成してください",
  "business-email": "ビジネスメールについての短い会話のサンプルを生成してください",
  "business-smalltalk": "ビジネスの場での雑談の短い会話のサンプルを生成してください",

  // 学術カテゴリ
  "academic-lecture": "大学の講義に関する短い会話のサンプルを生成してください",
  "academic-discussion": "学術的なディスカッションの短い会話のサンプルを生成してください",
  "academic-presentation": "学術発表に関する短い会話のサンプルを生成してください",
  "academic-research": "研究活動に関する短い会話のサンプルを生成してください",
  "academic-exam": "試験対策に関する短い会話のサンプルを生成してください",

  // エンターテイメントカテゴリ
  "entertainment-movies": "映画に関する短い会話のサンプルを生成してください",
  "entertainment-music": "音楽に関する短い会話のサンプルを生成してください",
  "entertainment-tv": "テレビ番組に関する短い会話のサンプルを生成してください",
  "entertainment-news": "ニュースに関する短い会話のサンプルを生成してください",
  "entertainment-podcasts": "ポッドキャストに関する短い会話のサンプルを生成してください"
};

// 会話サンプルを生成するエンドポイント
router.get('/sample/:topicId', async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    
    if (!topicId) {
      return res.status(400).json({ error: 'トピックIDが必要です' });
    }

    logDebug('会話サンプル生成リクエスト', { topicId });

    // トピックに対応するプロンプトを取得
    const prompt = TOPIC_PROMPTS[topicId] || '短い会話のサンプルを生成してください';

    // 環境変数が設定されているか確認
    if (!process.env.OPENAI_API_KEY) {
      logDebug('OpenAI APIキーが設定されていません');
      // フォールバックとしてランダムなサンプル会話を返す
      const fallbackSamples = [
        "こんにちは、お手伝いできることはありますか？",
        "このバスは市内中心部に行きますか？",
        "予約を変更したいのですが、可能でしょうか？",
        "今日の天気は晴れるみたいですね。",
        "この商品の返品期限はいつまでですか？"
      ];
      const randomIndex = Math.floor(Math.random() * fallbackSamples.length);
      return res.json({ conversation: fallbackSamples[randomIndex] });
    }

    // OpenAI APIを使用して会話サンプルを生成
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `あなたは英語学習アプリのための会話サンプルを生成するアシスタントです。
与えられたトピックに関連する短い会話のサンプルを1つだけ生成してください。
会話は30〜50文字程度の短いものにし、日本語で出力してください。
会話は現実的で自然なものにしてください。`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    // 生成された会話を取得
    const conversation = response.choices[0].message.content.trim();
    logDebug('会話サンプル生成完了', { conversation });

    // クライアントに会話サンプルを返す
    res.json({ conversation });
  } catch (error) {
    logDebug('会話サンプル生成エラー', error);
    res.status(500).json({ error: '会話サンプル生成中にエラーが発生しました' });
  }
});

// ランダムなトピックを生成するエンドポイント
router.get('/random-topics', async (req: Request, res: Response) => {
  try {
    const { goal = '', count = '5' } = req.query;
    const topicCount = parseInt(count as string) || 5;
    
    logDebug('ランダムトピック生成リクエスト', { goal, count: topicCount });

    // 環境変数が設定されているか確認
    if (!process.env.OPENAI_API_KEY) {
      logDebug('OpenAI APIキーが設定されていません');
      // フォールバックとしてランダムなトピックを返す
      return res.json({
        topics: [
          { id: "random-topic-1", label: "レストランでの注文", difficulty: 2 },
          { id: "random-topic-2", label: "道の尋ね方", difficulty: 2 },
          { id: "random-topic-3", label: "ホテルでのチェックイン", difficulty: 3 },
          { id: "random-topic-4", label: "買い物での値段交渉", difficulty: 3 },
          { id: "random-topic-5", label: "友達との待ち合わせ", difficulty: 2 }
        ]
      });
    }

    const selectedCategory = goal && TOPIC_CATEGORIES.includes(goal as string) 
      ? goal as string 
      : TOPIC_CATEGORIES[Math.floor(Math.random() * TOPIC_CATEGORIES.length)];

    logDebug('トピック生成カテゴリー', { selectedCategory });

    // OpenAI APIを使用してトピックを生成
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `あなたは英語学習アプリのためのトピック生成アシスタントです。
指定されたカテゴリーに関連する${topicCount}個の英語会話トピックを生成してください。
カテゴリー: ${selectedCategory}

以下の形式で出力してください:
[
  { "id": "トピックのID", "label": "トピックの名前", "difficulty": 難易度(1-5の整数) },
  ... (${topicCount}個)
]

各トピックは:
- id: "category-name" の形式（英数小文字とハイフンのみ）
- label: 日本語での短い名前（15文字以内）
- difficulty: 1(簡単)〜5(難しい)の範囲

カテゴリーに応じた適切な難易度を設定してください。`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 500
    });

    // 生成されたJSONを解析
    const rawContent = response.choices[0].message.content.trim();
    let generatedTopics;
    
    try {
      generatedTopics = JSON.parse(rawContent);
      
      // トピック配列があるか確認
      if (!Array.isArray(generatedTopics)) {
        if (Array.isArray(generatedTopics.topics)) {
          generatedTopics = generatedTopics.topics;
        } else {
          throw new Error('トピック配列が見つかりません');
        }
      }
      
      // 各トピックの形式を検証
      generatedTopics = generatedTopics.map((topic: any, index: number) => {
        // IDがなければ生成
        if (!topic.id) {
          topic.id = `${selectedCategory}-random-${index + 1}`;
        }
        
        // 難易度が範囲外なら修正
        if (!topic.difficulty || topic.difficulty < 1 || topic.difficulty > 5) {
          topic.difficulty = Math.floor(Math.random() * 5) + 1;
        }
        
        return topic;
      });
      
      // 必要な数に調整
      if (generatedTopics.length > topicCount) {
        generatedTopics = generatedTopics.slice(0, topicCount);
      }
      
      logDebug('ランダムトピック生成完了', { topicsCount: generatedTopics.length });
    } catch (error) {
      logDebug('トピックJSONの解析に失敗', error);
      // フォールバックトピック
      generatedTopics = [
        { id: `${selectedCategory}-fallback-1`, label: "基本的な会話", difficulty: 2 },
        { id: `${selectedCategory}-fallback-2`, label: "質問と応答", difficulty: 2 },
        { id: `${selectedCategory}-fallback-3`, label: "情報の交換", difficulty: 3 },
        { id: `${selectedCategory}-fallback-4`, label: "意見の表明", difficulty: 3 },
        { id: `${selectedCategory}-fallback-5`, label: "問題解決", difficulty: 4 }
      ].slice(0, topicCount);
    }

    // クライアントにトピックリストを返す
    res.json({ topics: generatedTopics });
  } catch (error) {
    logDebug('ランダムトピック生成エラー', error);
    res.status(500).json({ error: 'ランダムトピック生成中にエラーが発生しました' });
  }
});

export default router; 