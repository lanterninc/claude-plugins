---
description: Use when the user asks which sources, domains, or pages AI assistants cite when answering about their brand or competitors, how citations are changing, or wants the cited pages listed or exported. Pulls live data from Lantern.
---

# Lantern citations

You have Lantern MCP tools (`findings.*`) for citation data.

## Brand bootstrap (do this first)
If you don't have the session `accountBrandId`, call `account-manager.get_brands` (no args), show brand names, and ask/match. Thread the chosen id into every call.

## Which tool
- The cited pages, as the Citations page lists them: `findings.get_citations` (brand, `days` 7, 30 or 90, default 30). Each page has its site, title, citation count, share, when it was last seen, and whether it is the brand's own page, a competitor's, social media or an article.
- How citations are moving: `findings.get_citation_trend` (brand, `days`): the top cited sites and pages with the change across the window, plus the brand's own pages. Prefer this when the user wants the "why."
- There is no file export. When asked to export, give the list from `findings.get_citations` and point to the Citations page for the full table.

## Presenting results
Lead with which sources matter and why, then the numbers. Real domains/sources by name. No raw JSON. Null fields = "not available yet."
