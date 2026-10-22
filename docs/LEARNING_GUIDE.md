# How the Platform Fits Together

## Request path

The browser renders the React interface through Next.js. Public pages can be rendered on the server for fast loading and search indexing. Interactive actions call Django through `/api/v1`. Django validates identity and permissions, reads PostgreSQL, uses Redis for hot or temporary data, and returns a stable application-owned response instead of exposing upstream provider formats to the browser.

This adapter layer matters because AniList, Jikan, Wikimedia, and availability providers use different IDs, fields, limits, and freshness. Import workers translate them into one canonical model while preserving the original source and retrieval time.

## Storage

PostgreSQL stores durable truth. A `Title` represents the platform's anime record. `ExternalIdentity` maps it to provider IDs. `SourceSnapshot` preserves provenance and freshness. Lists, ratings, comments, moderation, and OAuth identities use normal relational tables. pgvector adds an embedding column for semantic retrieval while keeping citations connected to their source rows.

Redis stores data that is fast and disposable: cached responses, rate-limit counters, locks that prevent duplicate imports, short job state, and sessions. Losing Redis may reduce performance or require users to sign in again, but it must not erase catalogue or community data.

Kafka stores ordered event streams. Django commits business data to PostgreSQL and an outbox record in one transaction. A relay publishes that outbox event to Kafka. Consumers can update search indexes, analytics, recommendations, and notifications without slowing the user's request. Kafka does not replace PostgreSQL or Redis.

## AI flow

LangGraph represents AI work as a graph with explicit states. A natural-language request is parsed into validated search filters or a grounded Q&A task. Retrieval selects current catalogue rows and source chunks. The model drafts an answer. A verification node checks citations and spoiler scope. Metrics record the prompt version, model, tokens, cost, latency, and user feedback.

LangChain provides reusable model, retriever, and document interfaces where useful. LangGraph controls the application workflow. MCP exposes a small tool contract when an external agent needs safe access to catalogue operations. These tools complement each other and should not be layered together when a plain function is enough.

## Deployment flow

Developers push a branch to GitHub. Jenkins detects it from a multibranch job, checks out the exact commit, runs all checks, builds Docker images, and tags them with the commit SHA. On the main branch, Jenkins pushes those images to ECR and updates the staging ECS services. Smoke tests exercise search, title details, authentication callbacks, and health endpoints. A production promotion deploys the same immutable images; it never rebuilds different artifacts.

CloudFront caches public web and media responses at the edge. The load balancer routes dynamic traffic to ECS tasks. RDS operates PostgreSQL, ElastiCache operates Redis, S3 stores media, and managed Kafka can operate the event bus when enabled. Horizontal scaling adds tasks behind the load balancer without changing client URLs.

## Build order

We start with one Django application organized into domain modules and one Next.js application. This is a modular monolith: deployment is simple, but boundaries are explicit. Workers reuse the domain code. When a workload needs independent scaling, ownership, or release cadence, that boundary can become a service without rewriting the product model.

