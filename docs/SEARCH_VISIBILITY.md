# Search visibility and indexing

Anime Index renders its important catalogue text on the server and exposes canonical URLs, descriptive metadata, a dynamic sitemap, robots rules, social preview images, and schema.org data for the site, breadcrumbs, titles, and characters. Internal search result pages are excluded from indexing while their title links remain crawlable.

Google states that AI Overviews and AI Mode use the normal Search eligibility and SEO fundamentals. There is no separate AI schema or machine-readable AI file required. Useful textual content, crawl access, internal links, page experience, matching structured data, and clear source attribution are the durable approach.

## Owner setup after HTTPS is active

1. Set `NEXT_PUBLIC_SITE_URL` and `WEB_URL` to the canonical HTTPS origin and rebuild the web image.
2. Verify the domain property in [Google Search Console](https://search.google.com/search-console/about).
3. Submit `https://YOUR_DOMAIN/sitemap.xml` and inspect representative homepage, title, character, and about URLs.
4. Test title and character pages with Google's [Rich Results Test](https://search.google.com/test/rich-results).
5. Register the site in [Bing Webmaster Tools](https://www.bing.com/webmasters/about) and submit the same sitemap.
6. Monitor indexed pages, crawl errors, Core Web Vitals, search queries, and structured-data warnings. Fix evidence-backed issues rather than adding keyword repetition.

Search engines decide crawling, indexing, and ranking. These changes make the site understandable and eligible; they do not guarantee a specific position.

## References

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: Search appearance and structured data](https://developers.google.com/search/docs/appearance)
- [Google: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
