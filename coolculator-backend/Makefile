.PHONY: run build test test-unit test-integration swagger tidy fmt vet lint docker-build docker-run

# cmd/api blank-imports the generated docs package, and docs/ isn't
# committed (see .gitignore) — so anything that builds or tests the module
# needs Swagger generated first. Cheap to regenerate; keeps the annotations
# as the single source of truth instead of a committed, driftable copy.
run: swagger ## Run the API locally
	go run ./cmd/api

build: swagger ## Build the API binary
	go build -o bin/coolculator-backend ./cmd/api

test: test-unit test-integration ## Unit tests, then integration tests — matches the CI order

test-unit: swagger ## Fast, isolated tests (no HTTP server, no build tag)
	go test ./... -cover -coverprofile=coverage.out

test-integration: swagger ## Black-box API tests against a real, in-process server
	go test ./test/integration/... -tags=integration -v

swagger: ## Regenerate the OpenAPI spec from handler annotations
	go tool swag init -g cmd/api/main.go -o docs

tidy: ## Sync go.mod/go.sum with actual imports
	go mod tidy

fmt: ## Format all source files
	gofmt -l -w .

vet: ## Static analysis
	go vet ./...

lint: fmt vet ## Format + vet (swap in golangci-lint here if/when it's added)

docker-build: ## Build the standalone image (swag regeneration happens inside the build)
	docker build \
		--build-arg VERSION=$${VERSION:-dev} \
		--build-arg COMMIT=$${COMMIT:-unknown} \
		--build-arg BUILD_TIME=$$(date -u +%Y-%m-%dT%H:%M:%SZ) \
		-t coolculator-backend:local .

docker-run: ## Run the image built by docker-build, mapped to :8080
	docker run --rm -p 8080:8080 --name coolculator-backend coolculator-backend:local
