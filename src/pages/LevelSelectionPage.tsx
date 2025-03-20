import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LEVELS = [
  {
    id: "beginner",
    label: "初級",
    description: "英検5級～4級レベル",
    icon: "🌱",
  },
  {
    id: "intermediate",
    label: "中級",
    description: "英検3級～準2級レベル",
    icon: "🌿",
  },
  {
    id: "advanced",
    label: "上級",
    description: "英検2級～準1級レベル",
    icon: "🌳",
  },
  {
    id: "expert",
    label: "最上級",
    description: "英検1級レベル",
    icon: "🌟",
  },
];

const LevelSelectionPage = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [animatedItems, setAnimatedItems] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ページロード時のアニメーション
    setAnimatedItems(true);
  }, []);

  const handleContinue = () => {
    if (selectedLevel) {
      localStorage.setItem("selectedLevel", selectedLevel);

      // 選択したレベルのラベルも保存
      const selectedLevelObject = LEVELS.find(
        (level) => level.id === selectedLevel
      );
      if (selectedLevelObject) {
        localStorage.setItem("selectedLevelLabel", selectedLevelObject.label);
      }

      navigate("/topic-selection");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white px-4 py-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 transform transition-all">
        <h1 className="text-center text-3xl font-bold mb-4 text-purple-800">
          リスニングレベルを選択
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          あなたの現在の英語リスニングレベルを選択してください
        </p>

        <div className="space-y-4 mb-8">
          {LEVELS.map((level, index) => (
            <div
              key={level.id}
              className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 transform 
                ${
                  selectedLevel === level.id
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
              onClick={() => setSelectedLevel(level.id)}
            >
              <div className="flex items-center">
                <div className="text-3xl mr-4">{level.icon}</div>
                <div className="flex-1">
                  <h2 className="font-bold text-lg text-gray-800">
                    {level.label}
                  </h2>
                  <p className="text-sm text-gray-500">{level.description}</p>
                </div>
                {selectedLevel === level.id ? (
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
          ))}
        </div>

        <button
          className={`w-full py-3 px-6 text-white font-medium rounded-xl shadow-md transform transition-all duration-300 
            ${
              selectedLevel
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-105 active:scale-95"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          disabled={!selectedLevel}
          onClick={handleContinue}
        >
          続ける
        </button>
      </div>
    </div>
  );
};

export default LevelSelectionPage;
