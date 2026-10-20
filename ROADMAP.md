# Animae Search Rebuild Roadmap

This roadmap defines outcomes and decision gates. It intentionally does not
select implementation tools yet.

## Phase 0 - Product and architecture decisions

- Define the primary user and top discovery journeys
- Decide MVP boundaries and non-goals
- Evaluate anime metadata, streaming, image, and availability data sources
- Define caching, attribution, rate-limit, and data-retention constraints
- Choose the frontend, API, search, database, AI, and deployment stack
- Define success metrics and an evaluation dataset

**Exit condition:** an approved architecture decision record and prioritized
MVP backlog.

## Phase 1 - Reliable discovery foundation

- Modern responsive application shell
- Search, filters, sorting, pagination, and shareable URLs
- Title detail pages and relationship graphs
- Loading, empty, degraded, and rate-limited states
- Accessibility and performance budgets
- Unit, integration, and end-to-end test foundations

**Exit condition:** users can reliably discover and compare titles without AI.

## Phase 2 - Personal discovery

- Accounts and privacy-aware preferences
- Watchlist, completed list, ratings, and history
- Recommendation explanations and feedback
- Seasonal discovery and notification preferences

**Exit condition:** recommendations improve using explicit user signals.

## Phase 3 - Grounded AI

- Natural-language search translated into structured filters
- Spoiler-aware summaries and question answering
- Retrieval with source citations and freshness metadata
- Prompt/version tracking, evaluation, cost controls, and fallback behavior
- Safety and abuse testing

**Exit condition:** AI features pass agreed relevance, citation, latency, cost,
and spoiler-safety thresholds.

## Phase 4 - Production launch

- CI/CD, preview environments, monitoring, and alerting
- Error, latency, search-quality, and AI-quality dashboards
- SEO, social cards, sitemap, and structured metadata
- Security review, rate limiting, backups, and recovery documentation
- Public architecture case study and performance report

**Exit condition:** deployed application with operational evidence and a public
engineering case study.
