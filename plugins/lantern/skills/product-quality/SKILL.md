---
description: Use when the user asks about Shopify product data quality, how complete or AI-ready their product catalog is, per-product issues, or wants a catalog quality summary. Pulls live data from Lantern.
---

# Lantern product data quality

You have Lantern MCP tools (`findings.*`) for product-quality data.

## Brand bootstrap (do this first)
If you don't have the session `accountBrandId`, call `findings.get_visibility_brands` (no args), show names, ask/match, and thread the id through.

## Which tool
- Catalog-level summary: `findings.get_product_catalog_summary` (brand).
- Product list with quality signals: `findings.get_products` (brand).
- A single product's analysis: `findings.get_product_analysis` (brand + product).
- Shopify product overview (engine): `findings.get_brand_overview` (brand).
- A product mockup (engine): `findings.get_mockup` (brand) — only when the user wants a visual mockup.

## Presenting results
Lead with the catalog story ("Most products are missing structured X, which is what assistants read…"), then numbers. No raw JSON. Null = "not available yet."
