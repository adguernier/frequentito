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

e2e: start-supabase db-reset seed ## Run headless e2e (Supabase ready; Playwright starts app)
	@echo "Running Playwright tests (headless)"
	npx playwright test

e2e-ui: start-supabase db-reset seed ## Run e2e in UI mode (Supabase ready; Playwright starts app)
	@echo "Running Playwright tests in UI mode"
	npx playwright test --ui

e2e-codegen: start-supabase db-reset seed ## Run Playwright codegen (Supabase ready; Playwright starts app)
	npx playwright codegen

e2e-stop: stop-supabase ## Stop local Supabase started for e2e