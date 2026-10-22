# Anime Index

Anime Index is a production-oriented anime discovery platform. The active rebuild combines a modern Next.js interface with a Django API and a normalized catalogue designed to support search, title and character pages, regional viewing availability, personal libraries, community features, and grounded AI.

## What works now

- Responsive discovery homepage, search results, character entry point, and title detail routes
- Live AniList GraphQL adapter for trending titles, search, and title details
- Redis-backed response caching with an in-process development fallback
- Curated frontend fallback data when the API or upstream provider is unavailable
- PostgreSQL models for normalized titles, external provider identities, characters, and official viewing availability
- API validation, throttling, health checks, and contract tests
- Docker Compose environment for Next.js, Django, PostgreSQL with pgvector, Redis, and optional Kafka
- Jenkins pipeline that tests both services and publishes immutable web/API images to Amazon ECR before ECS deployment

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

## How the first data flow works

1. Next.js asks Django for a discovery shelf, search result, or title record.
2. Django checks Redis for a recent normalized response.
3. On a cache miss, the AniList adapter sends a bounded GraphQL query.
4. The adapter maps provider fields into the stable Anime Index API contract.
5. Django caches the result and returns it to Next.js.
6. If the API is down, Next.js renders a small labelled preview dataset instead of breaking the page.

PostgreSQL is the durable source for user and editorial data. Redis reduces latency and protects upstream quotas. Kafka carries asynchronous domain events; it is not used as a cache. Provider ratings remain attributed instead of being merged into a misleading universal score.

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

## Product and architecture docs

- [Product definition](./docs/PRODUCT.md)
- [Architecture and decisions](./docs/ARCHITECTURE.md)
- [Prioritized MVP backlog](./docs/MVP_BACKLOG.md)
- [Jenkins and AWS setup](./docs/JENKINS.md)
- [Implementation learning guide](./docs/LEARNING_GUIDE.md)
- [Delivery roadmap](./ROADMAP.md)

The next implementation slice is identity and personal libraries: Google OAuth, watchlist states, ratings, privacy controls, and account export/deletion.
