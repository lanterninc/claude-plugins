# lantern

Lantern measures how AI assistants talk about your brand. This plugin brings
that data into Claude Code: how visible your brand is in AI answers, which
sources those answers cite, how you compare with competitors, how your products
show up in AI shopping answers, and how AI-ready your website is.

The plugin is read-only. It reads your Lantern data and never publishes,
edits or applies anything in your Lantern account.

## Setup

1. You need a Lantern account (https://lantern.is) with access to at least one brand.
2. Install the plugin:
   ```bash
   claude plugin marketplace add lanterninc/claude-plugins
   /plugin install lantern
   ```
3. Run `/mcp`, choose `lantern`, and sign in. A browser opens on the Lantern
   consent page, where you log in and pick the brands Claude may read. The
   plugin connects to `https://agent.lantern.is/agent/mcp` over OAuth.

## Usage

Run `/lantern:brands` to pick a brand, then ask in plain language. The right
skill loads on its own. For example:

- "How visible is our brand in AI answers, and is it trending up?"
- "Which domains do AI assistants cite most when they answer about us?"
- "Who are we losing to in AI answers?"
- "Which of our products do AI shopping answers recommend?"
- "How AI-ready is example.com, and what should we fix first?"

| Command | What it shows |
| --- | --- |
| `/lantern:brands` | The brands you can access; pick one for the session |
| `/lantern:visibility [brand]` | An AI-visibility snapshot for a brand |
| `/lantern:products [brand]` | How a brand's products appear in AI shopping answers |
| `/lantern:analyze <domain>` | Website AI-readiness for a domain |

Skills: `ai-visibility`, `citations`, `competitors`, `product-quality` and
`website-analysis`. For questions that need several data pulls at once, the
`lantern-analyst` subagent gathers them and returns one summary.

## Privacy

Claude sees the Lantern data the plugin's tools return, for the brands you
granted at sign-in. Lantern's privacy policy: https://lantern.is/privacy
