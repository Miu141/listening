import { Routes, Route } from 'react-router-dom'
import LevelSelectionPage from './pages/LevelSelectionPage'
import GoalSelectionPage from './pages/GoalSelectionPage'
import TopicSelectionPage from './pages/TopicSelectionPage'
import ListeningPage from './pages/ListeningPage'
import ResultPage from './pages/ResultPage'

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<LevelSelectionPage />} />
        <Route path="/goal-selection" element={<GoalSelectionPage />} />
        <Route path="/topic-selection" element={<TopicSelectionPage />} />
        <Route path="/listening" element={<ListeningPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </div>
  )
}

export default App
