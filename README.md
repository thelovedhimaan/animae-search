# Animae Search

An anime discovery experience being rebuilt from an early React search
prototype into a production-grade platform for finding, comparing, and
understanding anime.

> **Status:** architecture approved and production rebuild starting. The current
> application is a 2021 proof of concept and uses the retired Jikan v3 API. It
> will be replaced rather than extended.

## Product direction

The goal is to go beyond title lookup and create a decision tool for anime
fans. Search and structured metadata will remain the foundation; contextual
recommendations, explainable comparisons, and spoiler-aware AI assistance will
make discovery substantially more useful.

Planned capabilities include:

- Fast search across titles, characters, studios, genres, seasons, and themes
- Rich title pages with rankings, streaming availability, relations, and staff
- Side-by-side comparisons and personal watchlists
- Recommendations that explain why two titles are related
- Natural-language discovery such as "short psychological anime without gore"
- Spoiler-aware summaries and question answering grounded in trusted sources
- Responsive, accessible UI with shareable filters and saved searches

## Current prototype

The existing code demonstrates React keyword search, Jikan API integration,
result cards, loading states, and basic pagination. It is retained as historical
context only. The rebuild will replace the legacy Create React App foundation
and obsolete API contract.

## Rebuild principles

1. **Search first:** excellent discovery must work without AI.
2. **Grounded AI:** generated answers must cite the underlying catalog data.
3. **No hidden spoilers:** spoiler level is an explicit user preference.
4. **Measure quality:** relevance, latency, accessibility, and recommendation
   quality require repeatable evaluation.
5. **Production evidence:** tests, CI, observability, architecture decisions,
   and a live deployment are part of the product.

## Legacy setup

The commands below run the historical prototype only:

```bash
npm install
npm start
```

## Next step

Implementation begins with the P0 foundation in
[docs/MVP_BACKLOG.md](./docs/MVP_BACKLOG.md). Read
[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the chosen React, Django,
PostgreSQL, Redis, Kafka, AI, AWS, Docker, and Jenkins design, and
[docs/LEARNING_GUIDE.md](./docs/LEARNING_GUIDE.md) for how the pieces connect.
