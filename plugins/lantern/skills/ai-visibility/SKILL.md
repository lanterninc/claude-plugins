---
description: Use when the user asks about a brand's AI visibility, how often LLMs/AI assistants mention or recommend a brand, AI-referral traffic, or wants a visibility overview/snapshot across providers. Pulls live data from Lantern.
---

# Lantern AI visibility

You have Lantern MCP tools (prefixed `lantern` / `findings.*`) for AI-visibility data.

## Brand bootstrap (do this first)
If you don't already have the user's `accountBrandId` for this session, call `account-manager.get_brands` (no arguments) to list their brands as `{ id, name, slug, domains }`, show the names, and ask which one — or match the name they gave. Pass the chosen `accountBrandId` to every later call.

## Which tool
- Overall snapshot / "how visible are we": `findings.get_brand_overview` (brand; latest scores, top recommendations and analysis status).
- "What needs attention", or the headline figures the Overview shows: `findings.get_overview_attention` (brand; optional `days` 7, 30 or 90, default 30). Besides the attention items and how fresh the results are, it returns the three Overview figures for the window: the visibility score (0 to 100, the latest day with answers, with its change in points), presence (`mentionRate`, the share of answers that mention the brand, with the `mentions` and `answers` behind it) and average position (1 is first).
- How those figures moved day by day: `findings.get_brand_overview_trend` (brand; `days` 7, 30 or 90, or `end_date` for a past window; `prompt_ids` to limit it to some tracked prompts). One row per day tracking ran.
- The same figures for each AI assistant: `findings.get_brand_overview_trend_by_channel` (same inputs). An assistant that did not answer in the window is left out.
- Across all their brands: `findings.get_portfolio_overview` (account-scoped, no brand needed).
- AI-referral traffic: `findings.get_ai_traffic_insights` (brand).

## Presenting results
Lead with the story ("Across the assistants we track, Acme shows up most for X, rarely for Y…"), then the supporting numbers. Raw scores/percentages are fine — your audience is a technical operator. Never paste raw tool JSON. If a field comes back null, say it's "not available yet," not zero.

Reading the Overview figures:
- A day missing from a trend is a day tracking did not run, never a zero. Do not fill it in.
- The window's average position appears only once at least 8 answers rank the brand; before that it is null, so say there is not enough ranked data yet. Daily position has no minimum, so treat a single day's position from a handful of answers as anecdotal.
- A presence rate that rounds to 0% or 100% is not "none" or "all"; quote the `mentions` of `answers` behind it.
- Branded prompts (ones that name the brand) are not counted in any of these figures.
- When `dataThroughUnavailable` is true, the freshness date could not be read; do not quote `dataThrough`.
