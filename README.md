# Anime Index

Anime Index is a production-oriented anime discovery platform. The active rebuild combines a modern Next.js interface with a Django API and a normalized catalogue designed to support search, title and character pages, regional viewing availability, personal libraries, community features, and grounded AI.

**Live AWS preview:** [Open Anime Index](https://anime-index.65-0-27-27.sslip.io)

The preview runs over HTTPS on a credit-backed EC2 deployment in `ap-south-1`. Caddy manages the certificate and redirects the original EC2 address. A branded domain can replace the free `sslip.io` hostname later.

## What works now

- Responsive discovery homepage with trending, current-season, top-rated, and upcoming shelves
- Shareable search URLs with title, genre, format, status, season, sort, and pagination controls
- Keyboard-accessible, debounced title autocomplete
- Character search and profiles with anime appearances and Japanese voice-actor credits
- Rich title pages with cast, Japanese voice actors, studios, official viewing links, personal actions, reviews, and a conversational catalogue assistant
- Native accounts, optional Google OAuth, account export/deletion, likes, watch later, visit history, and watching/completed/paused/dropped states
- Accessible route loaders, skeleton states, subtle page/card motion, and reduced-motion support
- Search metadata, canonical URLs, dynamic sitemap, robots rules, title/character structured data, breadcrumbs, social preview images, and an editorial source page
- Free Wikimedia catalogue adapter using CC0 Wikidata facts, attributed Wikipedia summaries, and per-file Commons licensing
- Anime Index-owned community ratings and activity-based trending instead of copied external platform scores
- Redis-backed response caching with an in-process development fallback
- Curated frontend fallback data when the API or upstream provider is unavailable
- PostgreSQL models for normalized titles, external provider identities, characters, and official viewing availability
- API validation, throttling, health checks, and contract tests
- Docker Compose environment for Next.js, Django, PostgreSQL with pgvector, Redis, and optional Kafka
- Credit-backed AWS preview running the complete container stack on one EC2 instance
- Jenkins pipeline prepared to test both services and publish immutable web/API images to Amazon ECR before a future ECS deployment

The original Create React App prototype remains in [`legacy/`](./legacy) for history. It is no longer the active application.

## Run the full stack

Docker is the recommended local setup because it supplies Python, PostgreSQL, and Redis consistently:

```bash
docker compose up --build
```

Open the web app at `http://localhost:3000`, the API at `http://localhost:8000/api/v1/discovery/home`, and the API health check at `http://localhost:8000/api/v1/health`.

Kafka is reserved for durable product events such as catalogue ingestion and notifications. It is deliberately excluded from the basic request path. Start it when developing event consumers:

```bash
docker compose --profile events up --build
```

## Run services separately

Frontend (Node 22.13 or newer):

```bash
cd web
npm install
npm run dev
```

API (Python 3.12 or newer):

```bash
cd backend
python -m venv .venv
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Copy [`.env.example`](./.env.example) for the available configuration variables. Secrets belong in local environment files, Jenkins credentials, or AWS Secrets Manager and must never be committed.

For model-backed, multi-turn title conversations, create a Gemini API key in Google AI Studio and set `GEMINI_API_KEY`. The default `gemini-3.5-flash-lite` model has a free tier; limits and data-use terms depend on the account and may change. `OPENAI_API_KEY` remains an optional fallback. Without either key, the assistant continues to answer common questions from the current Wikimedia record instead of failing.

Set `WIKIMEDIA_USER_AGENT` to a descriptive application name and working contact URL or email. Wikimedia requires identifiable API clients. The adapter caches responses, batches entity and media lookups, follows rate-limit responses, and exposes source and licence metadata to the interface.

For Google sign-in, create a Google OAuth web client and set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`. Register the exact callback shown in `.env.example` locally; in production use `https://YOUR_DOMAIN/api/account/google/callback`. Set `WEB_URL` and `NEXT_PUBLIC_SITE_URL` to the same public HTTPS origin.

## How the first data flow works

1. Next.js asks Django for a discovery shelf, search result, or title record.
2. Django checks Redis for a recent normalized response.
3. On a cache miss, the Wikimedia adapter queries Wikidata and batches related entity and Commons media lookups.
4. The adapter maps CC0 facts and licensed content into the stable Anime Index API contract while preserving provenance.
5. Django caches the result and returns it to Next.js.
6. If the API is down, Next.js renders a small labelled open-data snapshot instead of breaking the page.

PostgreSQL is the durable source for user and editorial data. Redis reduces latency and protects upstream quotas. Kafka carries asynchronous domain events; it is not used as a cache. Ratings and trending are calculated from Anime Index reviews, saves, and visits.

## Validation

```bash
cd web
npm run typecheck
npm run lint
npm run build

cd ../backend
python manage.py test
```

The repository root [`Jenkinsfile`](./Jenkinsfile) performs these checks inside containers, builds separate web and API images, publishes them to ECR, deploys staging, runs smoke tests, and requires an explicit gate before production promotion.

## Deployment status

The current MVP is deployed through the [`anime-index-mvp`](./infra/aws/README.md) CloudFormation stack on one EC2 instance, with Caddy providing HTTPS. This keeps infrastructure cost and operational overhead low while product behavior is still changing quickly. A branded domain, managed data services, and the ECS promotion path remain later scaling steps.

The next product milestone is the rest of the reliable discovery foundation: complete title and relationship data, character and studio pages, regional availability, autocomplete, and clearer loading and provider-degradation states. Accounts, community, and grounded AI build on that foundation.

## Product and architecture docs

- [Product definition](./docs/PRODUCT.md)
- [Architecture and decisions](./docs/ARCHITECTURE.md)
- [Prioritized MVP backlog](./docs/MVP_BACKLOG.md)
- [Jenkins and AWS setup](./docs/JENKINS.md)
- [Implementation learning guide](./docs/LEARNING_GUIDE.md)
- [Delivery roadmap](./ROADMAP.md)
- [Search visibility and indexing](./docs/SEARCH_VISIBILITY.md)

See the [prioritized MVP backlog](./docs/MVP_BACKLOG.md) for the product-first delivery order and the [roadmap](./ROADMAP.md) for the gates before the HTTPS and production-infrastructure phase.
