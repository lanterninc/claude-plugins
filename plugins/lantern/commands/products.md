---
description: "Show a Lantern product data-quality summary for a brand. Usage: /lantern:products <brand name or leave blank>"
---

The user wants a product data-quality summary for: "$ARGUMENTS".

1. If "$ARGUMENTS" is empty or a name, resolve to `accountBrandId` via `findings.get_visibility_brands` (ask if ambiguous).
2. Call `findings.get_product_catalog_summary` (and `findings.get_products` for specifics).
3. Present the catalog story first, then numbers. No raw JSON.
