.PHONY: migrate-create migrate-apply db-reset-clean

# Variables
DATABASE_URL := postgres://user:password@localhost:5432/chat_app?sslmode=disable
DEV_URL := postgres://user:password@localhost:5432/chat_app?sslmode=disable
SCHEMA_FILE := file://database/schema.hcl
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
