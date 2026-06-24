# Lantern Claude Code plugin

Read-only Lantern data in Claude Code: AI-visibility, citations, product data
quality, and website AI-readiness. Pick a brand and ask.

## Install
```bash
claude plugin marketplace add lanterninc/claude-plugins
/plugin install lantern
/mcp                            # authenticate to Lantern
```

## Local development / testing
```bash
claude plugin validate ./plugins/lantern
claude --plugin-dir ./plugins/lantern      # load without installing
```

### Manual e2e checklist (run before each publish)
See `docs/e2e-checklist.md`.
