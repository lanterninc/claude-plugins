---
description: Use when the user wants to compare their brand against competitors on AI visibility or citations, or asks who they're losing/winning against in AI answers. Pulls live data from Lantern.
---

# Lantern competitors

You have Lantern MCP tools (`findings.*`) for competitive comparison.

## Brand bootstrap (do this first)
If you don't have the session `accountBrandId`, call `findings.get_visibility_brands` (no args), show names, ask/match, thread the id through.

## Which tool
- Cross-brand comparison (engine): `findings.compare_brands` (brand).
- Competitor citation comparison: `findings.get_brand_competitor_citations` (brand).

## Presenting results
Lead with the head-to-head story ("Against Competitor X you're ahead on A, behind on B…"), then numbers. Name real competitors. No raw JSON. Null = "not available yet."
