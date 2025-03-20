import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Howl, HowlErrorCallback } from "howler";
import axios from "axios";
import { io } from "socket.io-client";

interface Question {
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
}

interface AudioData {
  text: string;
  questions: Question[];
  audioUrl?: string;
}

interface ListeningPageProps {
  audioData?: AudioData;
}

// テキスト読み上げによるオーディオ生成
const generateSpeech = (audioUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!audioUrl) {
      console.error("オーディオURLが見つかりません");
      reject(
        new Error(
          "音声ファイルが提供されていません。問題を再生成してください。"
        )
      );
      return;
    }

    // URLを適切に処理（ホストが既に含まれているか確認）
    let fullAudioUrl = audioUrl;

    // 開発環境での絶対パス構築
    if (audioUrl.startsWith("/audio/")) {
      fullAudioUrl = `http://localhost:3000${audioUrl}`;
    }

    // sample.mp3を使用しないように確認
    if (fullAudioUrl.includes("sample.mp3")) {
      console.error("サンプル音声ファイルは使用できません");
      reject(
        new Error(
          "サンプル音声は使用できません。生成された音声ファイルのみ使用可能です。"
        )
      );
      return;
    }

    console.log("音声URL:", fullAudioUrl);
    resolve(fullAudioUrl);
  });
};

const ListeningPage: React.FC<ListeningPageProps> = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [loadingState, setLoadingState] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [duration, setDuration] = useState(0);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const howlRef = useRef<Howl | null>(null);
  const requestRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ローカルストレージから問題データを読み込む
  useEffect(() => {
    try {
      const questionData = localStorage.getItem("generatedQuestion");

      if (questionData) {
        const parsedData = JSON.parse(questionData);
        console.log(
          "ローカルストレージから問題データを読み込みました:",
          parsedData
        );

        // audioUrlの有無を明示的に確認してログ出力
        if (parsedData.audioUrl) {
          console.log("音声URLが見つかりました:", parsedData.audioUrl);

          // sample.mp3を使用しないように確認
          if (parsedData.audioUrl.includes("sample.mp3")) {
            console.error("サンプル音声ファイルは使用できません");
            setError(
              "サンプル音声は使用できません。新しい問題を生成してください。"
            );
            fetchLatestQuestion(); // 問題を再生成
            return;
          }

          // 有効な問題データかチェック
          if (
            !parsedData.text ||
            !Array.isArray(parsedData.questions) ||
            parsedData.questions.length === 0
          ) {
            console.error("無効な問題データです。問題を再生成します。");
            setError("問題データが不完全です。問題を再生成します。");
            fetchLatestQuestion(); // 問題を再生成
            return;
          }

          setAudioData(parsedData);

          // 問題の数に応じて選択肢の配列を初期化
          if (parsedData.questions && Array.isArray(parsedData.questions)) {
            setSelectedAnswers(new Array(parsedData.questions.length).fill(-1));
          }
        } else {
          console.log("音声URLが見つかりません。問題を再生成します。");
          // 音声URLがない場合は問題を再取得
          fetchLatestQuestion();
        }
      } else {
        // サーバーから直接問題データを取得する試み
        console.log("問題データが存在しません。サーバーから問題を取得します。");
        fetchLatestQuestion();
      }
    } catch (e) {
      setError("問題データの読み込みに失敗しました。問題を再生成します。");
      console.error("問題データの解析エラー:", e);
      fetchLatestQuestion(); // 問題を再生成
    }
  }, []);

  // サーバーから最新の問題を取得する関数
  const fetchLatestQuestion = async () => {
    try {
      setLoadingState("loading");
      setStatus("サーバーから問題データを取得中...");
      setError(null); // エラーをクリア

      // 最後に選択されたレベル、目標、トピックを取得
      const level = localStorage.getItem("selectedLevel") || "beginner";
      const goal = localStorage.getItem("selectedGoal") || "academic";
      const topic =
        localStorage.getItem("selectedTopic") || "academic-research";

      console.log("サーバーから問題データを取得します:", {
        level,
        goal,
        topic,
      });

      setStatus(
        `レベル「${level}」、目的「${goal}」、トピック「${topic}」で問題を取得中...`
      );

      // ローカルストレージから既存の音声URLを取得
      let existingAudioUrl = null;
      let existingText = null;
      try {
        const storedData = localStorage.getItem("generatedQuestion");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData && parsedData.audioUrl) {
            existingAudioUrl = parsedData.audioUrl;
            console.log("既存の音声URLをサーバーに送信:", existingAudioUrl);
          }
          if (parsedData && parsedData.text) {
            existingText = parsedData.text;
            console.log("既存の問題テキストをサーバーに送信:", existingText);
          }
        }
      } catch (e) {
        console.error("ローカルストレージからの音声URL取得エラー:", e);
      }

      const response = await axios.post(
        "http://localhost:3000/api/questions/generate",
        {
          level,
          goal,
          topic,
          skipAudioGeneration: false, // 常に新しい音声を生成する
          existingAudioUrl: existingAudioUrl, // 不要だが後方互換性のため残しておく
          existingText: existingText, // 不要だが後方互換性のため残しておく
        }
      );

      if (
        response.data &&
        response.data.text &&
        Array.isArray(response.data.questions)
      ) {
        // 音声URLがあるか確認
        if (!response.data.audioUrl) {
          throw new Error(
            "音声ファイルが見つかりません。問題を再生成してください。"
          );
        }

        setAudioData(response.data);
        localStorage.setItem(
          "generatedQuestion",
          JSON.stringify(response.data)
        );
        setSelectedAnswers(new Array(response.data.questions.length).fill(-1));
        setError(null);
        console.log("サーバーから問題データを取得しました:", response.data);
      } else {
        throw new Error("サーバーから有効な問題データを取得できませんでした");
      }
    } catch (error) {
      console.error("問題データの取得に失敗しました:", error);
      setError(
        "問題データの取得に失敗しました。問題生成ページからやり直してください。"
      );
    } finally {
      setStatus("");
    }
  };

  // Howlインスタンスの作成
  useEffect(() => {
    if (!audioData || !audioData.audioUrl) return;

    setLoadingState("loading");
    generateSpeech(audioData.audioUrl)
      .then((audioUrl) => {
        try {
          console.log("音声ファイルURL:", audioUrl);

          // ファイルの存在が確認できたらHowlインスタンスを生成
          const sound = new Howl({
            src: [audioUrl],
            html5: true,
            format: ["mp3"],
            preload: true,
            xhr: {
              method: "GET",
              headers: {
                "Content-Type": "audio/mpeg",
              },
              withCredentials: false,
            },
            onload: () => {
              console.log("音声ファイルの読み込みが完了しました");
              setLoadingState("success");
              setDuration(sound.duration());
              howlRef.current = sound;
            },
            onend: () => {
              console.log("音声再生が終了しました");
              setIsPlaying(false); // 再生状態をリセット
              setShowQuestions(true);

              // 音声終了後、問題表示を視覚的に目立たせる
              // スクロールアニメーションを追加して問題部分に注目させる
              setTimeout(() => {
                const questionsElement =
                  document.getElementById("questions-section");
                if (questionsElement) {
                  questionsElement.scrollIntoView({ behavior: "smooth" });
                }
              }, 500);
            },
            onloaderror: ((id, error) => {
              console.error("音声ファイルの読み込みエラー:", error);
              setLoadingState("error");
              // フォールバック: 音声なしで問題を表示
              setShowQuestions(true);
            }) as HowlErrorCallback,
            onplayerror: ((id, error) => {
              console.error("音声再生エラー:", error);
              // 音声の再生に失敗した場合でも問題を表示
              setShowQuestions(true);
              // モバイルデバイスでの自動再生制限に対処するためのアンロック試行
              sound.once("unlock", () => {
                sound.play();
              });
            }) as HowlErrorCallback,
          });
        } catch (error) {
          console.error("Howlインスタンス作成エラー:", error);
          setLoadingState("error");
          // エラー時にも問題を表示
          setShowQuestions(true);
        }
      })
      .catch((error) => {
        console.error("音声生成エラー:", error);
        setLoadingState("error");
        // エラー時にも問題を表示
        setShowQuestions(true);

        // サーバーから取得した問題データが存在する場合、テキストのみで表示
        if (audioData && audioData.text) {
          console.log("音声は再生できませんが、テキストで問題を表示します");
        } else {
          setError("音声ファイルを読み込めないため、問題を表示できません。");
        }
      });

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (howlRef.current) {
        howlRef.current.unload();
      }
    };
  }, [audioData]);

  // 再生時間を更新するアニメーションフレーム
  const updatePlaybackState = () => {
    if (howlRef.current && isPlaying) {
      setCurrentTime(howlRef.current.seek() as number);
      requestRef.current = requestAnimationFrame(updatePlaybackState);
    }
  };

  // 再生状態が変更されたら更新
  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updatePlaybackState);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, [isPlaying]);

  // 再生の開始のみ、一度だけ許可する
  const startAudio = () => {
    if (!howlRef.current || isPlaying) return; // 既に再生中の場合は何もしない

    // 一度しか再生できないことを明確にするために、ボタンを無効化
    howlRef.current.play();
    setIsPlaying(true);
  };

  // 時間のフォーマット
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // 回答の選択
  const handleAnswerSelect = (questionIndex: number, choiceIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = choiceIndex;
    setSelectedAnswers(newAnswers);
  };

  // 次の問題へ進む
  const goToNextQuestion = () => {
    if (
      audioData &&
      audioData.questions &&
      currentQuestion < audioData.questions.length - 1
    ) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // 前の問題へ戻る
  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // 回答の提出
  const handleSubmit = () => {
    // すべての問題に回答したかチェック
    const allAnswered = selectedAnswers.every((answer) => answer !== -1);

    if (!allAnswered) {
      alert("すべての問題に回答してください。");
      return;
    }

    // 採点情報を保存
    if (audioData && audioData.questions) {
      const score = selectedAnswers.reduce(
        (total, answer, index) =>
          total + (answer === audioData.questions[index].correctAnswer ? 1 : 0),
        0
      );

      const scorePercent = Math.round(
        (score / audioData.questions.length) * 100
      );

      localStorage.setItem("score", scorePercent.toString());
      localStorage.setItem("correctCount", score.toString());
      localStorage.setItem("totalCount", audioData.questions.length.toString());
      localStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers));

      // 結果表示フラグを設定して結果を表示
      setShowResults(true);

      // 直接結果ページへ遷移
      navigate("/result");
    }
  };

  // 完了して結果ページへ（現在は使用されていないが、念のため残しておく）
  const handleFinish = () => {
    // すでに採点情報は保存されているため、遷移のみ行う
    navigate("/result");
  };

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 text-center">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
          <p>{error}</p>
        </div>
        <div className="space-y-4">
          <button className="btn btn-primary" onClick={fetchLatestQuestion}>
            問題を再取得する
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/generating")}
          >
            問題生成画面に戻る
          </button>
          <button className="btn" onClick={() => navigate("/")}>
            トップページに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          リスニング問題
        </h1>
        <p className="text-gray-600">音声を聴いて、問題に答えてください。</p>
      </div>

      {loadingState === "loading" && (
        <div className="text-center py-16">
          <div className="spinner"></div>
          <p className="mt-6 text-gray-700 font-medium">
            音声ファイルを読み込み中...
          </p>
        </div>
      )}

      {loadingState === "error" && (
        <div className="text-center py-10">
          <div className="p-6 bg-red-50 rounded-xl shadow-sm text-red-600 mb-6">
            <p className="font-medium">
              音声の読み込みに失敗しました。テキストで問題に挑戦してください。
            </p>
          </div>
          <button
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            onClick={() => window.location.reload()}
          >
            再試行
          </button>

          {/* 音声なしでもテキストを表示 */}
          {audioData && audioData.text && (
            <div className="mt-8 p-6 bg-white shadow-md rounded-xl text-gray-800 text-left">
              <h3 className="font-bold mb-3 text-lg text-indigo-700">
                テキスト:
              </h3>
              <p className="leading-relaxed">{audioData.text}</p>
            </div>
          )}
        </div>
      )}

      {loadingState === "success" && (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all">
          {/* オーディオプレーヤー */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-8 border-b">
            <div className="flex flex-col items-center mb-6">
              <div className="mb-4 text-center">
                <div className="mb-3">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-yellow-300 shadow-sm">
                    ⚠️ 音声は1回のみ再生されます
                  </span>
                </div>
                <p className="text-gray-700 mb-2">
                  {showQuestions
                    ? "音声の再生が完了しました。以下の問題に回答してください。"
                    : "以下のボタンを押して音声を再生してください。集中して聴いてください。"}
                </p>
                {!showQuestions && (
                  <p className="text-sm text-indigo-600 font-semibold mb-4">
                    音声が終了すると問題が自動的に表示されます
                  </p>
                )}
              </div>
              <button
                className={`p-5 rounded-full ${
                  isPlaying || showQuestions
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                }`}
                onClick={startAudio}
                disabled={isPlaying || showQuestions}
              >
                <span className="material-icons text-2xl">
                  {isPlaying
                    ? "volume_up"
                    : showQuestions
                    ? "check_circle"
                    : "play_arrow"}
                </span>
              </button>
              {isPlaying && !showQuestions && (
                <p className="mt-4 text-indigo-600 animate-pulse">
                  <span
                    className="material-icons align-middle mr-1"
                    style={{ fontSize: "18px" }}
                  >
                    hearing
                  </span>
                  音声再生中...聴いてください
                </p>
              )}
              {showQuestions && (
                <p className="mt-4 text-green-600">
                  <span
                    className="material-icons align-middle mr-1"
                    style={{ fontSize: "18px" }}
                  >
                    check_circle
                  </span>
                  音声再生完了！下にスクロールして問題に回答してください
                </p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm font-mono text-indigo-700 font-semibold">
                {formatTime(currentTime)}
              </span>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-mono text-indigo-700 font-semibold">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* 問題セクション - 音声再生後のみ表示 */}
          {audioData && audioData.questions && showQuestions && (
            <div
              id="questions-section"
              className="p-8 transition-all duration-500 animate-fade-in"
            >
              {/* 進捗表示 */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <span className="material-icons text-indigo-600 mr-2">
                      help_outline
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      問題 {currentQuestion + 1} / {audioData.questions.length}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-indigo-600">
                    進捗:{" "}
                    {Math.round(
                      ((currentQuestion + 1) / audioData.questions.length) * 100
                    )}
                    %
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-green-400 to-teal-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        ((currentQuestion + 1) / audioData.questions.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* 現在の質問 */}
              <div className="bg-white rounded-xl p-6 shadow-inner border border-gray-100">
                <div className="mb-8">
                  <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-sm font-semibold mb-4">
                    問題 {currentQuestion + 1}
                  </div>
                  <p className="text-lg font-medium mb-6 text-gray-800 leading-relaxed">
                    {audioData.questions[currentQuestion].question}
                  </p>
                  <div className="space-y-4">
                    {audioData.questions[currentQuestion].choices.map(
                      (choice, cIndex) => (
                        <label
                          key={cIndex}
                          className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
                            selectedAnswers[currentQuestion] === cIndex
                              ? "bg-indigo-50 border-indigo-300 shadow"
                              : "hover:bg-gray-50 border-gray-200"
                          }`}
                          onClick={() =>
                            handleAnswerSelect(currentQuestion, cIndex)
                          }
                        >
                          <div
                            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 ${
                              selectedAnswers[currentQuestion] === cIndex
                                ? "border-indigo-500 bg-indigo-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedAnswers[currentQuestion] === cIndex && (
                              <span
                                className="material-icons text-white"
                                style={{ fontSize: "14px" }}
                              >
                                check
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + cIndex)}.
                            </span>
                            <span className="text-gray-700">{choice}</span>
                          </div>
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* ナビゲーションボタン */}
                <div className="flex justify-between mt-8">
                  <button
                    className={`px-5 py-2.5 rounded-lg flex items-center transition-all ${
                      currentQuestion === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-indigo-500 text-indigo-700 hover:bg-indigo-50"
                    }`}
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestion === 0}
                  >
                    <span
                      className="material-icons mr-1"
                      style={{ fontSize: "18px" }}
                    >
                      arrow_back
                    </span>
                    前の問題
                  </button>

                  {currentQuestion < audioData.questions.length - 1 ? (
                    <button
                      className={`px-5 py-2.5 rounded-lg flex items-center transition-all ${
                        selectedAnswers[currentQuestion] === -1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg"
                      }`}
                      onClick={goToNextQuestion}
                      disabled={selectedAnswers[currentQuestion] === -1}
                    >
                      次の問題
                      <span
                        className="material-icons ml-1"
                        style={{ fontSize: "18px" }}
                      >
                        arrow_forward
                      </span>
                    </button>
                  ) : (
                    <button
                      className={`px-5 py-2.5 rounded-lg flex items-center transition-all ${
                        selectedAnswers.some((answer) => answer === -1)
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg"
                      }`}
                      onClick={handleSubmit}
                      disabled={selectedAnswers.some((answer) => answer === -1)}
                    >
                      回答を送信
                      <span
                        className="material-icons ml-1"
                        style={{ fontSize: "18px" }}
                      >
                        check_circle
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>
        {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          width: 60px;
          height: 60px;
          border: 5px solid rgba(107, 70, 193, 0.2);
          border-radius: 50%;
          border-left-color: #6b46c1;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 5px;
          background: transparent;
          outline: none;
          position: absolute;
          z-index: 1; /* z-indexを下げて操作できないようにする */
          pointer-events: none; /* ユーザー操作を無効化 */
          opacity: 0;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #6b46c1;
          cursor: pointer;
          border: none;
        }
        `}
      </style>
    </div>
  );
};

export default ListeningPage;
