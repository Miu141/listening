import { useNavigate } from 'react-router-dom'

const MOCK_RESULTS = {
  score: 85,
  timeSpent: '3:45',
  feedback: [
    '挨拶と自己紹介のパートは良く理解できています',
    '仕事の説明については概ね理解できていましたが、一部聞き取りにくい部分がありました',
    '趣味の説明は非常に良く理解できています',
    '今後の目標についても理解できています',
  ],
  suggestions: [
    'リスニング速度をさらに上げるために、1.25倍速での練習も試してみましょう',
    '似た発音の単語（例：work/walk）の聞き分けを練習すると良いでしょう',
    '次はより長い会話や複数人での会話に挑戦してみましょう',
  ]
}

const ResultPage = () => {
  const navigate = useNavigate()

  const handleRetry = () => {
    navigate('/listening')
  }

  const handleHome = () => {
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-center text-2xl font-bold mb-8">結果</h1>
      
      {/* スコア表示 */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-6 text-center">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full border-8 border-primary flex items-center justify-center">
            <span className="text-4xl font-bold">{MOCK_RESULTS.score}</span>
          </div>
          <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center">
            <span className="text-lg font-bold">%</span>
          </div>
        </div>
        <p className="mt-4 text-gray-600">所要時間: {MOCK_RESULTS.timeSpent}</p>
      </div>
      
      {/* フィードバック */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-6">
        <h2 className="font-bold text-lg mb-3">フィードバック</h2>
        <ul className="list-disc pl-5 space-y-2">
          {MOCK_RESULTS.feedback.map((item, index) => (
            <li key={index} className="text-gray-700">{item}</li>
          ))}
        </ul>
      </div>
      
      {/* 改善提案 */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-10">
        <h2 className="font-bold text-lg mb-3">改善提案</h2>
        <ul className="list-disc pl-5 space-y-2">
          {MOCK_RESULTS.suggestions.map((item, index) => (
            <li key={index} className="text-gray-700">{item}</li>
          ))}
        </ul>
      </div>
      
      {/* ボタン */}
      <div className="flex space-x-4">
        <button 
          className="flex-1 btn btn-secondary"
          onClick={handleHome}
        >
          ホームへ
        </button>
        <button 
          className="flex-1 btn btn-primary"
          onClick={handleRetry}
        >
          もう一度
        </button>
      </div>
    </div>
  )
}

export default ResultPage 