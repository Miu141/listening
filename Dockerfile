# ビルドステージ
FROM node:20-alpine AS builder

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# サーバー側の依存関係のインストール
COPY server/package*.json ./server/
RUN cd server && npm install

# ソースコードのコピー
COPY . .

# フロントエンドのビルド
RUN npm run build

# サーバーのビルド
RUN cd server && npm run build

# 実行ステージ
FROM node:20-alpine AS runtime

WORKDIR /app

# 本番環境用の依存関係のみインストール
COPY server/package*.json ./server/
RUN cd server && npm install --production

# ビルドステージからの成果物をコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server/dist ./server/dist

# 環境変数の設定
ENV NODE_ENV=production
ENV PORT=3000

# アプリを実行
CMD ["node", "server/dist/index.js"] 