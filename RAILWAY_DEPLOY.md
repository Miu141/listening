# Railway へのデプロイ手順

このアプリケーションを Railway にデプロイするための手順です。

## 準備

1. [Railway](https://railway.app/)アカウントを作成
2. Railway CLI をインストール（オプション）

```bash
npm i -g @railway/cli
```

## デプロイ方法

### GUI を使用したデプロイ

1. [Railway Dashboard](https://railway.app/dashboard)にログイン
2. 「New Project」→「Deploy from GitHub repo」を選択
3. リポジトリを連携して選択
4. 「Add Variables」からすべての環境変数を設定
   - `.env.example`を参考に必要な環境変数を設定
   - 特に`OPENAI_API_KEY`は必ず設定してください
   - `VITE_API_SERVER_URL`にはデプロイ後の URL を設定（初回はデプロイ後に設定）
5. デプロイが完了したら、「Settings」から「Generate Domain」を実行して URL を生成

### CLI を使用したデプロイ

1. Railway CLI にログイン

```bash
railway login
```

2. プロジェクトをリンク

```bash
railway link
```

3. 環境変数を設定

```bash
railway variables set OPENAI_API_KEY=your_api_key
```

4. デプロイを実行

```bash
railway up
```

## デプロイ後の設定

1. 生成されたドメインを`VITE_API_SERVER_URL`環境変数に設定
2. 必要に応じて、「Settings」→「Redeploy」でアプリケーションを再デプロイ

## 注意事項

- Railway の無料枠は制限されているため、本番環境では有料プラン（$5/月～）の使用を検討してください
- OpenAI API の使用量に応じて別途課金が発生します
