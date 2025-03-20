import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// トピック定義（バックアップ用）
const FALLBACK_TOPICS: Record<
  string,
  Array<{ id: string; label: string; difficulty: number }>
> = {
  daily: [
    { id: "daily-greetings", label: "挨拶と自己紹介", difficulty: 1 },
    { id: "daily-shopping", label: "ショッピング", difficulty: 2 },
    { id: "daily-restaurant", label: "レストランでの会話", difficulty: 2 },
    { id: "daily-directions", label: "道案内", difficulty: 3 },
    { id: "daily-weather", label: "天気の話", difficulty: 2 },
  ],
  travel: [
    { id: "travel-airport", label: "空港での会話", difficulty: 2 },
    { id: "travel-hotel", label: "ホテルでの会話", difficulty: 2 },
    { id: "travel-transportation", label: "交通機関の利用", difficulty: 3 },
    { id: "travel-sightseeing", label: "観光地での会話", difficulty: 3 },
    { id: "travel-emergency", label: "緊急時の会話", difficulty: 4 },
  ],
  business: [
    { id: "business-meeting", label: "会議", difficulty: 4 },
    { id: "business-presentation", label: "プレゼンテーション", difficulty: 4 },
    { id: "business-negotiation", label: "交渉", difficulty: 5 },
    { id: "business-email", label: "ビジネスメール", difficulty: 3 },
    {
      id: "business-smalltalk",
      label: "雑談とネットワーキング",
      difficulty: 3,
    },
  ],
  academic: [
    { id: "academic-lecture", label: "講義", difficulty: 4 },
    { id: "academic-discussion", label: "ディスカッション", difficulty: 4 },
    { id: "academic-presentation", label: "発表", difficulty: 4 },
    { id: "academic-research", label: "研究と文献", difficulty: 5 },
    { id: "academic-exam", label: "試験対策", difficulty: 4 },
  ],
  entertainment: [
    { id: "entertainment-movies", label: "映画", difficulty: 3 },
    { id: "entertainment-music", label: "音楽と歌詞", difficulty: 3 },
    { id: "entertainment-tv", label: "テレビ番組", difficulty: 3 },
    { id: "entertainment-news", label: "ニュース", difficulty: 4 },
    { id: "entertainment-podcasts", label: "ポッドキャスト", difficulty: 4 },
  ],
};

// カテゴリごとのトピック生成素材
const TOPIC_PATTERNS = {
  daily: {
    contexts: [
      "コンビニでの",
      "カフェでの",
      "ジムでの",
      "パーティーでの",
      "電話での",
      "銀行での",
      "郵便局での",
      "学校での",
      "職場での",
      "病院での",
      "薬局での",
      "美容院での",
      "公園での",
      "図書館での",
      "ペットショップでの",
    ],
    actions: [
      "会話",
      "質問",
      "依頼",
      "説明",
      "相談",
      "予約",
      "注文",
      "挨拶",
      "謝罪",
      "案内",
      "交渉",
      "紹介",
      "問い合わせ",
      "お願い",
      "相談",
    ],
    difficulty: [1, 2, 3],
  },
  travel: {
    contexts: [
      "空港での",
      "ホテルでの",
      "レストランでの",
      "観光地での",
      "駅での",
      "タクシーでの",
      "バスでの",
      "レンタカーでの",
      "免税店での",
      "博物館での",
      "美術館での",
      "ビーチでの",
      "山での",
      "国立公園での",
      "リゾートでの",
    ],
    actions: [
      "チェックイン",
      "案内依頼",
      "予約",
      "トラブル対応",
      "支払い",
      "道案内",
      "注文",
      "交渉",
      "質問",
      "予約変更",
      "キャンセル",
      "探索",
    ],
    difficulty: [2, 3, 4],
  },
  business: {
    contexts: [
      "会議での",
      "プレゼンでの",
      "商談での",
      "面接での",
      "電話会議での",
      "Zoomでの",
      "オフィスでの",
      "接待での",
      "展示会での",
      "セミナーでの",
    ],
    actions: [
      "プレゼン",
      "交渉",
      "質疑応答",
      "報告",
      "討論",
      "提案",
      "説明",
      "依頼",
      "指示",
      "連絡",
      "フィードバック",
      "意見交換",
    ],
    difficulty: [3, 4, 5],
  },
  academic: {
    contexts: [
      "大学での",
      "研究室での",
      "図書館での",
      "学会での",
      "講義での",
      "ゼミでの",
      "実験室での",
      "プレゼンでの",
      "グループワークでの",
    ],
    actions: [
      "質問",
      "討論",
      "発表",
      "研究相談",
      "指導",
      "説明",
      "レポート相談",
      "文献調査",
      "理論説明",
      "実験手順",
      "データ分析",
    ],
    difficulty: [3, 4, 5],
  },
  entertainment: {
    contexts: [
      "映画館での",
      "コンサートでの",
      "ラジオでの",
      "ポッドキャストでの",
      "SNSでの",
      "テレビ番組での",
      "ゲームでの",
      "スポーツ観戦での",
      "カラオケでの",
      "趣味の集まりでの",
    ],
    actions: [
      "感想共有",
      "レビュー",
      "推薦",
      "インタビュー",
      "討論",
      "歌詞解説",
      "ゲーム解説",
      "実況",
      "ファン交流",
      "批評",
    ],
    difficulty: [2, 3, 4],
  },
};

// 過去に生成したトピックのラベルを取得する
const getPreviousTopicLabels = (): Set<string> => {
  try {
    const storedLabels = localStorage.getItem("previousTopicLabels");
    if (storedLabels) {
      return new Set<string>(JSON.parse(storedLabels));
    }
  } catch (error) {
    console.error("過去のトピックラベル取得エラー:", error);
  }
  return new Set<string>();
};

// 過去に生成したトピックのラベルを保存する
const savePreviousTopicLabels = (labels: Set<string>): void => {
  try {
    // 最大100個のトピックを記憶（古いものから消えていく）
    const labelsArray = Array.from(labels);
    if (labelsArray.length > 100) {
      labelsArray.splice(0, labelsArray.length - 100);
    }
    localStorage.setItem("previousTopicLabels", JSON.stringify(labelsArray));
  } catch (error) {
    console.error("過去のトピックラベル保存エラー:", error);
  }
};

// ランダムなトピックを生成する関数（重複回避機能付き）
const generateRandomTopics = (
  category: string,
  count: number = 5
): Array<{ id: string; label: string; difficulty: number }> => {
  const patterns = TOPIC_PATTERNS[category as keyof typeof TOPIC_PATTERNS];

  if (!patterns) {
    return FALLBACK_TOPICS[category] || FALLBACK_TOPICS.daily;
  }

  const result = [];

  // 過去に生成したトピックのラベルを取得
  const previousTopicLabels = getPreviousTopicLabels();

  // このセッションで新しく生成したラベルを記録
  const newGeneratedLabels = new Set<string>();

  // 使用済みの組み合わせを追跡する
  const usedCombinations = new Set<string>();

  for (let i = 0; i < count; i++) {
    let context, action, difficultyLevel;
    let combinationKey;
    let topicLabel;
    let attempts = 0;
    const maxAttempts = 50; // 無限ループ防止、重複回避のために多めに

    // 重複しない組み合わせを探す
    do {
      context =
        patterns.contexts[Math.floor(Math.random() * patterns.contexts.length)];
      action =
        patterns.actions[Math.floor(Math.random() * patterns.actions.length)];
      difficultyLevel =
        patterns.difficulty[
          Math.floor(Math.random() * patterns.difficulty.length)
        ];
      combinationKey = `${context}${action}`;
      topicLabel = `${context}${action}`;
      attempts++;

      // 最大試行回数を超えたら重複チェックを緩和
      if (attempts > 30) {
        break;
      }
    } while (
      (usedCombinations.has(combinationKey) ||
        previousTopicLabels.has(topicLabel)) &&
      attempts < maxAttempts
    );

    // 組み合わせを記録
    usedCombinations.add(combinationKey);
    newGeneratedLabels.add(topicLabel);

    const topicId = `${category}-generated-${i + 1}-${Date.now() % 10000}`;

    result.push({
      id: topicId,
      label: topicLabel,
      difficulty: difficultyLevel,
    });
  }

  // 過去のトピックラベルと新しく生成したラベルを合わせて保存
  const allLabels = new Set([...previousTopicLabels, ...newGeneratedLabels]);
  savePreviousTopicLabels(allLabels);

  return result;
};

// 環境変数からAPIサーバーURLを取得またはデフォルト値を使用
const API_SERVER_URL =
  import.meta.env.VITE_API_SERVER_URL ||
  `${window.location.protocol}//${window.location.hostname}:3000`;

// APIの基本URL
const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "/api" : `${API_SERVER_URL}/api`;

// ランダムなカテゴリを取得する関数
const getRandomCategory = (): string => {
  const categories = [
    "daily",
    "travel",
    "business",
    "academic",
    "entertainment",
  ];
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
};

// トピックを取得する関数（APIまたはローカル生成）
const getTopics = async (category: string): Promise<any[]> => {
  // API利用率を下げるために50%の確率でローカル生成を使用
  const useLocalGeneration = Math.random() < 0.5;

  if (useLocalGeneration) {
    console.log("ローカルでトピックを生成します");
    return generateRandomTopics(category);
  } else {
    const topics = await fetchRandomTopics(category);

    // APIから取得したトピックのラベルも記録（重複回避のため）
    try {
      const previousTopicLabels = getPreviousTopicLabels();
      const newLabels = topics.map((topic) => topic.label);
      const allLabels = new Set([...previousTopicLabels, ...newLabels]);
      savePreviousTopicLabels(allLabels);
    } catch (error) {
      console.error("API取得トピックのラベル保存エラー:", error);
    }

    return topics;
  }
};

// APIからランダムなトピックリストを取得する関数
const fetchRandomTopics = async (goal: string = ""): Promise<any[]> => {
  try {
    // 常に新しいランダムトピックを取得するためにタイムスタンプをクエリに追加
    const timestamp = new Date().getTime();
    const response = await fetch(
      `${API_BASE_URL}/conversations/random-topics?goal=${goal}&count=5&_=${timestamp}`
    );
    if (!response.ok) {
      throw new Error("ランダムトピックの取得に失敗しました");
    }
    const data = await response.json();
    return data.topics || [];
  } catch (error) {
    console.error("ランダムトピック取得エラー:", error);
    // エラー時はローカルでトピックを生成
    return generateRandomTopics(goal);
  }
};

// 新規生成されたトピックが前回のトピックと重複していないか確認
const checkAndFilterDuplicates = (topics: Topic[]): Topic[] => {
  // 現在表示中のトピックラベルを取得
  const currentTopicLabels = localStorage.getItem("currentTopicLabels");
  if (!currentTopicLabels) {
    // 初回表示時は重複チェックしない
    localStorage.setItem(
      "currentTopicLabels",
      JSON.stringify(topics.map((t) => t.label))
    );
    return topics;
  }

  try {
    const prevLabels = new Set(JSON.parse(currentTopicLabels));
    // 重複するラベルを持つトピックをフィルタリング
    const filteredTopics = topics.filter(
      (topic) => !prevLabels.has(topic.label)
    );

    // すべてが重複だった場合は、元のリストを返す
    if (filteredTopics.length === 0) {
      return topics;
    }

    // フィルタリング後のトピックが少なすぎる場合、追加で生成
    if (filteredTopics.length < 3) {
      const category = getRandomCategory();
      const additionalTopics = generateRandomTopics(
        category,
        5 - filteredTopics.length
      );
      const result = [...filteredTopics, ...additionalTopics];
      // 現在のトピックラベルを更新
      localStorage.setItem(
        "currentTopicLabels",
        JSON.stringify(result.map((t) => t.label))
      );
      return result;
    }

    // 現在のトピックラベルを更新
    localStorage.setItem(
      "currentTopicLabels",
      JSON.stringify(filteredTopics.map((t) => t.label))
    );
    return filteredTopics;
  } catch (error) {
    console.error("トピック重複チェックエラー:", error);
    return topics;
  }
};

interface Topic {
  id: string;
  label: string;
  difficulty: number;
}

const TopicSelectionPage = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [isTopicsLoading, setIsTopicsLoading] = useState<boolean>(false);
  const [animatedItems, setAnimatedItems] = useState<boolean>(false);
  const navigate = useNavigate();

  // ページ読み込み時に常にランダムなトピックを生成
  useEffect(() => {
    const loadRandomTopics = async () => {
      setIsTopicsLoading(true);
      try {
        // ランダムな目標カテゴリを取得
        const randomCategory = getRandomCategory();
        // 選択された目標を上書き（オプション）
        localStorage.setItem("selectedGoal", randomCategory);

        // ランダムトピックを取得
        const topics = await getTopics(randomCategory);

        // 重複チェックとフィルタリング
        const filteredTopics = checkAndFilterDuplicates(topics);

        setAvailableTopics(filteredTopics);
        // アニメーション用のタイマー設定
        setTimeout(() => {
          setAnimatedItems(true);
        }, 100);
      } catch (error) {
        console.error("トピック読み込みエラー:", error);
        // エラー時はバックアップのトピックを設定
        const randomCategory = getRandomCategory();
        const fallbackTopics = generateRandomTopics(randomCategory);
        setAvailableTopics(fallbackTopics);
        // アニメーション用のタイマー設定
        setTimeout(() => {
          setAnimatedItems(true);
        }, 100);
      } finally {
        setIsTopicsLoading(false);
      }
    };

    loadRandomTopics();
  }, []);

  const handleContinue = () => {
    if (selectedTopic) {
      localStorage.setItem("selectedTopic", selectedTopic);
      navigate("/generating");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleRefreshTopics = async () => {
    setIsTopicsLoading(true);
    setSelectedTopic("");
    setAnimatedItems(false);

    try {
      // ランダムなカテゴリを取得
      const randomCategory = getRandomCategory();
      // 選択された目標を上書き（オプション）
      localStorage.setItem("selectedGoal", randomCategory);

      const topics = await getTopics(randomCategory);

      // 重複チェックとフィルタリング
      const filteredTopics = checkAndFilterDuplicates(topics);

      setAvailableTopics(filteredTopics);
      // アニメーション用のタイマー設定
      setTimeout(() => {
        setAnimatedItems(true);
      }, 100);
    } catch (error) {
      console.error("トピック再読み込みエラー:", error);
    } finally {
      setIsTopicsLoading(false);
    }
  };

  // トピック選択処理
  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);

    // 選択したトピックのラベルを取得して保存
    const selectedTopicObject = availableTopics.find(
      (topic) => topic.id === topicId
    );
    if (selectedTopicObject) {
      localStorage.setItem("selectedTopicLabel", selectedTopicObject.label);
    }
  };

  // 難易度に応じたアイコンとカラーを取得
  const getDifficultyInfo = (difficulty: number) => {
    const icons = ["🔎", "📝", "📚", "🎓", "🏆"];
    const colors = [
      "text-green-500",
      "text-blue-500",
      "text-purple-500",
      "text-orange-500",
      "text-red-500",
    ];

    return {
      icon: icons[difficulty - 1] || "📚",
      color: colors[difficulty - 1] || "text-purple-500",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white px-4 py-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 transform transition-all">
        <h1 className="text-center text-3xl font-bold mb-4 text-purple-800">
          トピックを選択
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          練習したいトピックを選択してください
        </p>

        <div className="flex justify-end mb-4">
          <button
            className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center transition-all duration-300 hover:bg-purple-50 rounded-lg"
            onClick={handleRefreshTopics}
            disabled={isTopicsLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 mr-2 ${
                isTopicsLoading ? "animate-spin" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isTopicsLoading ? "更新中..." : "新しいトピックを生成"}
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {isTopicsLoading ? (
            <div className="text-center py-10 flex flex-col items-center justify-center">
              <div className="spinner border-4 rounded-full w-12 h-12 border-purple-200 border-t-purple-600"></div>
              <p className="mt-4 text-gray-600 font-medium">
                トピックを生成中...
              </p>
            </div>
          ) : (
            availableTopics.map((topic, index) => {
              const { icon, color } = getDifficultyInfo(topic.difficulty);
              return (
                <div
                  key={topic.id}
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 transform
                    ${
                      selectedTopic === topic.id
                        ? "border-purple-500 bg-purple-50 scale-105 shadow-md"
                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/30"
                    }
                    ${
                      animatedItems
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }
                  `}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                  onClick={() => handleTopicSelect(topic.id)}
                >
                  <div className="flex items-center">
                    <div className={`text-3xl mr-4 ${color}`}>{icon}</div>
                    <div className="flex-1">
                      <h2 className="font-bold text-lg text-gray-800">
                        {topic.label}
                      </h2>
                      <div className="flex items-center mt-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 w-2 rounded-full mr-1 ${
                                i < topic.difficulty
                                  ? "bg-purple-600"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          難易度: {topic.difficulty}/5
                        </span>
                      </div>
                    </div>
                    {selectedTopic === topic.id ? (
                      <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transform scale-110 transition-all duration-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-gray-200 transition-all duration-300"></div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex space-x-4">
          <button
            className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-300 hover:shadow transform hover:scale-105 active:scale-95"
            onClick={handleBack}
          >
            戻る
          </button>
          <button
            className={`flex-1 py-3 px-6 text-white font-medium rounded-xl shadow-md transform transition-all duration-300 
              ${
                selectedTopic
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-105 active:scale-95"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            disabled={!selectedTopic}
            onClick={handleContinue}
          >
            問題を作成する
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicSelectionPage;
