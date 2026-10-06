---
description: "Show how a brand's products appear in AI shopping answers, as the Lantern Products page shows it. Usage: /lantern:products <brand name or leave blank>"
---

The user wants the Products summary for: "$ARGUMENTS".

1. If "$ARGUMENTS" is empty or a name, resolve to `accountBrandId` via `account-manager.get_brands` (ask if ambiguous).
2. Call `findings.get_product_catalog_summary` (and `findings.get_products` for the list, `findings.get_product_detail` for one product).
3. Present the story first, then numbers. No raw JSON. Product data-quality grades are no longer available over MCP; say so if asked.
