import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = `${window.location.protocol}//${window.location.hostname}:3000`;

// 進捗状態の型定義
type ProgressStage = {
  label: string;
  percentage: number;
  description: string;
};

// 進捗段階の定義
const PROGRESS_STAGES: ProgressStage[] = [
  {
    label: "初期化",
    percentage: 5,
    description: "問題生成の準備をしています...",
  },
  {
    label: "データ処理",
    percentage: 15,
    description: "難易度と目的に合わせて調整中...",
  },
  { label: "AI分析", percentage: 30, description: "テキストの分析中..." },
  { label: "問題構築", percentage: 50, description: "文章を生成しています..." },
  {
    label: "選択肢生成",
    percentage: 70,
    description: "問題の選択肢を準備中...",
  },
  { label: "最終確認", percentage: 90, description: "問題の品質を確認中..." },
  { label: "完了", percentage: 100, description: "問題生成が完了しました" },
];

const GeneratingPage = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [, setStatus] = useState("準備中...");
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const isGeneratingRef = useRef(false);
  const navigationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionDataSavedRef = useRef(false);
  const [currentStage, setCurrentStage] = useState<ProgressStage>(
    PROGRESS_STAGES[0]
  );

  // 現在の進捗段階を計算
  useEffect(() => {
    // 進捗率以下の段階から最大のものを探す
    let currentStageIndex = 0;
    for (let i = 0; i < PROGRESS_STAGES.length; i++) {
      if (progress >= PROGRESS_STAGES[i].percentage) {
        currentStageIndex = i;
      } else {
        break;
      }
    }
    setCurrentStage(PROGRESS_STAGES[currentStageIndex]);
  }, [progress]);

  const addDebugLog = useCallback((message: string) => {
    console.log(`[Debug] ${message}`);
    setDebugInfo((prev) => [
      ...prev,
      `${new Date().toISOString()} - ${message}`,
    ]);
  }, []);

  // 進捗状況が100%になったら自動的にリスニングページへ遷移する
  useEffect(() => {
    if (progress === 100 && questionDataSavedRef.current) {
      addDebugLog(
        "進捗100%到達かつデータ保存済み - リスニングページへ遷移準備"
      );

      // 既存のタイマーをクリアする
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }

      // リスニングページへの遷移を予約（より短い時間に変更）
      navigationTimerRef.current = setTimeout(() => {
        addDebugLog("リスニングページへ遷移実行");
        window.location.href = "/listening";
      }, 800);
    } else if (progress === 100) {
      // 100%だが、まだデータが保存されていない場合は定期的にチェック
      const checkDataInterval = setInterval(() => {
        if (questionDataSavedRef.current) {
          addDebugLog(
            "データ保存確認ループでの検出 - リスニングページへ遷移準備"
          );
          clearInterval(checkDataInterval);
          window.location.href = "/listening";
        }
      }, 300); // 短い間隔で確認

      // タイムアウト時間を短縮
      setTimeout(() => {
        clearInterval(checkDataInterval);
        // タイムアウト時も強制的に遷移を試みる
        if (!questionDataSavedRef.current) {
          addDebugLog("タイムアウト発生 - データ未保存だが強制的に遷移");
          window.location.href = "/listening";
        }
      }, 3000); // 3秒後にタイムアウト

      return () => clearInterval(checkDataInterval);
    }

    return () => {
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, [progress, addDebugLog]);

  useEffect(() => {
    // WebSocketの接続を初期化
    socketRef.current = io(SOCKET_URL);

    // 進捗状況を監視
    socketRef.current.on(
      "progress",
      (data: { progress: number; status: string }) => {
        setProgress(data.progress);
        setStatus(data.status);
        addDebugLog(`進捗更新: ${data.progress}% - ${data.status}`);
      }
    );

    // エラーを監視
    socketRef.current.on("error", (errorMessage: string) => {
      setError(errorMessage);
      addDebugLog(`WebSocketエラー: ${errorMessage}`);
    });

    addDebugLog(`WebSocket接続: ${SOCKET_URL}`);

    return () => {
      // クリーンアップ
      if (socketRef.current) {
        socketRef.current.disconnect();
        addDebugLog("WebSocket切断");
      }
    };
  }, [addDebugLog]);

  useEffect(() => {
    let isSubscribed = true;

    const generateQuestion = async () => {
      // 既に生成中の場合は処理を中止
      if (isGeneratingRef.current) {
        return;
      }

      isGeneratingRef.current = true;
      questionDataSavedRef.current = false;

      try {
        // 前回の問題データを明示的にクリアする
        localStorage.removeItem("generatedQuestion");
        addDebugLog("前回の問題データをクリア");

        const level = localStorage.getItem("selectedLevel");
        const goal = localStorage.getItem("selectedGoal");
        const topic = localStorage.getItem("selectedTopic");

        if (!isSubscribed) return;

        addDebugLog(
          `選択された情報: level=${level}, goal=${goal}, topic=${topic}`
        );

        if (!level || !goal || !topic) {
          throw new Error("必要な情報が不足しています");
        }

        addDebugLog("APIリクエスト開始");

        // 実際の問題生成APIの呼び出し
        const response = await axios
          .post(
            `${window.location.protocol}//${window.location.hostname}:3000/api/questions/generate`,
            {
              level,
              goal,
              topic,
              skipAudioGeneration: false,
            }
          )
          .catch((error) => {
            if (error.response) {
              addDebugLog(
                `APIエラー: ${error.response.status} - ${JSON.stringify(
                  error.response.data
                )}`
              );
              throw new Error(
                `サーバーエラー: ${error.response.data.error || "不明なエラー"}`
              );
            } else if (error.request) {
              addDebugLog("APIレスポンスなし");
              throw new Error(
                "サーバーに接続できません。サーバーが起動しているか確認してください。"
              );
            } else {
              addDebugLog(`リクエストエラー: ${error.message}`);
              throw error;
            }
          });

        if (!isSubscribed) return;

        addDebugLog(`APIレスポンス受信: ${JSON.stringify(response.data)}`);

        if (!response.data) {
          throw new Error("問題の生成に失敗しました");
        }

        // 音声URLの有無をログ出力
        if (response.data.audioUrl) {
          addDebugLog(`音声URL: ${response.data.audioUrl}`);

          // sample.mp3を使用しないことを確認
          if (response.data.audioUrl.includes("sample.mp3")) {
            addDebugLog("警告: サンプル音声ファイルは使用できません");
            throw new Error(
              "サンプル音声は使用できません。問題の生成をやり直してください。"
            );
          }
        } else {
          addDebugLog("警告: 音声URLがレスポンスに含まれていません");
          throw new Error(
            "音声ファイルが生成されませんでした。問題の生成をやり直してください。"
          );
        }

        // レスポンスの形式を検証
        if (!response.data.text || !Array.isArray(response.data.questions)) {
          addDebugLog(`不正なレスポンス形式: ${JSON.stringify(response.data)}`);
          throw new Error("生成された問題のフォーマットが不正です");
        }

        // 生成された問題をローカルストレージに保存
        localStorage.setItem(
          "generatedQuestion",
          JSON.stringify(response.data)
        );
        addDebugLog("問題をローカルストレージに保存完了");
        questionDataSavedRef.current = true;

        // データが保存された時点で遷移チェック
        if (progress === 100) {
          addDebugLog(
            "データ保存完了時の遷移チェック - 100%に達しているため遷移を準備"
          );
          // 即座に遷移を実行
          addDebugLog("データ保存後の遷移実行");
          window.location.href = "/listening";
        }
      } catch (error: any) {
        if (!isSubscribed) return;

        console.error("問題生成エラー:", error);
        addDebugLog(`エラー発生: ${error.message}`);
        setError(`問題の生成中にエラーが発生しました: ${error.message}`);

        // エラー発生時も、5秒後にリスニングページへ遷移させる
        // これにより、前回生成された問題があれば表示できる
        if (localStorage.getItem("generatedQuestion")) {
          addDebugLog(
            "エラー発生後も前回の問題データが存在するため5秒後に遷移します"
          );
          setTimeout(() => {
            if (isSubscribed) {
              window.location.href = "/listening";
            }
          }, 5000);
        }
      } finally {
        isGeneratingRef.current = false;
      }
    };

    generateQuestion();

    return () => {
      isSubscribed = false;
    };
  }, [addDebugLog, progress]);

  const handleBack = useCallback(() => {
    setError(null);
    setProgress(0);
    setStatus("準備中...");
    setDebugInfo([]);
    navigate(-1);
  }, [navigate]);

  // 手動で問題ページに移動するボタン
  const handleManualNavigation = useCallback(() => {
    addDebugLog("手動でリスニングページへ遷移");
    window.location.href = "/listening";
  }, [addDebugLog]);

  if (error) {
    return (
      <div className="max-w-md mx-auto py-10 px-4 text-center">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
          <p>{error}</p>
        </div>
        {/* デバッグ情報の表示 */}
        <div className="mt-4 mb-4 text-left bg-gray-100 p-4 rounded-lg overflow-auto max-h-60">
          <h3 className="font-bold mb-2">デバッグ情報:</h3>
          {debugInfo.map((log, index) => (
            <div key={index} className="text-xs font-mono mb-1">
              {log}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 mt-5">
          <button className="btn btn-primary" onClick={handleBack}>
            戻る
          </button>

          {/* 前回の問題データがある場合はリスニングページへ遷移するボタンを表示 */}
          {localStorage.getItem("generatedQuestion") && (
            <button
              className="btn bg-green-600 hover:bg-green-700 text-white"
              onClick={handleManualNavigation}
            >
              前回の問題を使って聞き取りを開始する
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">問題を生成中</h1>
        <p className="text-gray-600 text-lg">{currentStage.description}</p>
      </div>

      {/* 段階的な進捗表示 */}
      <div className="relative pt-1 mb-4">
        <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-purple-100">
          <div
            style={{ width: `${progress}%`, transition: "width 0.7s ease" }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
          />
        </div>
        <div className="text-center text-primary font-bold text-xl">
          {Math.round(progress)}%
        </div>

        {/* 進捗段階のタイムライン表示 */}
        <div className="mt-6 pb-2 relative">
          <div className="absolute top-3 left-0 right-0 h-1 bg-gray-200 z-0"></div>
          <div className="flex justify-between relative z-10">
            {PROGRESS_STAGES.map((stage, index) => (
              <div key={index} className="text-center">
                <div
                  className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center
                    ${
                      progress >= stage.percentage
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                >
                  {progress >= stage.percentage && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div
                  className="hidden sm:block text-xs font-medium"
                  style={{
                    minWidth: "50px",
                    marginLeft: "-20px",
                    marginRight: "-20px",
                  }}
                >
                  {stage.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AIアニメーション */}
      <div className="flex justify-center mt-8">
        <div className="relative w-32 h-32">
          {/* 外側のリング */}
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-purple-100"></div>

          {/* 回転するリング */}
          <div
            className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-primary"
            style={{
              borderRightColor: "transparent",
              borderBottomColor: "transparent",
              animation: "spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          ></div>

          {/* 内側のパルス */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-purple-500 rounded-full opacity-20"
            style={{
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          ></div>

          {/* 中央のアイコン */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 文章生成アニメーション */}
      <div className="text-center mt-8">
        <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg text-gray-700 max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>

      {/* 100%になった場合に手動で次へ進むボタンを表示 */}
      {progress === 100 && (
        <div className="text-center mt-8 animate-pulse">
          <div className="mb-4 text-green-600 font-bold text-2xl">
            問題の生成が完了しました！
          </div>
          <button
            className="btn btn-primary py-3 px-8 rounded-full text-white font-bold text-lg transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-r from-purple-500 to-indigo-600 animate-bounce"
            onClick={handleManualNavigation}
          >
            聞き取り問題を開始する →
          </button>
          <p className="text-sm text-gray-500 mt-2">
            自動的に遷移しない場合は上のボタンをクリックしてください
          </p>
        </div>
      )}

      {/* アニメーションのキーフレーム */}
      <style>
        {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }
        @keyframes typing {
          0% { width: 0; }
          100% { width: 100%; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }
        `}
      </style>
    </div>
  );
};

export default GeneratingPage;
