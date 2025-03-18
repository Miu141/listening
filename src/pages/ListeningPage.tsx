import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 仮のオーディオデータ
const MOCK_AUDIO = {
  url: '/audio/sample.mp3',
  transcript: `Hello, my name is Sarah. I'm from New York. I work as a software engineer. 
  In my free time, I enjoy hiking, reading books, and playing the piano. 
  I've been learning Japanese for about two years now. 
  I hope to visit Japan someday and practice my language skills.`,
  duration: 180, // 秒
}

const ListeningPage = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const audio = new Audio(MOCK_AUDIO.url)
    setAudioElement(audio)

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', () => {})
      audio.removeEventListener('ended', () => {})
    }
  }, [])

  const togglePlay = () => {
    if (!audioElement) return

    if (isPlaying) {
      audioElement.pause()
    } else {
      audioElement.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioElement) return
    const time = parseFloat(e.target.value)
    audioElement.currentTime = time
    setCurrentTime(time)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleFinish = () => {
    navigate('/result')
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-center text-2xl font-bold mb-8">リスニング練習</h1>
      
      {/* オーディオプレーヤー */}
      <div className="bg-white rounded-lg p-5 shadow-md mb-6">
        <div className="flex justify-between mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(MOCK_AUDIO.duration)}</span>
        </div>
        
        <input 
          type="range" 
          min="0" 
          max={MOCK_AUDIO.duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full mb-4"
        />
        
        <div className="flex justify-center space-x-4">
          <button 
            className="bg-gray-100 hover:bg-gray-200 rounded-full p-3"
            onClick={() => {
              if (!audioElement) return
              audioElement.currentTime = Math.max(0, currentTime - 10)
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>
          
          <button 
            className="bg-primary hover:bg-primary-dark text-white rounded-full p-4"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          
          <button 
            className="bg-gray-100 hover:bg-gray-200 rounded-full p-3"
            onClick={() => {
              if (!audioElement) return
              audioElement.currentTime = Math.min(MOCK_AUDIO.duration, currentTime + 10)
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* トランスクリプト */}
      <div className="mb-8">
        <button 
          className="text-primary mb-2 text-sm font-medium flex items-center"
          onClick={() => setShowTranscript(!showTranscript)}
        >
          {showTranscript ? '文字起こしを非表示' : '文字起こしを表示'}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ml-1 transition-transform ${showTranscript ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showTranscript && (
          <div className="bg-white rounded-lg p-4 shadow-md">
            <p className="text-gray-700 whitespace-pre-line">{MOCK_AUDIO.transcript}</p>
          </div>
        )}
      </div>
      
      <button 
        className="w-full btn btn-primary"
        onClick={handleFinish}
      >
        完了
      </button>
    </div>
  )
}

export default ListeningPage 