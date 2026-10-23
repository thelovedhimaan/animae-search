# Animae Search Rebuild Roadmap

This roadmap defines outcomes and decision gates. Architecture decisions are
recorded in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md), and delivery work is
prioritized in [docs/MVP_BACKLOG.md](./docs/MVP_BACKLOG.md).

## Phase 0 - Product and architecture decisions

- Define the primary user and top discovery journeys
- Decide MVP boundaries and non-goals
- Evaluate anime metadata, streaming, image, and availability data sources
- Define caching, attribution, rate-limit, and data-retention constraints
- Choose the frontend, API, search, database, AI, and deployment stack
- Define success metrics and an evaluation dataset

**Status:** complete. The product boundary, data strategy, stack, Jenkins/AWS
delivery model, success metrics, and prioritized backlog are documented.

**Exit condition:** architecture decisions remain reviewable as requirements
and provider constraints change.

## Phase 1 - Reliable discovery foundation

- Modern responsive application shell
- Search, filters, sorting, pagination, and shareable URLs
- Title detail pages and relationship graphs
- Loading, empty, degraded, and rate-limited states
- Accessibility and performance budgets
- Unit, integration, and end-to-end test foundations

**Status:** in progress. The responsive shell, four live discovery shelves,
shareable search filters, sorting, pagination, title routes, caching, health
checks, fallback states, and AWS preview are working. The current focus is title
relationships, studio pages, regional availability, autocomplete, and stronger
test and accessibility evidence. Character search, profiles, appearances, and
Japanese voice-actor credits are now implemented.

**Exit condition:** users can reliably discover and compare titles without AI.

## Phase 2 - Personal discovery

- Accounts and privacy-aware preferences
- Watchlist, completed list, ratings, and history
- Recommendation explanations and feedback
- Seasonal discovery and notification preferences

**Status:** started. Native email/password accounts, signed sessions, and title
ratings/reviews are implemented. Google OAuth, lists, history, preferences, and
recommendation feedback remain.

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

**Status:** a credit-backed HTTP preview is live on AWS. A stable domain, HTTPS,
managed deployment pipeline, production monitoring, and recovery evidence remain
deferred until the application has completed its core product milestones.

**Exit condition:** deployed application with operational evidence and a public
engineering case study.
