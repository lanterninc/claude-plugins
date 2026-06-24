---
description: Use when the user asks about a brand's AI visibility, how often LLMs/AI assistants mention or recommend a brand, AI-referral traffic, or wants a visibility overview/snapshot across providers. Pulls live data from Lantern.
---

# Lantern AI visibility

You have Lantern MCP tools (prefixed `lantern` / `findings.*`) for AI-visibility data.

## Brand bootstrap (do this first)
If you don't already have the user's `accountBrandId` for this session, call `findings.get_visibility_brands` (no arguments) to list their brands as `{ id, name }`, show the names, and ask which one — or match the name they gave. Pass the chosen `accountBrandId` to every later call.

## Which tool
- Overall snapshot / "how visible are we": `findings.get_brand_scores` (brand), `findings.get_overview` (brand).
- "What needs attention": `findings.get_overview_attention` (brand).
- Across all their brands: `findings.get_portfolio_overview` (account-scoped, no brand needed).
- AI-referral traffic: `findings.get_ai_traffic_data` (brand).

## Presenting results
Lead with the story ("Across the assistants we track, Acme shows up most for X, rarely for Y…"), then the supporting numbers. Raw scores/percentages are fine — your audience is a technical operator. Never paste raw tool JSON. If a field comes back null, say it's "not available yet," not zero.
