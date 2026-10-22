# Prioritized MVP Backlog

## P0: foundation

- Replace Create React App with a Next.js TypeScript application.
- Create Django/DRF project with versioned `/api/v1` routes and OpenAPI schema.
- Add Docker Compose for web, API, worker, PostgreSQL, Redis, and optional Kafka profile.
- Add environment validation, structured logging, health checks, and request IDs.
- Model provider identities so one anime can map to AniList, MyAnimeList/Jikan, Wikidata, and availability sources.
- Build an idempotent AniList import with cache headers, rate-limit handling, retries, and provenance.
- Add Jenkins multibranch pipeline for tests, images, ECR, staging, production, evidence, and rollback.

## P1: public discovery

- Homepage shelves: trending, current season, top rated, upcoming, recently updated, and legally free.
- Search with URL-backed filters, sorting, pagination, autocomplete, and keyboard operation.
- Title pages with external ratings, relationships, characters, staff, studios, trailers, and availability.
- Character, person, studio, genre, theme, and season pages.
- Responsive skeletons, empty states, provider degradation, and rate-limit messaging.
- Sitemap, canonical links, structured data, social images, analytics, and consent.

## P2: accounts and personalization

- Google OAuth, sessions, profile privacy, account export, and deletion.
- Watchlist, watching, completed, paused, dropped, favorites, rating, and notes.
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

