import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 目標ごとのトピック
const TOPICS_BY_GOAL = {
  daily: [
    { id: 'daily-greetings', label: '挨拶と自己紹介', difficulty: 1 },
    { id: 'daily-shopping', label: 'ショッピング', difficulty: 2 },
    { id: 'daily-restaurant', label: 'レストランでの会話', difficulty: 2 },
    { id: 'daily-directions', label: '道案内', difficulty: 3 },
    { id: 'daily-weather', label: '天気の話', difficulty: 2 },
  ],
  travel: [
    { id: 'travel-airport', label: '空港での会話', difficulty: 2 },
    { id: 'travel-hotel', label: 'ホテルでの会話', difficulty: 2 },
    { id: 'travel-transportation', label: '交通機関の利用', difficulty: 3 },
    { id: 'travel-sightseeing', label: '観光地での会話', difficulty: 3 },
    { id: 'travel-emergency', label: '緊急時の会話', difficulty: 4 },
  ],
  business: [
    { id: 'business-meeting', label: '会議', difficulty: 4 },
    { id: 'business-presentation', label: 'プレゼンテーション', difficulty: 4 },
    { id: 'business-negotiation', label: '交渉', difficulty: 5 },
    { id: 'business-email', label: 'ビジネスメール', difficulty: 3 },
    { id: 'business-smalltalk', label: '雑談とネットワーキング', difficulty: 3 },
  ],
  academic: [
    { id: 'academic-lecture', label: '講義', difficulty: 4 },
    { id: 'academic-discussion', label: 'ディスカッション', difficulty: 4 },
    { id: 'academic-presentation', label: '発表', difficulty: 4 },
    { id: 'academic-research', label: '研究と文献', difficulty: 5 },
    { id: 'academic-exam', label: '試験対策', difficulty: 4 },
  ],
  entertainment: [
    { id: 'entertainment-movies', label: '映画', difficulty: 3 },
    { id: 'entertainment-music', label: '音楽と歌詞', difficulty: 3 },
    { id: 'entertainment-tv', label: 'テレビ番組', difficulty: 3 },
    { id: 'entertainment-news', label: 'ニュース', difficulty: 4 },
    { id: 'entertainment-podcasts', label: 'ポッドキャスト', difficulty: 4 },
  ],
}

const TopicSelectionPage = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [availableTopics, setAvailableTopics] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const selectedGoal = localStorage.getItem('selectedGoal') || 'daily'
    // @ts-ignore
    setAvailableTopics(TOPICS_BY_GOAL[selectedGoal] || TOPICS_BY_GOAL.daily)
  }, [])

  const handleContinue = () => {
    if (selectedTopic) {
      localStorage.setItem('selectedTopic', selectedTopic)
      navigate('/listening')
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-center text-2xl font-bold mb-8">トピックを選択</h1>
      <p className="text-gray-600 mb-6 text-center">練習したいトピックを選択してください</p>
      
      <div className="space-y-3 mb-10">
        {availableTopics.map((topic) => (
          <div 
            key={topic.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTopic === topic.id 
                ? 'border-primary bg-purple-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTopic(topic.id)}
          >
            <div className="flex items-center">
              <div className="flex-1">
                <h2 className="font-semibold">{topic.label}</h2>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-2 w-2 rounded-full mr-1 ${
                          i < topic.difficulty ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    難易度: {topic.difficulty}/5
                  </span>
                </div>
              </div>
              {selectedTopic === topic.id && (
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
          className={`flex-1 btn btn-primary ${!selectedTopic && 'opacity-50 cursor-not-allowed'}`}
          disabled={!selectedTopic}
          onClick={handleContinue}
        >
          開始する
        </button>
      </div>
    </div>
  )
}

export default TopicSelectionPage 