# Aimu Report AI

React + Viteの画面から、ローカルのExpressサーバーを経由してDify Chatflowへ接続する自己成長支援型のAI日報アプリです。Dify APIキーはブラウザへ渡しません。

## v0.2の主な機能

- 日付別の活動メモ追加・編集・削除
- 活動メモから2形式の日報をDifyで生成
- 生成結果をMarkdownで編集・プレビューして保存
- localStorageへの活動メモ・日報保存と再読み込み復元
- 日付・キーワードによる日報検索
- Markdown・プレーンテキストのダウンロード、コピー、A4印刷
- 既存の会話継続型チャット

活動メモと日報はブラウザ内だけに保存されます。端末間では同期されず、ブラウザデータ削除により失われる可能性があります。

## セットアップ

1. `npm install` で依存パッケージをインストールします。
2. `cp .env.example .env` でローカル設定を作ります。
3. `.env` の `DIFY_API_KEY` に、Difyアプリ内の「APIアクセス」で発行したキーを設定します。キーをチャット、ソースコード、Gitへ貼り付けないでください。
4. Dify Cloud以外を使う場合だけ `DIFY_API_BASE_URL` を変更します。Chatflowの開始ノードに追加変数がある場合は `DIFY_INPUTS_JSON` にJSONオブジェクトを設定します。

## 起動

```bash
npm run dev
```

- React: `http://localhost:5173`
- Express: `http://127.0.0.1:3001`
- ヘルスチェック: `http://127.0.0.1:3001/api/health`

Expressはローカルループバックだけで待ち受けます。Viteは `/api` をExpressへプロキシします。

## 確認

```bash
npm test
npm run lint
npm run build
npm audit
```

Difyへの実通信確認には `.env` の実キーが必要です。キーを設定後、画面から1回送信し、続けて同じチャットでもう1回送信すると会話継続を確認できます。「新しいチャット」ではDifyの会話IDがリセットされます。

Dify側の推奨設定は [`docs/DIFY_PROMPT_V02.md`](docs/DIFY_PROMPT_V02.md) を参照してください。
