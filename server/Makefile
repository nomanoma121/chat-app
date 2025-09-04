.PHONY: migrate-create migrate-apply db-reset-clean schema-to-sql sqlc-generate generate schema-docs

# Variables
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
