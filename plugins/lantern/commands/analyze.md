---
description: "Show Lantern website AI-readiness for a domain. Usage: /lantern:analyze <domain>"
---

The user wants the website AI-readiness analysis for: "$ARGUMENTS".

1. Resolve the brand: call `findings.get_visibility_brands`; if the domain maps to one of their brands' tracked domains (`findings.get_brand_domains`), use that brand's `accountBrandId`. Ask if ambiguous.
2. Call `findings.get_ai_readiness` and `findings.get_readiness_summary` (and `findings.get_domain_analysis` for the specific domain).
3. Present what's strong/weak and the highest-impact next steps first, then numbers. This is read-only — point the user to the Lantern dashboard to act on recommendations.
