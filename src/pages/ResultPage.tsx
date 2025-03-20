import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Howl } from "howler";
import axios from "axios";

// 型定義
interface Question {
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
}

interface AudioData {
  text: string;
  textJa?: string;
  questions: Question[];
  audioUrl?: string;
}

const ResultPage = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const howlRef = useRef<Howl | null>(null);
  const requestRef = useRef<number | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  // レベルとトピックの情報を状態として追加
  const [levelInfo, setLevelInfo] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [topicInfo, setTopicInfo] = useState<{
    label: string;
    id: string;
  } | null>(null);

  // ローカルストレージからデータを取得
  useEffect(() => {
    const storedScore = localStorage.getItem("score");
    const storedCorrectCount = localStorage.getItem("correctCount");
    const storedTotalCount = localStorage.getItem("totalCount");
    const storedSelectedAnswers = localStorage.getItem("selectedAnswers");
    const questionData = localStorage.getItem("generatedQuestion");

    // レベル情報を取得
    const level = localStorage.getItem("selectedLevel");
    const levelLabel = localStorage.getItem("selectedLevelLabel");
    // トピック情報を取得
    const topicId = localStorage.getItem("selectedTopic");
    const topicLabel = localStorage.getItem("selectedTopicLabel");

    // レベル情報をセット
    if (level && levelLabel) {
      setLevelInfo({ label: levelLabel, value: level });
    } else if (level) {
      const calculatedLabel = getLevelLabel(level);
      setLevelInfo({ label: calculatedLabel, value: level });
    }

    // トピック情報をセット
    if (topicId && topicLabel) {
      setTopicInfo({ label: topicLabel, id: topicId });
    }

    if (storedScore) {
      setScore(parseInt(storedScore));
    }

    if (storedCorrectCount) {
      setCorrectCount(parseInt(storedCorrectCount));
    }

    if (storedTotalCount) {
      setTotalCount(parseInt(storedTotalCount));
    }

    if (storedSelectedAnswers) {
      setSelectedAnswers(JSON.parse(storedSelectedAnswers));
    }

    if (questionData) {
      try {
        const parsedData = JSON.parse(questionData);
        setAudioData(parsedData);
        setupAudio(parsedData.audioUrl);

        // 日本語訳がない場合は生成する
        if (parsedData.text && !parsedData.textJa) {
          generateTranslation(parsedData.text);
        }
      } catch (e) {
        console.error("問題データの解析エラー:", e);
      }
    }
  }, []);

  // レベルのラベルを取得する関数
  const getLevelLabel = (levelValue: string): string => {
    switch (levelValue) {
      case "beginner":
        return "初級";
      case "intermediate":
        return "中級";
      case "advanced":
        return "上級";
      case "professional":
        return "プロフェッショナル";
      default:
        return "不明";
    }
  };

  // 音声プレーヤーのセットアップ
  const setupAudio = (audioUrl?: string) => {
    if (!audioUrl) return;

    // URLを適切に処理（ホストが既に含まれているか確認）
    let fullAudioUrl = audioUrl;

    // 開発環境での絶対パス構築
    if (audioUrl.startsWith("/audio/")) {
      fullAudioUrl = `${window.location.protocol}//${window.location.hostname}:3000${audioUrl}`;
    }

    // Howlインスタンスの作成
    const howl = new Howl({
      src: [fullAudioUrl],
      html5: true,
      onload: () => {
        setDuration(howl.duration());
      },
      onplay: () => {
        setIsPlaying(true);
        updatePlaybackState();
      },
      onpause: () => {
        setIsPlaying(false);
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = null;
        }
      },
      onstop: () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = null;
        }
      },
      onend: () => {
        setIsPlaying(false);
        setCurrentTime(howl.duration());
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = null;
        }
      },
    });

    howlRef.current = howl;
  };

  // 再生状態の更新
  const updatePlaybackState = () => {
    if (howlRef.current) {
      setCurrentTime(howlRef.current.seek());
      requestRef.current = requestAnimationFrame(updatePlaybackState);
    }
  };

  // 再生/一時停止の切り替え
  const togglePlay = () => {
    if (howlRef.current) {
      if (isPlaying) {
        howlRef.current.pause();
      } else {
        howlRef.current.play();
      }
    }
  };

  // 時間フォーマット
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // 10秒戻る
  const skipBackward = () => {
    if (howlRef.current) {
      const newTime = Math.max(0, howlRef.current.seek() - 10);
      howlRef.current.seek(newTime);
      setCurrentTime(newTime);
    }
  };

  // 10秒進む
  const skipForward = () => {
    if (howlRef.current) {
      const newTime = Math.min(
        howlRef.current.duration(),
        howlRef.current.seek() + 10
      );
      howlRef.current.seek(newTime);
      setCurrentTime(newTime);
    }
  };

  // シークバーの操作
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (howlRef.current) {
      howlRef.current.seek(newTime);
      setCurrentTime(newTime);
    }
  };

  const handleRetry = () => {
    navigate("/listening");
  };

  const handleHome = () => {
    navigate("/");
  };

  // 日本語訳を生成する関数
  const generateTranslation = async (text: string) => {
    try {
      setIsTranslating(true);
      const response = await axios.post(
        `${window.location.protocol}//${window.location.hostname}:3000/api/transcript/translate`,
        {
          text,
        }
      );

      if (response.data && response.data.translation) {
        // ローカルストレージから現在のデータを取得して更新
        const questionData = localStorage.getItem("generatedQuestion");
        if (questionData) {
          const parsedData = JSON.parse(questionData);
          parsedData.textJa = response.data.translation;

          // 更新したデータをセットしてローカルストレージに保存
          setAudioData(parsedData);
          localStorage.setItem("generatedQuestion", JSON.stringify(parsedData));
        }
      }
    } catch (error) {
      console.error("翻訳の生成に失敗しました:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-center text-2xl font-bold mb-8">結果</h1>

      {/* レベルとトピックの情報表示 */}
      {(levelInfo || topicInfo) && (
        <div className="bg-white rounded-lg p-4 shadow-md mb-6">
          <div className="flex flex-wrap gap-2">
            {levelInfo && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span className="material-icons text-blue-800 mr-1 text-sm">
                  signal_cellular_alt
                </span>
                {levelInfo.label}
              </div>
            )}
            {topicInfo && (
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span className="material-icons text-purple-800 mr-1 text-sm">
                  label
                </span>
                {topicInfo.label}
              </div>
            )}
          </div>
        </div>
      )}

      {/* スコア表示 */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-6 text-center">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full border-8 border-primary flex items-center justify-center">
            <span className="text-4xl font-bold">{score}</span>
          </div>
          <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center">
            <span className="text-lg font-bold">%</span>
          </div>
        </div>
        <p className="mt-4 text-gray-600">
          {correctCount} / {totalCount} 問正解
        </p>
      </div>

      {/* 全体のテキスト */}
      {audioData && audioData.text && (
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="font-bold text-lg mb-3">リスニングテキスト</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 whitespace-pre-line">
                {audioData.text}
              </p>
            </div>
            {audioData.textJa ? (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-bold text-sm mb-2 text-yellow-800">
                  日本語訳:
                </h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {audioData.textJa}
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-bold text-sm mb-2 text-yellow-800">
                  日本語訳:
                </h3>
                {isTranslating ? (
                  <div className="text-center py-4">
                    <div className="spinner inline-block"></div>
                    <p className="mt-2 text-gray-600">翻訳生成中...</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">翻訳を読み込み中...</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 音声プレーヤー */}
      {audioData && audioData.audioUrl && (
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="font-bold text-lg mb-3">音声</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <button
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
                onClick={skipBackward}
              >
                <span className="material-icons text-gray-700">replay_10</span>
              </button>
              <button
                className="p-3 rounded-full bg-primary text-white shadow hover:bg-primary-dark transition-all transform hover:scale-105"
                onClick={togglePlay}
              >
                <span className="material-icons text-xl">
                  {isPlaying ? "pause" : "play_arrow"}
                </span>
              </button>
              <button
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
                onClick={skipForward}
              >
                <span className="material-icons text-gray-700">forward_10</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm font-mono text-gray-700 font-semibold">
                {formatTime(currentTime)}
              </span>
              <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  step="0.1"
                  className="w-full appearance-none"
                  onChange={handleSeek}
                />
              </div>
              <span className="text-sm font-mono text-gray-700 font-semibold">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 問題と解説 */}
      {audioData && audioData.questions && (
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="font-bold text-lg mb-3">問題と解説</h2>
          <div className="space-y-8">
            {audioData.questions.map((question, index) => {
              const _isCorrect =
                selectedAnswers[index] === question.correctAnswer;
              return (
                <div
                  key={index}
                  className="border-b pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="bg-indigo-50 p-4 rounded-lg mb-4 border-l-4 border-indigo-500">
                    <p className="font-semibold text-indigo-800">
                      問題 {index + 1}: {question.question}
                    </p>
                  </div>
                  <div className="mb-4 space-y-2">
                    {question.choices.map((choice, choiceIndex) => {
                      const isUserSelection =
                        selectedAnswers[index] === choiceIndex;
                      const isCorrectAnswer =
                        question.correctAnswer === choiceIndex;
                      let bgColorClass = "bg-gray-100";
                      let borderClass = "";
                      let statusIcon = null;

                      if (isUserSelection && isCorrectAnswer) {
                        // 自分の選択が正解
                        bgColorClass = "bg-green-100";
                        borderClass = "border border-green-400";
                        statusIcon = (
                          <span className="material-icons ml-2 text-sm inline-block align-middle text-green-600">
                            check_circle
                          </span>
                        );
                      } else if (isUserSelection && !isCorrectAnswer) {
                        // 自分の選択が不正解
                        bgColorClass = "bg-red-100";
                        borderClass = "border border-red-400";
                        statusIcon = (
                          <span className="material-icons ml-2 text-sm inline-block align-middle text-red-600">
                            cancel
                          </span>
                        );
                      } else if (isCorrectAnswer) {
                        // 正解だが選択していない
                        bgColorClass = "bg-green-100";
                        borderClass = "border border-green-400";
                        statusIcon = (
                          <span className="material-icons ml-2 text-sm inline-block align-middle text-green-600">
                            check_circle
                          </span>
                        );
                      }

                      return (
                        <div
                          key={choiceIndex}
                          className={`p-3 rounded-lg ${bgColorClass} ${borderClass} flex justify-between items-center`}
                        >
                          <div className="flex items-center">
                            <span className="mr-3 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-300 text-gray-700 font-medium">
                              {String.fromCharCode(65 + choiceIndex)}
                            </span>
                            <span>{choice}</span>
                          </div>
                          <div className="flex items-center">
                            {isUserSelection && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                                あなたの回答
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                正解
                              </span>
                            )}
                            {statusIcon}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <p className="font-semibold text-sm text-yellow-800 mb-2">
                      解説:
                    </p>
                    <p className="text-gray-700">{question.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ボタン */}
      <div className="flex space-x-4">
        <button className="flex-1 btn btn-secondary" onClick={handleHome}>
          ホームへ
        </button>
        <button className="flex-1 btn btn-primary" onClick={handleRetry}>
          もう一度
        </button>
      </div>

      <style>
        {`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #667eea;
          margin: 0 auto;
          animation: spin 1s ease infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        `}
      </style>
    </div>
  );
};

export default ResultPage;
