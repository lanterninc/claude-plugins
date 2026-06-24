---
description: "Show a Lantern AI-visibility snapshot for a brand. Usage: /lantern:visibility <brand name or leave blank>"
---

The user wants an AI-visibility snapshot for: "$ARGUMENTS".

1. If "$ARGUMENTS" is empty or a name (not a UUID), call `findings.get_visibility_brands` and resolve it to an `accountBrandId` (ask if ambiguous).
2. Call `findings.get_brand_scores` and `findings.get_overview` for that brand; add `findings.get_overview_attention` for what needs attention.
3. Present narrative-led: the headline story first, then the supporting numbers. No raw JSON.
