# Quantus — bill of quantities

A small bill of quantities app: a NestJS + PostgreSQL REST API and a Vue frontend,
started with a single `docker compose up`.

## 1. How to run

Requirements: Docker with Docker Compose.

```sh
docker compose up --build
```

| What | URL |
|---|---|
| Frontend | http://localhost:8080 |
| API | http://localhost:3000 |

## 2. API endpoints

_To be filled in._

## 3. Data model & why

_To be filled in._

## 4. Decisions

- **Vitest instead of Jest:** Nest 12's generator ships Vitest and ES modules by default. Jest would need extra config for ES modules, and Vitest's `describe` / `it` / `expect` reads the same.

## 5. Assumptions

- The Postgres credentials in `compose.yaml` are local development values, so the project runs from a clean checkout without creating a `.env` file first.

## 6. Questions for imagineY

_To be filled in._

## 7. Future improvements

_To be filled in._

## 8. Time spent

- Started: 2026-09-25 10:38
