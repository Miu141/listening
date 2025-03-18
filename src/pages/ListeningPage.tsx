import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Howl, HowlErrorCallback } from 'howler'

// 仮のオーディオデータ
const MOCK_AUDIO = {
  url: '/audio/sample.mp3', // ダウンロードしたローカルファイルに変更
  transcript: `Hello, my name is Sarah. I'm from New York. I work as a software engineer. 
  In my free time, I enjoy hiking, reading books, and playing the piano. 
  I've been learning Japanese for about two years now. 
  I hope to visit Japan someday and practice my language skills.`,
  duration: 180, // 秒
}

// テキスト読み上げによるオーディオ生成
const generateSpeech = (text: string): Promise<string> => {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // 少し遅めの速度
    utterance.pitch = 1;
    
    // 読み上げ完了イベント
    utterance.onend = () => {
      console.log('Speech generation completed');
    };
    
    // 読み上げエラーハンドリング
    utterance.onerror = (event) => {
      console.error('Speech generation error:', event);
    };
    
    // このデモでは実際のファイルは作成せず、テキスト読み上げAPIを使用
    window.speechSynthesis.speak(utterance);
    
    // 実際はここでBlobやAudioBufferを返すべき
    // デモ用に既存のサンプルファイルのパスを返す
    resolve(MOCK_AUDIO.url);
  });
};

const ListeningPage = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading')
  const [duration, setDuration] = useState(MOCK_AUDIO.duration)
  const howlRef = useRef<Howl | null>(null)
  const requestRef = useRef<number | null>(null)
  const navigate = useNavigate()

  // Howlインスタンスの作成
  useEffect(() => {
    setLoadingState('loading')
    
    // 音声合成を使用して音声を生成（またはローカルファイルを使用）
    generateSpeech(MOCK_AUDIO.transcript)
      .then(audioUrl => {
        try {
          const sound = new Howl({
            src: [audioUrl],
            html5: true, // ストリーミングのためにHTML5モードを有効化
            format: ['mp3'],
            onload: () => {
              console.log('Audio loaded successfully')
              setLoadingState('success')
              setDuration(sound.duration())
            },
            onloaderror: ((id, error) => {
              console.error('Audio loading error:', error)
              setLoadingState('error')
            }) as HowlErrorCallback,
            onplayerror: ((id, error) => {
              console.error('Audio play error:', error)
              // 自動的に再生を再試行
              sound.once('unlock', () => {
                sound.play()
              })
            }) as HowlErrorCallback
          })
          
          howlRef.current = sound
        } catch (error) {
          console.error('Error creating Howl instance:', error)
          setLoadingState('error')
        }
      })
      .catch(error => {
        console.error('Speech generation error:', error)
        setLoadingState('error')
      })
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
      if (howlRef.current) {
        howlRef.current.unload()
      }
    }
  }, [])

  // 再生状態を更新するアニメーションフレーム
  const updatePlaybackState = () => {
    if (howlRef.current && !howlRef.current.playing()) {
      return
    }
    
    if (howlRef.current) {
      setCurrentTime(howlRef.current.seek() as number)
      requestRef.current = requestAnimationFrame(updatePlaybackState)
    }
  }

  // 再生状態が変わったときの処理
  useEffect(() => {
    if (!howlRef.current) return
    
    if (isPlaying) {
      howlRef.current.play()
      requestRef.current = requestAnimationFrame(updatePlaybackState)
    } else {
      howlRef.current.pause()
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
        requestRef.current = null
      }
    }
  }, [isPlaying])

  const togglePlay = () => {
    if (!howlRef.current || loadingState !== 'success') return
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!howlRef.current || loadingState !== 'success') return
    const time = parseFloat(e.target.value)
    howlRef.current.seek(time)
    setCurrentTime(time)
  }

  const skipBackward = () => {
    if (!howlRef.current || loadingState !== 'success') return
    const newTime = Math.max(0, (howlRef.current.seek() as number) - 10)
    howlRef.current.seek(newTime)
    setCurrentTime(newTime)
  }

  const skipForward = () => {
    if (!howlRef.current || loadingState !== 'success') return
    const newTime = Math.min(duration, (howlRef.current.seek() as number) + 10)
    howlRef.current.seek(newTime)
    setCurrentTime(newTime)
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
      
      {loadingState === 'loading' && (
        <div className="text-center mb-4">
          <p>音声ファイルを読み込み中...</p>
        </div>
      )}
      
      {loadingState === 'error' && (
        <div className="text-center mb-4 text-red-500">
          <p>音声ファイルの読み込みに失敗しました。</p>
          <button 
            className="mt-2 text-primary underline"
            onClick={() => window.location.reload()}
          >
            再読み込みする
          </button>
        </div>
      )}
      
      {/* オーディオプレーヤー */}
      <div className="bg-white rounded-lg p-5 shadow-md mb-6">
        <div className="flex justify-between mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        <input 
          type="range" 
          min="0" 
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full mb-4 cursor-pointer"
          disabled={loadingState !== 'success'}
        />
        
        <div className="flex justify-center space-x-4">
          <button 
            className="bg-gray-100 hover:bg-gray-200 rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={skipBackward}
            disabled={loadingState !== 'success'}
            aria-label="10秒戻る"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>
          
          <button 
            className="bg-primary hover:bg-primary-dark text-white rounded-full p-4 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={togglePlay}
            disabled={loadingState !== 'success'}
            aria-label={isPlaying ? "一時停止" : "再生"}
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
            className="bg-gray-100 hover:bg-gray-200 rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={skipForward}
            disabled={loadingState !== 'success'}
            aria-label="10秒進む"
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