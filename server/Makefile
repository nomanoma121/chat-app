.PHONY: migrate-create migrate-apply db-reset-clean schema-to-sql sqlc-generate generate schema-docs migrate-hash-fix lint-all fix pprof-api-gateway pprof-user pprof-realtime pprof-message pprof-media pprof-guild pprof-check
DATABASE_URL := postgres://user:password@localhost:5432/chat_app?sslmode=disable
DEV_URL := postgres://user:password@localhost:5432/chat_app?sslmode=disable
SCHEMA_FILE := file://database/schema.hcl
SCHEMA_SQL := database/schema.sql
MIGRATIONS_DIR := file://database/migrations

# Clean reset database for Atlas migration
db-reset-clean:
	@echo "🧹 Cleaning database for Atlas migration..."
	@docker-compose exec -T postgres psql -U user chat_app -c "DROP SCHEMA IF EXISTS atlas_schema_revisions CASCADE;" || true
	@docker-compose exec -T postgres psql -U user chat_app -c "DROP TABLE IF EXISTS users CASCADE;" || true
	@docker-compose exec -T postgres psql -U user chat_app -c "DROP SCHEMA IF EXISTS public CASCADE;" || true
	@docker-compose exec -T postgres psql -U user chat_app -c "CREATE SCHEMA public;" || true
	@echo "✅ Database cleaned for migration!"

# Generate migration from schema diff
migrate-create:
	@read -p "Enter migration name: " name; \
	atlas migrate diff $$name \
		--dir "$(MIGRATIONS_DIR)" \
		--to "$(SCHEMA_FILE)" \
		--dev-url "$(DEV_URL)"

# Apply migrations
migrate-apply:
	atlas migrate apply \
		--dir "$(MIGRATIONS_DIR)" \
		--url "$(DATABASE_URL)"

# Fix migration hash issues (regenerate atlas.sum)
migrate-hash-fix:
	@echo "🔧 Regenerating atlas.sum from migration files..."
	atlas migrate hash \
		--dir "$(MIGRATIONS_DIR)"
	@echo "✅ Migration hashes fixed!"

# Schema management
schema-to-sql:
	@echo "🔧 Generating SQL from HCL schema..."
	atlas schema inspect --url "$(SCHEMA_FILE)" --dev-url "$(DEV_URL)" --format "{{ sql . }}" > $(SCHEMA_SQL)
	@echo "✅ Generated $(SCHEMA_SQL)"

sqlc-generate:
	@echo "⚙️ Generating Go code from SQL..."
	@for service in user guild message; do \
		if [ -d "services/$$service/queries" ]; then \
			echo "Generating for $$service service..."; \
			cd services/$$service && sqlc generate && cd ../..; \
		fi; \
	done
	@echo "✅ sqlc code generation complete!"

# Combined workflow
generate: schema-to-sql sqlc-generate
	@echo "🎉 Schema → SQL → Go code generation complete!"

lint: lint-all
	@echo "🎉 All linting complete!"

lint-guild:
	@echo "==> Linting guild-service..."
	@cd services/guild && golangci-lint run

lint-user:
	@echo "==> Linting user-service..."
	@cd services/user && golangci-lint run

lint-api-gateway:
	@echo "==> Linting api-gateway..."
	@cd services/api-gateway && golangci-lint run

lint-message:
	@echo "==> Linting message-service..."
	@cd services/message && golangci-lint run

lint-realtime:
	@echo "==> Linting realtime-service..."
	@cd services/realtime && golangci-lint run

lint-media:
	@echo "==> Linting media-service..."
	@cd services/media && golangci-lint run

lint-all:
	@echo "==> Running golangci-lint on all modules..."
	golangci-lint run ./services/user/... ./services/guild/... ./services/api-gateway/... ./services/message/... ./services/realtime/... ./services/media/... ./shared/... ./api/...
fix:
	@echo "==> Auto-fixing format and lint issues..."
	gofmt -w ./services/user/ ./services/guild/ ./services/api-gateway/ ./services/message/ ./services/realtime/ ./services/media/ ./shared/ ./api/
	goimports -w ./services/user/ ./services/guild/ ./services/api-gateway/ ./services/message/ ./services/realtime/ ./services/media/ ./shared/ ./api/ || echo "goimports not found, skipping import fixes"
	golangci-lint run --fix ./services/user/... ./services/guild/... ./services/api-gateway/... ./services/message/... ./services/realtime/... ./services/media/... ./shared/... ./api/...
	@echo "✅ Auto-fix complete!"

# pprof profiling targets
pprof-api-gateway:
	@echo "Fetching CPU profile from API Gateway (localhost:6065)..."
	go tool pprof http://localhost:6065/debug/pprof/profile

pprof-user:
	@echo "Fetching CPU profile from User service (localhost:6060)..."
	go tool pprof http://localhost:6060/debug/pprof/profile

pprof-realtime:
	@echo "Fetching CPU profile from Realtime service (localhost:6063)..."
	go tool pprof http://localhost:6063/debug/pprof/profile

pprof-message:
	@echo "Fetching CPU profile from Message service (localhost:6062)..."
	go tool pprof http://localhost:6062/debug/pprof/profile

pprof-media:
	@echo "Fetching CPU profile from Media service (localhost:6064)..."
	go tool pprof http://localhost:6064/debug/pprof/profile

pprof-guild:
	@echo "Fetching CPU profile from Guild service (localhost:6061)..."
	go tool pprof http://localhost:6061/debug/pprof/profile

pprof-check:
	$(eval latest := $(shell ls -rt ~/pprof/ | tail -n 1))
	go tool pprof -http=localhost:6070 ~/pprof/$(latest)

pg-stats-init:
	docker exec -it postgres psql -U user -d chat_app -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"

pg-stats-top:
	docker exec chat-app-postgres-1 psql -U user -d chat_app -c "SELECT LEFT(query, 80) AS query, calls, ROUND(total_exec_time::numeric, 2) AS total_ms, ROUND(mean_exec_time::numeric, 2) AS mean_ms FROM pg_stat_statements WHERE calls > 100 ORDER BY mean_exec_time DESC LIMIT 20;"
