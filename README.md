# Chat App

マイクロサービスアーキテクチャで構築されたチャットアプリケーションです。

![chat-app-demo](./docs/images/chat-page.png)

## 主な機能

- サーバー管理: サーバー、カテゴリ、チャンネルの作成
- 認証: ユーザー登録、ログイン、JWTによる認証
- 招待システム: 招待リンクの生成と利用
- メッセージング: チャンネル内でのメッセージ送信と取得

## 技術スタック

### バックエンド

- 言語: Go
- フレームワーク: chi
- API: gRPC, Protocol Buffers
- 認証: JWT

### フロントエンド

- 言語: TypeScript
- フレームワーク: React
- APIクライアント: Orval

### インフラ & データベース

- データベース: PostgreSQL
- DBマイグレーション: Atlas
- クエリビルダ: sqlc
- コンテナ: Docker

## 今後実装予定

- WebSocketを用いたリアルタイムチャット機能
- Redisを用いたキャッシュ、Pub/Sub
- 通知機能など
