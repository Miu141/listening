import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const GOALS = [
  { id: 'daily', label: '日常会話', description: '日常的な会話や簡単な話題を理解できるようになる' },
  { id: 'travel', label: '旅行会話', description: '海外旅行で必要な会話や案内を理解できるようになる' },
  { id: 'business', label: 'ビジネス', description: '会議やプレゼンテーションの内容を理解できるようになる' },
  { id: 'academic', label: '学術・試験対策', description: '講義や試験問題を理解できるようになる' },
  { id: 'entertainment', label: '映画・音楽', description: '映画やドラマ、歌詞を字幕なしで理解できるようになる' },
]

const GoalSelectionPage = () => {
  const [selectedGoal, setSelectedGoal] = useState<string>('')
  const navigate = useNavigate()

  const handleContinue = () => {
    if (selectedGoal) {
      localStorage.setItem('selectedGoal', selectedGoal)
      navigate('/topic-selection')
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-center text-2xl font-bold mb-8">学習目標を選択</h1>
      <p className="text-gray-600 mb-6 text-center">あなたの英語学習の目標を選択してください</p>
      
      <div className="space-y-3 mb-10">
        {GOALS.map((goal) => (
          <div 
            key={goal.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedGoal === goal.id 
                ? 'border-primary bg-purple-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedGoal(goal.id)}
          >
            <div className="flex items-center">
              <div className="flex-1">
                <h2 className="font-semibold">{goal.label}</h2>
                <p className="text-sm text-gray-500">{goal.description}</p>
              </div>
              {selectedGoal === goal.id && (
                <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-4">
        <button 
          className="flex-1 btn btn-secondary"
          onClick={handleBack}
        >
          戻る
        </button>
        <button 
          className={`flex-1 btn btn-primary ${!selectedGoal && 'opacity-50 cursor-not-allowed'}`}
          disabled={!selectedGoal}
          onClick={handleContinue}
        >
          続ける
        </button>
      </div>
    </div>
  )
}

export default GoalSelectionPage 