---
description: Use when the user asks how AI-ready a website/domain is, wants a website AI-readiness analysis or its history/diff, checks an analysis run's status, or asks what recommended actions exist to improve. Pulls live data from Lantern.
---

# Lantern website AI-readiness

You have Lantern MCP tools (`findings.*`) for website analysis and the recommendation queue.

## Brand bootstrap (do this first)
If you don't have the session `accountBrandId`, call `findings.get_visibility_brands` (no args), show names, ask/match, thread the id through. For a specific domain, also use `findings.get_brand_domains` (brand) to find tracked domains.

## Which tool
- Readiness score + summary: `findings.get_ai_readiness` (brand), `findings.get_readiness_summary` (brand).
- Domain detail: `findings.get_domain_analysis` (brand/domain), `findings.get_brand_domains` (brand).
- History & change: `findings.get_analysis_history` (brand), `findings.get_analysis_diff` (brand).
- Run status: `findings.check_analysis_status` (brand).
- Recommendations / actions: `findings.get_action_queue` (brand), `findings.get_action_impact` (action), `findings.get_action_metadata` (action).

## Important
This is read-only. You can show the recommendation queue and an action's estimated impact, but you cannot apply, publish, or edit anything — those happen in the Lantern dashboard. If the user wants to act, point them there.

## Presenting results
Lead with what's strong/weak and the highest-impact next steps, then numbers. No raw JSON. Note: `get_brand_domains` currently returns null scores — present domains without implying a zero score.
