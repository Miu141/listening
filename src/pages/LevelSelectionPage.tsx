import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LEVELS = [
  { id: 'beginner', label: '初級', description: '英検5級～4級レベル' },
  { id: 'intermediate', label: '中級', description: '英検3級～準2級レベル' },
  { id: 'advanced', label: '上級', description: '英検2級～準1級レベル' },
  { id: 'expert', label: '最上級', description: '英検1級レベル' },
]

const LevelSelectionPage = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const navigate = useNavigate()

  const handleContinue = () => {
    if (selectedLevel) {
      localStorage.setItem('selectedLevel', selectedLevel)
      navigate('/goal-selection')
    }
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-center text-2xl font-bold mb-8">リスニングレベルを選択</h1>
      <p className="text-gray-600 mb-6 text-center">あなたの現在の英語リスニングレベルを選択してください</p>
      
      <div className="space-y-3 mb-10">
        {LEVELS.map((level) => (
          <div 
            key={level.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedLevel === level.id 
                ? 'border-primary bg-purple-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedLevel(level.id)}
          >
            <div className="flex items-center">
              <div className="flex-1">
                <h2 className="font-semibold">{level.label}</h2>
                <p className="text-sm text-gray-500">{level.description}</p>
              </div>
              {selectedLevel === level.id && (
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

      <button 
        className={`w-full btn btn-primary ${!selectedLevel && 'opacity-50 cursor-not-allowed'}`}
        disabled={!selectedLevel}
        onClick={handleContinue}
      >
        続ける
      </button>
    </div>
  )
}

export default LevelSelectionPage 