.PHONY: dev build build-local test test-coverage e2e typecheck lint lint-fix format format-check help

default: help

help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "\n\033[1mAvailable targets:\033[0m\n"} /^[a-zA-Z0-9_-]+:.*##/ { printf "  %-16s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

dev: ## Start the development server
	npm run dev

build: ## Build the Docker image (canonical build)
	./build/build.sh

build-local: ## Build for production locally (tsc + vite)
	npm run build

test: ## Run unit and component tests
	npm run test

test-coverage: ## Run unit and component tests with coverage report
	npm run test:coverage

e2e: ## Run end-to-end tests (Playwright)
	npm run e2e

typecheck: ## Run TypeScript type checking
	npm run typecheck

lint: ## Run ESLint
	npm run lint

lint-fix: ## Run ESLint and auto-fix issues
	npm run lint:fix

format: ## Format source files with Prettier
	npm run format

format-check: ## Check source files are formatted correctly
	npm run format:check
