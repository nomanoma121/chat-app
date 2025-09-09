# サーバー開発用コマンド

## 環境変数の設定

`.env`にJWTシークレット設定:

```bash
# services/user/.env と services/api-gateway/.env 両方に
JWT_SECRET=your-super-secret-jwt-key-here
```

## 起動

```bash
# データベース起動
docker-compose up -d

# UserService起動  
cd services/user && go run cmd/main.go

# API Gateway起動
cd services/api-gateway && go run cmd/main.go
```

## DB関連

```bash
# スキーマとコード生成
make generate

# データベースリセット
make db-reset-clean

# SQLクエリ追加後
make sqlc-generate
```
