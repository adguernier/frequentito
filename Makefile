# Makefile for frequentito Next.js project

.PHONY: help

# Show this help message
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-10s\033[0m %s\n", $$1, $$2}'

install: ## Install npm dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build the project for production
	npm run build

start: ## Start production server
	npm run start

lint: ## Run ESLint with auto-fix
	npm run lint