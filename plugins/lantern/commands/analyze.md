---
description: "Show Lantern website AI-readiness for a domain. Usage: /lantern:analyze <domain>"
---

The user wants the website AI-readiness analysis for: "$ARGUMENTS".

1. Resolve the brand: call `account-manager.get_brands`; if the domain matches one of a brand's `domains`, use that brand's `id` as the `accountBrandId`. Ask if ambiguous, and if no brand tracks the domain, say so plainly (this command reads existing analyses; it does not start one).
2. Call `findings.get_brand_overview` for that brand: it returns the latest scores, top recommendations and the analysis status in one call. Add `findings.get_action_queue` for the fixes waiting for review.
3. Present what's strong/weak and the highest-impact next steps first, then numbers. This is read-only: point the user to the Lantern dashboard to run a new analysis or act on recommendations. Analysis history and run-to-run diffs are not available over this connection, so do not promise them.
