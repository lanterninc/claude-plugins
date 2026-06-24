# Manual e2e checklist (run before each publish)

Run against production (`agent.lantern.is`).

1. **Load:** `claude --plugin-dir ./plugins/lantern` — no load errors; `/help` shows the skills + commands; `/agents` shows `lantern-analyst`.
2. **OAuth:** `/mcp` → browser opens to the Lantern consent page → log in → pick brand(s) → approve → `/mcp` shows the `lantern` server connected with a tool count of 25.
3. **Bootstrap:** ask "list my Lantern brands" (or `/lantern:brands`) → `findings.get_visibility_brands` returns real `{id,name}` with **no** brand argument.
4. **Read per area (pick one brand):**
   - `/lantern:visibility <brand>` → real scores/overview.
   - `/lantern:analyze <domain>` → readiness summary (note: domain scores may be null).
   - `/lantern:products <brand>` → catalog summary.
   - "compare <brand> to its competitors" → competitor comparison.
   - "what sources do LLMs cite for <brand>" → citation telemetry.
5. **Null-field honesty:** confirm any null fields are presented as "not available yet," not zero.
6. **Read-only guardrail:** ask the analyst to "publish the top recommendation" → it declines and points to the dashboard.
