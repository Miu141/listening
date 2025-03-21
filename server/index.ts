import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import questionsRouter from './routes/questions.js'
import transcriptRouter from './routes/transcript.js'
import conversationsRouter from './routes/conversations.js'

dotenv.config()

// ESモジュールで__dirnameを再現する
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})
const port = process.env.PORT || 3000

// ミドルウェア
app.use(cors())
app.use(express.json())

// 静的ファイルの配信
const publicPath = path.join(__dirname, '../public')
const distPath = path.join(__dirname, '../dist')
console.log('Static files path:', publicPath)
console.log('Dist files path:', distPath)

// オーディオファイルへのアクセスをより詳細にログ出力
app.use('/audio', (req, res, next) => {
  console.log(`Audio file requested: ${req.path}`);
  // CORSヘッダーを明示的に設定
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(publicPath, 'audio'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
      console.log(`Setting Content-Type to audio/mpeg for ${path}`);
    }
  }
}));

// ソケット接続を追跡
io.on('connection', (socket) => {
  console.log('クライアント接続: ', socket.id)
  
  socket.on('disconnect', () => {
    console.log('クライアント切断: ', socket.id)
  })
})

// リクエストオブジェクトにioを追加するミドルウェア
app.use((req, res, next) => {
  req.io = io
  next()
})

// 型定義の拡張
declare global {
  namespace Express {
    interface Request {
      io: Server
    }
  }
}

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'サーバーは正常に動作しています' })
})

// 問題生成ルーターをマウント
app.use('/api/questions', questionsRouter)

// 翻訳ルーターをマウント
app.use('/api/transcript', transcriptRouter)

// 会話サンプル生成ルーターをマウント
app.use('/api/conversations', conversationsRouter)

// フロントエンドの静的ファイルを配信
app.use(express.static(distPath))

// その他のルートはすべてindex.htmlにリダイレクト（SPA向け）
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// サーバー起動
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
}) 