# Prioritized MVP Backlog

## P0: foundation

- [x] Replace Create React App with a Next.js TypeScript application.
- [x] Create a Django/DRF project with versioned `/api/v1` routes.
- [x] Add Docker Compose for web, API, worker, PostgreSQL, Redis, and optional Kafka.
- [x] Add environment validation, health checks, throttling, and API contract tests.
- [x] Model provider identities so one anime can map to multiple data sources.
- [x] Add a live Wikimedia adapter with normalized CC0 facts, licensed-media attribution, Redis caching, and graceful fallback behavior.
- [x] Add an AWS CloudFormation deployment for the credit-backed MVP preview.
- [ ] Complete OpenAPI coverage, structured logging, request IDs, import retries, and provenance records.
- [ ] Activate the Jenkins ECR/ECS promotion path when the product is ready for managed environments.

## P1: public discovery

**Current delivery focus.** Complete these user-facing flows before expanding the deployment architecture.

- [x] Homepage shelves for trending, current season, top rated, and upcoming titles.
- [ ] Add recently updated and legally free shelves when their source and regional rules are defined.
- [x] Search with shareable URL-backed filters, sorting, and pagination.
- [x] Add search autocomplete and keyboard interaction.
- [x] Title pages with attributed ratings, relationships, characters, studios, trailers, and official catalogue links.
- [x] Character index, search, pagination, profiles, anime appearances, and Japanese voice actors.
- [ ] Person, studio, genre, theme, and season pages.
- Responsive skeletons, empty states, provider degradation, and rate-limit messaging.
- [x] Sitemap, canonical links, structured title data, and social metadata.

## P2: accounts and personalization

- [x] Google OAuth code path, signed sessions, account export, and deletion. Credentials and HTTPS callback remain deployment configuration.
- [x] Watch later, watching, completed, paused, dropped, likes, ratings, reviews, and visit history.
- Recommendation feedback and explanation components.
- Notification preferences for episodes, seasons, and verified availability changes.

## P3: community

- Reviews, comments, replies, spoiler tags, reactions, reports, blocks, and moderation tools.
- Fan-theory spaces with source links and explicit spoiler scopes.
- Real-time chat only after abuse controls, retention rules, and moderation capacity are ready.

## P4: grounded AI

- Source ingestion, chunk provenance, embeddings, retrieval filters, and evaluation fixtures.
- Natural-language query-to-filter translation.
- Spoiler-aware title and character Q&A with citations and freshness metadata.
- Per-user quotas, cost budgets, fallbacks, prompt registry, traces, and quality dashboards.
- Narrow MCP tools for catalogue retrieval; no general database or network access.

## P5: scale and launch

- Load tests and capacity model for search, title pages, imports, comments, and AI.
- Activate OpenSearch or Kafka only when their decision gates are met.
- AWS production infrastructure, backup restoration exercise, alarms, runbooks, and incident drills.
- Public architecture case study with measured accessibility, performance, reliability, and search quality.
- [x] HTTPS certificate, HTTP redirects, and security headers. A branded domain remains optional.

