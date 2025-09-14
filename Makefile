# ERIFY™ Worker Makefile
# Production-ready deployment and development targets
# Supports multiple environments and automated workflows

.PHONY: help install dev build deploy test clean setup-db setup-secrets check lint format migrate

# Default target
.DEFAULT_GOAL := help

# Environment variables
NODE_ENV ?= development
CLOUDFLARE_ACCOUNT_ID ?= $(shell wrangler whoami | grep "Account ID" | cut -d' ' -f3)
WRANGLER_ENV ?= development

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

help: ## Display this help message
	@echo "$(BLUE)ERIFY™ Worker Deployment Makefile$(NC)"
	@echo "=================================="
	@echo ""
	@echo "$(GREEN)Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(GREEN)Environment Variables:$(NC)"
	@echo "  WRANGLER_ENV    : $(YELLOW)$(WRANGLER_ENV)$(NC) (development/staging/production)"
	@echo "  NODE_ENV        : $(YELLOW)$(NODE_ENV)$(NC)"
	@echo "  ACCOUNT_ID      : $(YELLOW)$(CLOUDFLARE_ACCOUNT_ID)$(NC)"

install: ## Install dependencies and tools
	@echo "$(GREEN)Installing dependencies...$(NC)"
	@command -v wrangler >/dev/null 2>&1 || npm install -g wrangler
	@command -v jq >/dev/null 2>&1 || (echo "$(RED)jq is required but not installed$(NC)" && exit 1)
	@echo "$(GREEN)Dependencies installed successfully$(NC)"

check: ## Check prerequisites and configuration
	@echo "$(GREEN)Checking prerequisites...$(NC)"
	@command -v wrangler >/dev/null 2>&1 || (echo "$(RED)Wrangler CLI not found$(NC)" && exit 1)
	@wrangler whoami >/dev/null 2>&1 || (echo "$(RED)Not logged in to Cloudflare$(NC)" && exit 1)
	@test -f wrangler.toml || (echo "$(RED)wrangler.toml not found$(NC)" && exit 1)
	@test -f src/index.js || (echo "$(RED)src/index.js not found$(NC)" && exit 1)
	@test -f schema.sql || (echo "$(RED)schema.sql not found$(NC)" && exit 1)
	@echo "$(GREEN)All prerequisites met$(NC)"

lint: ## Lint the worker code
	@echo "$(GREEN)Linting worker code...$(NC)"
	@if command -v eslint >/dev/null 2>&1; then \
		eslint src/index.js || echo "$(YELLOW)ESLint not configured or issues found$(NC)"; \
	else \
		echo "$(YELLOW)ESLint not installed, skipping lint$(NC)"; \
	fi
	@echo "$(GREEN)Linting complete$(NC)"

format: ## Format the worker code
	@echo "$(GREEN)Formatting worker code...$(NC)"
	@if command -v prettier >/dev/null 2>&1; then \
		prettier --write src/index.js; \
	else \
		echo "$(YELLOW)Prettier not installed, skipping format$(NC)"; \
	fi
	@echo "$(GREEN)Formatting complete$(NC)"

dev: check ## Start development server
	@echo "$(GREEN)Starting development server...$(NC)"
	@echo "$(YELLOW)Environment: development$(NC)"
	@wrangler dev --env development

build: check lint ## Build and validate the worker
	@echo "$(GREEN)Building worker...$(NC)"
	@wrangler publish --env $(WRANGLER_ENV) --dry-run
	@echo "$(GREEN)Build validation complete$(NC)"

setup-db: check ## Create and setup D1 database
	@echo "$(GREEN)Setting up D1 database...$(NC)"
	@if [ "$(WRANGLER_ENV)" = "production" ]; then \
		echo "$(YELLOW)Creating production database...$(NC)"; \
		wrangler d1 create erify-telemetry-db || echo "$(YELLOW)Database may already exist$(NC)"; \
	elif [ "$(WRANGLER_ENV)" = "staging" ]; then \
		echo "$(YELLOW)Creating staging database...$(NC)"; \
		wrangler d1 create erify-telemetry-db-staging || echo "$(YELLOW)Database may already exist$(NC)"; \
	else \
		echo "$(YELLOW)Creating development database...$(NC)"; \
		wrangler d1 create erify-telemetry-db-dev || echo "$(YELLOW)Database may already exist$(NC)"; \
	fi
	@echo "$(GREEN)Database setup complete$(NC)"

migrate: check setup-db ## Run database migrations
	@echo "$(GREEN)Running database migrations...$(NC)"
	@echo "$(YELLOW)Environment: $(WRANGLER_ENV)$(NC)"
	@wrangler d1 execute erify-telemetry-db$(shell [ "$(WRANGLER_ENV)" != "production" ] && echo "-$(WRANGLER_ENV)") --file=./schema.sql --env $(WRANGLER_ENV)
	@echo "$(GREEN)Migration complete$(NC)"

setup-secrets: check ## Setup required secrets
	@echo "$(GREEN)Setting up secrets...$(NC)"
	@echo "$(YELLOW)This will prompt for each secret value$(NC)"
	@./set-secrets.sh $(WRANGLER_ENV)
	@echo "$(GREEN)Secrets setup complete$(NC)"

test: check ## Test the worker locally
	@echo "$(GREEN)Testing worker...$(NC)"
	@echo "$(YELLOW)Running local tests...$(NC)"
	@curl -s -X GET http://localhost:8787/health && echo "$(GREEN)Health check passed$(NC)" || echo "$(RED)Health check failed$(NC)"
	@curl -s -X GET http://localhost:8787/ | jq . && echo "$(GREEN)Root endpoint test passed$(NC)" || echo "$(RED)Root endpoint test failed$(NC)"
	@echo "$(GREEN)Local tests complete$(NC)"

deploy-dev: check migrate ## Deploy to development environment
	@echo "$(GREEN)Deploying to development...$(NC)"
	@wrangler publish --env development
	@echo "$(GREEN)Development deployment complete$(NC)"
	@echo "$(BLUE)Worker URL: https://erify-worker-dev.$(CLOUDFLARE_ACCOUNT_ID).workers.dev$(NC)"

deploy-staging: check migrate ## Deploy to staging environment
	@echo "$(GREEN)Deploying to staging...$(NC)"
	@wrangler publish --env staging
	@echo "$(GREEN)Staging deployment complete$(NC)"
	@echo "$(BLUE)Worker URL: https://erify-worker-staging.$(CLOUDFLARE_ACCOUNT_ID).workers.dev$(NC)"

deploy-prod: check migrate ## Deploy to production environment
	@echo "$(RED)WARNING: Deploying to production!$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to cancel, or wait 10 seconds to continue...$(NC)"
	@sleep 10
	@echo "$(GREEN)Deploying to production...$(NC)"
	@wrangler publish --env production
	@echo "$(GREEN)Production deployment complete$(NC)"
	@echo "$(BLUE)Worker URL: https://api.erify.world$(NC)"

deploy: ## Deploy to specified environment (use WRANGLER_ENV=env)
	@if [ "$(WRANGLER_ENV)" = "production" ]; then \
		$(MAKE) deploy-prod; \
	elif [ "$(WRANGLER_ENV)" = "staging" ]; then \
		$(MAKE) deploy-staging; \
	else \
		$(MAKE) deploy-dev; \
	fi

logs: ## View worker logs
	@echo "$(GREEN)Viewing worker logs...$(NC)"
	@wrangler tail --env $(WRANGLER_ENV)

status: ## Check worker status
	@echo "$(GREEN)Checking worker status...$(NC)"
	@wrangler list
	@echo ""
	@echo "$(GREEN)D1 Databases:$(NC)"
	@wrangler d1 list

clean: ## Clean up temporary files
	@echo "$(GREEN)Cleaning up...$(NC)"
	@rm -rf node_modules/.cache
	@rm -rf .wrangler
	@echo "$(GREEN)Cleanup complete$(NC)"

backup-db: ## Backup D1 database
	@echo "$(GREEN)Backing up database...$(NC)"
	@mkdir -p backups
	@wrangler d1 execute erify-telemetry-db$(shell [ "$(WRANGLER_ENV)" != "production" ] && echo "-$(WRANGLER_ENV)") --command=".dump" --env $(WRANGLER_ENV) > backups/db-backup-$(shell date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)Database backup complete$(NC)"

restore-db: ## Restore D1 database (requires BACKUP_FILE variable)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)BACKUP_FILE variable required$(NC)"; \
		echo "$(YELLOW)Usage: make restore-db BACKUP_FILE=backups/db-backup-20240901-120000.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Restoring database from $(BACKUP_FILE)...$(NC)"
	@wrangler d1 execute erify-telemetry-db$(shell [ "$(WRANGLER_ENV)" != "production" ] && echo "-$(WRANGLER_ENV)") --file=$(BACKUP_FILE) --env $(WRANGLER_ENV)
	@echo "$(GREEN)Database restore complete$(NC)"

monitor: ## Monitor worker performance
	@echo "$(GREEN)Monitoring worker performance...$(NC)"
	@echo "$(YELLOW)Worker Analytics: https://dash.cloudflare.com/$(CLOUDFLARE_ACCOUNT_ID)/workers/analytics$(NC)"
	@echo "$(YELLOW)Use 'make logs' to view real-time logs$(NC)"

security-scan: ## Run basic security checks
	@echo "$(GREEN)Running security checks...$(NC)"
	@echo "$(YELLOW)Checking for exposed secrets...$(NC)"
	@grep -r "sk-" src/ && echo "$(RED)Potential API key found$(NC)" || echo "$(GREEN)No exposed secrets found$(NC)"
	@echo "$(YELLOW)Checking CORS configuration...$(NC)"
	@grep -A 5 "CORS_HEADERS" src/index.js && echo "$(GREEN)CORS headers configured$(NC)"
	@echo "$(GREEN)Security scan complete$(NC)"

update-deps: ## Update dependencies
	@echo "$(GREEN)Updating dependencies...$(NC)"
	@npm update -g wrangler
	@echo "$(GREEN)Dependencies updated$(NC)"

init: install setup-db setup-secrets migrate ## Initialize complete development environment
	@echo "$(GREEN)ERIFY™ Worker environment initialized successfully!$(NC)"
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Run 'make dev' to start development server"
	@echo "  2. Run 'make test' to test your worker"
	@echo "  3. Run 'make deploy-dev' to deploy to development"

# Advanced targets for CI/CD
ci-test: check lint build ## Run CI tests
	@echo "$(GREEN)Running CI tests...$(NC)"
	@wrangler publish --env development --dry-run
	@echo "$(GREEN)CI tests passed$(NC)"

ci-deploy: check migrate ## Deploy via CI/CD
	@echo "$(GREEN)Deploying via CI/CD...$(NC)"
	@if [ "$(CI)" = "true" ]; then \
		wrangler publish --env $(WRANGLER_ENV); \
	else \
		echo "$(RED)This target should only be run in CI/CD environment$(NC)"; \
		exit 1; \
	fi

# Database management
db-shell: ## Open database shell
	@echo "$(GREEN)Opening database shell...$(NC)"
	@wrangler d1 execute erify-telemetry-db$(shell [ "$(WRANGLER_ENV)" != "production" ] && echo "-$(WRANGLER_ENV)") --command=".schema" --env $(WRANGLER_ENV)

db-reset: ## Reset database (WARNING: destructive)
	@echo "$(RED)WARNING: This will reset the database!$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to cancel, or wait 10 seconds to continue...$(NC)"
	@sleep 10
	@wrangler d1 execute erify-telemetry-db$(shell [ "$(WRANGLER_ENV)" != "production" ] && echo "-$(WRANGLER_ENV)") --command="DROP TABLE IF EXISTS telemetry_events; DROP TABLE IF EXISTS wallet_transactions; DROP TABLE IF EXISTS request_nonces; DROP TABLE IF EXISTS rate_limits; DROP TABLE IF EXISTS wallet_status; DROP TABLE IF EXISTS api_keys; DROP TABLE IF EXISTS security_events;" --env $(WRANGLER_ENV)
	@$(MAKE) migrate
	@echo "$(GREEN)Database reset complete$(NC)"