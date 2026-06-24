---
description: Use when the user asks which sources, domains, or pages LLMs cite when answering about their brand or competitors, or wants citation telemetry explained. Pulls live data from Lantern.
---

# Lantern citations

You have Lantern MCP tools (`findings.*`) for citation data.

## Brand bootstrap (do this first)
If you don't have the session `accountBrandId`, call `findings.get_visibility_brands` (no args), show brand names, and ask/match. Thread the chosen id into every call.

## Which tool
- Citation telemetry for the brand: `findings.get_brand_citation_telemetry` (brand).
- A narrative explanation of that telemetry: `findings.explain_citation_telemetry` (brand) — prefer this when the user wants the "why."
- Competitor citation comparison: `findings.get_brand_competitor_citations` (brand) — also surfaced by the competitors skill.

## Presenting results
Lead with which sources matter and why, then the numbers. Real domains/sources by name. No raw JSON. Null fields = "not available yet."
