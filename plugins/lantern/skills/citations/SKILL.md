---
description: Use when the user asks which sources, domains, or pages AI assistants cite when answering about their brand or competitors, how citations are changing, or wants the cited pages listed or exported. Pulls live data from Lantern.
---

# Lantern citations

You have Lantern MCP tools (`findings.*`) for citation data.

## Brand bootstrap (do this first)
If you don't have the session `accountBrandId`, call `account-manager.get_brands` (no args), show brand names, and ask/match. Thread the chosen id into every call.

## Which tool
- The cited pages, as the Citations page lists them: `findings.get_citations` (brand). Each page has its site, title, citation count, share, when it was last seen, and whether it is the brand's own page, a competitor's, social media or an article.
- How citations are moving: `findings.get_citation_trend` (brand): the top cited sites and pages with the change across the window, plus the brand's own pages. It shows which sites and pages moved, not why they moved.
- Which AI assistant cited what: `findings.get_citations_by_channel` gives each assistant that answered in the window its own totals and most cited pages; `findings.get_citation_trend_by_channel` gives each assistant its own trend. An assistant that answered but cited nothing shows zeros; one that did not answer in the window is not listed, so do not report it as citing nothing. "ChatGPT" is the ChatGPT app and "ChatGPT (API)" is OpenAI's API; keep them separate.
- There is no file export. When asked to export, give the list from `findings.get_citations` and point to the Citations page for the full table.

## Windows
- Every citation tool covers the last 7, 30 or 90 days (`days`, default 30) ending on the brand's last finished day of results.
- For a period that ends earlier, add `end_date` (YYYY-MM-DD): the window is the `days` days ending on that date. To compare two periods, make one call per period.
- When the response says the end was moved back (`endClamped`), say which day the results actually end on.

## More pages
- `findings.get_citations` returns up to 50 pages per call (`limit`, default 25). When `has_more` is true, call again with `offset` set to `next_offset` to get the next pages.
- For one assistant's pages, call `findings.get_citations_by_channel` with its `channel` and `offset`. An entry marked `pageable: false` cannot be paged.

## Presenting results
Lead with which sources matter, then the numbers. Describe changes as trends: the tools do not say why a citation rose or fell, so do not offer a cause. Real domains/sources by name. No raw JSON. Null fields = "not available yet."
