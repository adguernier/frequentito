# Makefile for frequentito Next.js project

.PHONY: help

# Show this help message
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-10s\033[0m %s\n", $$1, $$2}'

install: ## Install npm dependencies
	npm install

start-app: ## Start development server
	npm run dev

build: ## Build the project for production
	npm run build

start: start-supabase start-app ## start the stack locally

start-prod: start-supabase build ## Build and start the project
	npm run start

lint: ## Run ESLint with auto-fix
	npm run lint

seed-init: ## Initialize Snaplet Seed client
	npx @snaplet/seed init

seed-sync: ## Sync Snaplet Seed client with database schema
	npx @snaplet/seed sync

seed: ## Seed the database with sample data
	npx tsx seed.ts

start-supabase: ## start supabase locally
	npx supabase start

stop-supabase: ## stop local supabase
	npx supabase stop

stop: stop-supabase ## stop the stack locally

db-reset: ## Reset the database
	npx supabase db reset

apply-migrations: ## Apply all pending migrations
	npx supabase migration up

storybook: ## Start Storybook
	npm run storybook

test: ## Run tests with Storybook
	npm run test-storybook

e2e: start-supabase  ## Run headless e2e (Chromium + Firefox only)
	@echo "Running Playwright tests (headless)"
	npx playwright test --project=chromium --project=firefox

e2e-chromium: start-supabase ## Run headless e2e (Chromium only)
	@echo "Running Playwright tests on Chromium only (headless)"
	npx playwright test --project=chromium

e2e-ui: start-supabase ## Run e2e in UI mode (Chromium + Firefox only)
	@echo "Running Playwright tests in UI mode"
	npx playwright test --ui --project=chromium