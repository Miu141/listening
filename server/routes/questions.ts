import { Router } from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// ESモジュールで__dirnameを再現する
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// デバッグ用のログ関数
const logDebug = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

// 音声を生成する関数とそのプロパティ用のインターフェース
interface GenerateSpeechFileFunction {
  (text: string): Promise<string>;
  isGenerating: boolean;
  lastGeneratedPath: string | null;
}

// 音声を生成する関数
const generateSpeechFile = (async (text: string): Promise<string> => {
  // 音声生成が既に進行中かチェック
  if ((generateSpeechFile as GenerateSpeechFileFunction).isGenerating) {
    logDebug("音声生成がすでに進行中です。リクエストを無視します。");
    await new Promise(resolve => setTimeout(resolve, 200));
    if ((generateSpeechFile as GenerateSpeechFileFunction).lastGeneratedPath) {
      return (generateSpeechFile as GenerateSpeechFileFunction).lastGeneratedPath;
    }
  }

  (generateSpeechFile as GenerateSpeechFileFunction).isGenerating = true;
  (generateSpeechFile as GenerateSpeechFileFunction).lastGeneratedPath = null;

  try {
    logDebug("音声生成開始", { textLength: text.length });

    // テキストが長すぎる場合は適切なサイズに切り詰める
    const maxLength = 4000; // OpenAIのTTS APIの制限に基づく
    const limitedText =
      text.length > maxLength ? text.substring(0, maxLength) : text;
    if (text.length > maxLength) {
      logDebug("テキストが長すぎるため切り詰めました", {
        originalLength: text.length,
        limitedLength: limitedText.length,
      });
    }

    // 音声ファイルの保存ディレクトリの確認・作成
    const audioDir = path.join(
      path.dirname(path.dirname(__dirname)),
      "public/audio"
    );
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // 既存のmp3ファイルを全て削除
    logDebug("既存の音声ファイルをクリアします");
    const files = fs.readdirSync(audioDir);
    let deletedCount = 0;
    for (const file of files) {
      if (file.endsWith('.mp3') && file !== '.gitkeep') {
        fs.unlinkSync(path.join(audioDir, file));
        deletedCount++;
      }
    }
    logDebug(`${deletedCount}個の音声ファイルを削除しました`);
    
    // ファイルシステムの処理が確実に完了するのを待つ
    await new Promise(resolve => setTimeout(resolve, 100));

    // ファイル名を生成（タイムスタンプを含む）
    const timestamp = new Date().getTime();
    const filename = `speech_${timestamp}.mp3`;
    const outputPath = path.join(audioDir, filename);

    logDebug("音声ファイル保存先:", { audioDir, outputPath });

    // OpenAI Speech APIを使用して音声を生成
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: limitedText,
      response_format: "mp3",
    });

    // 応答をバッファに変換
    const buffer = Buffer.from(await mp3.arrayBuffer());

    logDebug("音声データのバッファサイズ:", { size: buffer.length });

    // ファイルに書き込み
    fs.writeFileSync(outputPath, buffer);

    // ファイルが正しく書き込まれたか確認
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      logDebug("音声ファイル生成完了", {
        filename,
        path: outputPath,
        size: stats.size,
        exists: true,
      });
    } else {
      logDebug("警告: ファイルが書き込まれましたが、確認できません", {
        outputPath,
      });
    }

    // 相対パスを返す
    const audioPath = `/audio/${filename}`;
    (generateSpeechFile as GenerateSpeechFileFunction).lastGeneratedPath = audioPath;
    return audioPath;
  } catch (error) {
    logDebug("音声生成エラー", { error });

    // エラーの詳細情報を取得
    let errorMessage = "不明なエラー";
    if (error instanceof Error) {
      errorMessage = error.message;
      logDebug("エラーメッセージ", {
        message: error.message,
        stack: error.stack,
      });
    }

    throw new Error(`音声生成に失敗しました: ${errorMessage}`);
  } finally {
    // 処理完了後に進行中フラグをクリア
    (generateSpeechFile as GenerateSpeechFileFunction).isGenerating = false;
  }
}) as GenerateSpeechFileFunction;

// 関数にプロパティを追加
generateSpeechFile.isGenerating = false;
generateSpeechFile.lastGeneratedPath = null;

// リスニング問題を生成するAPI
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { level, goal, topic, skipAudioGeneration, existingAudioUrl, existingText } = req.body;
    logDebug("リクエスト受信", { level, goal, topic, skipAudioGeneration, existingAudioUrl, existingText: existingText ? "あり" : "なし" });
    logDebug("リクエストヘッダー", req.headers);

    // 進捗状況の初期化
    req.io.emit("progress", { progress: 5, status: "問題生成を初期化中..." });

    if (!level || !goal || !topic) {
      logDebug("パラメータ不足", { body: req.body, headers: req.headers });
      return res
        .status(400)
        .json({ error: "レベル、目標、トピックが必要です" });
    }

    if (!process.env.OPENAI_API_KEY) {
      logDebug("OpenAI APIキーが設定されていません");
      return res
        .status(500)
        .json({ error: "OpenAI APIキーが設定されていません" });
    }

    // 段階的な進捗状況を更新
    setTimeout(() => {
      req.io.emit("progress", { progress: 15, status: "データを処理中..." });
    }, 500);

    setTimeout(() => {
      req.io.emit("progress", { progress: 30, status: "テキストの分析中..." });
    }, 1000);

    // OpenAI APIに接続
    req.io.emit("progress", { progress: 40, status: "OpenAI APIに接続中..." });
    logDebug("OpenAI API呼び出し開始", { level, goal, topic });

    // 問題構築の段階を表示
    setTimeout(() => {
      req.io.emit("progress", {
        progress: 50,
        status: "文章を生成しています...",
      });
    }, 2000);

    // OpenAIを使用して問題を生成
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `英語のリスニング問題を作成してください。
レベル: ${level}
学習目標: ${goal}
トピック: ${topic}

必ず4つの問題を作成してください。内容に多様性を持たせてください。
タイムスタンプ: ${new Date().toISOString()}

重要な要件：
1. 問題の文章（text）、質問（question）、選択肢（choices）はすべて英語で作成してください。
2. 問題の解説（explanation）のみ日本語で作成してください。
3. 解説は学習者がなぜその答えが正解なのかを理解できるよう、詳しく説明してください。

以下のJSON形式で出力してください：
{
  "text": "リスニング問題の英文",
  "questions": [
    {
      "question": "Question in English",
      "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "【日本語での解説】なぜこの答えが正解なのか、詳しく日本語で説明してください"
    },
    {
      "question": "Question in English",
      "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "【日本語での解説】なぜこの答えが正解なのか、詳しく日本語で説明してください"
    },
    {
      "question": "Question in English",
      "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "【日本語での解説】なぜこの答えが正解なのか、詳しく日本語で説明してください"
    },
    {
      "question": "Question in English",
      "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "【日本語での解説】なぜこの答えが正解なのか、詳しく日本語で説明してください"
    }
  ]
}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.9, // 毎回少し異なる回答を得るために温度を上げる
    });

    // 選択肢生成の段階を表示
    req.io.emit("progress", {
      progress: 70,
      status: "問題の選択肢を準備中...",
    });
    logDebug("OpenAI APIレスポンス受信", response.choices[0].message);

    let generatedQuestion = JSON.parse(response.choices[0].message.content);

    // レスポンスの形式を検証
    if (
      !generatedQuestion.text ||
      !Array.isArray(generatedQuestion.questions)
    ) {
      logDebug("不正なレスポンス形式", generatedQuestion);
      req.io.emit("progress", {
        progress: 100,
        status: "エラー: 問題生成に失敗しました",
      });
      return res
        .status(500)
        .json({ error: "生成された問題のフォーマットが不正です" });
    }

    // 問題数が4問ではない場合はエラーとする
    if (generatedQuestion.questions.length !== 4) {
      logDebug("問題数が4問ではありません", {
        questionCount: generatedQuestion.questions.length
      });
      req.io.emit("progress", {
        progress: 65,
        status: "問題数が不足しています。再生成中...",
      });
      
      // 再度OpenAIを呼び出して4問を生成
      const retryResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `英語のリスニング問題を作成してください。
レベル: ${level}
学習目標: ${goal}
トピック: ${topic}

必ず4つの問題を作成してください。4問より少なくても多くてもいけません。きっちり4問作成してください。
タイムスタンプ: ${new Date().toISOString()}

重要な要件：
1. 問題の文章（text）、質問（question）、選択肢（choices）はすべて英語で作成してください。
2. 問題の解説（explanation）のみ日本語で作成してください。
3. 解説は学習者がなぜその答えが正解なのかを理解できるよう、詳しく説明してください。

以下のJSON形式で出力してください：
{
  "text": "リスニング問題の英文",
  "questions": [
    {
      "question": "Question in English",
      "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "【日本語での解説】なぜこの答えが正解なのか、詳しく日本語で説明してください"
    },
    {
      "question": "Question in English",
      "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "【日本語での解説】なぜこの答えが正解なのか、詳しく日本語で説明してください"
    },
    {
      "question": "Question in English",
      "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "【日本語での解説】なぜこの答えが正解なのか、詳しく日本語で説明してください"
    },
    {
      "question": "Question in English",
      "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "【日本語での解説】なぜこの答えが正解なのか、詳しく日本語で説明してください"
    }
  ]
}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.9,
      });
      
      generatedQuestion = JSON.parse(retryResponse.choices[0].message.content);
      
      // 再度問題数を確認
      if (!generatedQuestion.text || !Array.isArray(generatedQuestion.questions) || generatedQuestion.questions.length !== 4) {
        logDebug("再生成しても問題数が4問ではありません", {
          questionCount: generatedQuestion.questions ? generatedQuestion.questions.length : 0
        });
        req.io.emit("progress", {
          progress: 100,
          status: "エラー: 問題生成に失敗しました",
        });
        return res
          .status(500)
          .json({ error: "4つの問題を生成できませんでした。再度お試しください。" });
      }
    }

    // 日本語訳を自動生成する
    req.io.emit("progress", { progress: 75, status: "日本語訳を生成中..." });
    try {
      const translationResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "あなたは優秀な翻訳者です。英語を自然な日本語に翻訳してください。",
          },
          {
            role: "user",
            content: `以下の英文を日本語に翻訳してください：\n\n${generatedQuestion.text}`,
          },
        ],
        temperature: 0.3,
      });

      generatedQuestion.textJa = translationResponse.choices[0].message.content;
      logDebug("日本語訳の生成完了", { translation: generatedQuestion.textJa });
    } catch (error) {
      logDebug("日本語訳の生成に失敗", error);
      // 翻訳失敗してもプロセスは続行する
    }

    // 音声ファイルの生成
    req.io.emit("progress", {
      progress: 80,
      status: skipAudioGeneration ? "既存の音声ファイルを使用中..." : "音声ファイルを生成中...",
    });

    try {
      // 音声ファイルの保存ディレクトリの確認
      const audioDir = path.join(
        path.dirname(path.dirname(__dirname)),
        "public/audio"
      );
      
      // skipAudioGenerationがfalseの場合は新しく音声を生成する
      if (!skipAudioGeneration) {
        // 古いファイルをクリア
        if (fs.existsSync(audioDir)) {
          const files = fs.readdirSync(audioDir);
          let deletedCount = 0;
          for (const file of files) {
            if (file.endsWith('.mp3') && file !== '.gitkeep') {
              fs.unlinkSync(path.join(audioDir, file));
              deletedCount++;
            }
          }
          if (deletedCount > 0) {
            logDebug(`音声生成前に${deletedCount}個の古い音声ファイルを削除しました`);
          }
        }
        
        // 新しく音声を生成
        const audioUrl = await generateSpeechFile(generatedQuestion.text);
        generatedQuestion.audioUrl = audioUrl;
        req.io.emit("progress", { progress: 90, status: "最終確認中..." });
      } 
      // skipAudioGenerationがtrueで、既存の音声URLがある場合
      else if (existingAudioUrl) {
        generatedQuestion.audioUrl = existingAudioUrl;
        logDebug("既存の音声URLを使用します", existingAudioUrl);
        req.io.emit("progress", { progress: 90, status: "最終確認中..." });
      }
      // その他の場合は新しく生成
      else {
        logDebug("既存の音声URLが指定されていないため、新しく生成します");
        const audioUrl = await generateSpeechFile(generatedQuestion.text);
        generatedQuestion.audioUrl = audioUrl;
        req.io.emit("progress", { progress: 90, status: "最終確認中..." });
      }
    } catch (error) {
      logDebug("音声生成エラー", error);
      // 音声生成に失敗してもテキストでの問題提供は続行
      req.io.emit("progress", {
        progress: 90,
        status: "音声生成に失敗しました。テキストのみで問題を提供します。",
      });
    }

    // 完了したことを通知
    setTimeout(() => {
      req.io.emit("progress", {
        progress: 100,
        status: "問題生成が完了しました",
      });
      logDebug("問題生成成功", generatedQuestion);
      res.json(generatedQuestion);
    }, 700);
  } catch (error) {
    logDebug("エラー発生", error);
    req.io.emit("progress", {
      progress: 100,
      status: "エラー: 問題生成に失敗しました",
    });
    res.status(500).json({ error: "問題の生成中にエラーが発生しました" });
  }
});

export default router;
