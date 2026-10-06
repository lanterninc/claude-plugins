---
description: Use when the user asks how their products show up in AI shopping answers, which products AI recommends or links to their store, how one product is doing, or about product data quality. Pulls live data from Lantern.
---

# Lantern products

You have Lantern MCP tools (`findings.*`) for the Products page: how the brand's products appear in AI shopping answers.

## Brand bootstrap (do this first)
If you don't have the session `accountBrandId`, call `account-manager.get_brands` (no args), show names, ask/match, and thread the id through.

## Which tool
- The Products page summary: `findings.get_product_catalog_summary` (brand, `days` 7, 30 or 90, default 30). It covers how many of the brand's products AI recommended, how many tracked prompts named them, the share of their links that went to the brand's own site, the AI engines, competitors' products and the stores shoppers were sent to.
- The Products page list: `findings.get_products` (brand). Each product has a `product_id` or `product_key`.
- One product's detail: `findings.get_product_detail` (brand plus the `product_id` or `product_key` from `findings.get_products`).
- Shopify product overview (engine): `findings.get_brand_overview` (brand).
- A product mockup (engine): `findings.get_mockup` (brand) — only when the user wants a visual mockup.

## Product data quality
Per-product data-quality scores and grades are no longer available over MCP. Say so plainly and do not estimate them; offer how the products appear in AI answers instead.

## Presenting results
Lead with the story ("AI recommends three of your products, and most links go to retailers rather than your store…"), then numbers. No raw JSON. A window with no finished prompt run is not measured: say so, never report it as zero.
