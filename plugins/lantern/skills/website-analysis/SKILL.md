---
description: Use when the user asks how AI-ready a website/domain is, wants the latest website AI-readiness analysis, checks whether an analysis has finished, or asks what recommended actions exist to improve. Pulls live data from Lantern.
---

# Lantern website AI-readiness

You have Lantern MCP tools (`findings.*`, plus `account-manager.get_brands` for brand lookup) for website analysis and the recommendation queue.

## Brand bootstrap (do this first)
If you don't have the session `accountBrandId`, call `account-manager.get_brands` (no args), show names, ask/match, thread the id through. Each brand's `domains` list is its tracked websites; use it to match a domain the user names.

## Which tool
- Readiness picture, latest scores, top recommendations and analysis status: `findings.get_brand_overview` (brand; the default summary detail answers most questions).
- Is an analysis finished or still running: the `findings.get_brand_overview` status.
- Fixes waiting for review: `findings.get_action_queue` (brand), then `findings.get_action_impact` (action) and `findings.get_action_metadata` (action) for detail on one.
- Before/after visuals for a recommendation: `findings.get_mockup`.

## Important
This is read-only. You can show the latest analysis, the recommendation queue and an action's estimated impact, but you cannot start an analysis, apply, publish, or edit anything: those happen in the Lantern dashboard. Analysis history and run-to-run diffs are no longer exposed over this connection; if asked, say so plainly and offer the latest analysis instead.

## Presenting results
Lead with what's strong/weak and the highest-impact next steps, then numbers. Describe recommendations by title and explanation, not score or rank. No raw JSON. If a field comes back null, say it's "not available yet," not zero.
