# Product Definition

## Primary users

1. A viewer deciding what to watch next.
2. A fan exploring characters, staff, timelines, relationships, music, artwork, and theories.
3. A returning member maintaining lists, ratings, discussions, and recommendation preferences.

## Core journeys

- Search a title, alternate title, character, studio, genre, season, theme, or staff member.
- Explore trending, seasonal, top-rated, newly available, free-to-watch, and hidden-gem collections.
- Open a title page and compare synopsis, relations, characters, staff, episodes, ratings, availability, music, artwork, and sources.
- Follow a relation graph across seasons, adaptations, side stories, and shared universes.
- Ask a spoiler-aware question and inspect citations.
- Save, rate, review, discuss, and receive relevant seasonal or availability notifications.

## MVP

- Responsive public home, search, browse, title, character, studio, and season pages.
- Filters for format, status, season, year, genre, theme, age rating, episode count, score, and legal availability.
- Sort by relevance, popularity, score, recency, and title.
- Provider-attributed scores and freshness labels.
- Region-aware official availability links.
- Google sign-in, watchlist, completed list, favorites, and Anime Search ratings.
- Loading, empty, stale, rate-limited, and provider-degraded states.
- Accessible keyboard navigation, reduced motion, responsive images, and SEO metadata.

## Later releases

- Comment threads, clubs, direct chat, moderation reputation, fan theories, and spoiler controls.
- Licensed wallpaper galleries and official BGM/video embeds.
- Natural-language discovery, source-grounded Q&A, personalized recommendations, and conversational history.
- Native notifications, calendar integrations, richer social graphs, and creator dashboards.

## Explicit non-goals

- Hosting or linking pirated streams.
- Re-hosting copyrighted music, video, or artwork without permission.
- Presenting generated claims without sources.
- Combining external ratings into a misleading single score.
- Starting with microservices solely for appearance; boundaries must follow measured operational needs.

## Success metrics

| Area | Initial target |
| --- | --- |
| Search success | At least 85% of evaluation queries produce a relevant result in the first five |
| Search latency | Cached p95 below 300 ms; uncached p95 below 900 ms |
| Page performance | LCP below 2.5 s at p75 on mobile |
| Accessibility | No serious automated violations; complete keyboard journeys |
| Availability | Every displayed offer has region, source, and verification time |
| AI citation | Every factual paragraph has at least one supporting source |
| Spoiler safety | No known-spoiler leakage across the agreed evaluation set |

