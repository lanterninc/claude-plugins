import { z } from 'zod';

// ---------------------------------------------------------------------------
// Marketplace schema
// ---------------------------------------------------------------------------

export const MarketplacePluginEntrySchema = z.object({
  name: z.string().min(1),
  source: z.string().min(1),
  description: z.string().min(1),
});

export const MarketplaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  owner: z.object({
    name: z.string().min(1),
    url: z.string().url(),
  }),
  plugins: z.array(MarketplacePluginEntrySchema).min(1),
});

export type Marketplace = z.infer<typeof MarketplaceSchema>;

// ---------------------------------------------------------------------------
// Plugin manifest schema
// ---------------------------------------------------------------------------

/** Loose semver — three numeric segments, optional pre-release/build. */
const SEMVER_RE = /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/;

export const PluginManifestSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  version: z.string().regex(SEMVER_RE, 'version must be a semver string (e.g. 1.2.3)'),
  author: z.object({
    name: z.string().min(1),
    url: z.string().url(),
  }),
  homepage: z.string().url().optional(),
  repository: z.string().optional(),
  license: z.string().min(1),
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;

// ---------------------------------------------------------------------------
// MCP config schema
// ---------------------------------------------------------------------------

/**
 * Matches the shell-substitution URL form used in .mcp.json:
 *   ${LANTERN_MCP_URL:-https://agent.lantern.is/agent/mcp}
 */
const MCP_URL_RE = /^\$\{LANTERN_MCP_URL:-https?:\/\/.+\}$/;

export const McpServerSchema = z.object({
  type: z.literal('http'),
  url: z.string().regex(MCP_URL_RE, 'url must be the ${LANTERN_MCP_URL:-<default>} form'),
});

export const McpConfigSchema = z.object({
  mcpServers: z.object({
    lantern: McpServerSchema,
  }),
});

export type McpConfig = z.infer<typeof McpConfigSchema>;

// ---------------------------------------------------------------------------
// Frontmatter schema
// ---------------------------------------------------------------------------

export const FrontmatterSchema = z.object({
  description: z
    .string()
    .min(1, 'description must be a non-empty string')
    .refine((s) => s.trim().length > 0, {
      message: 'description must not be whitespace-only',
    }),
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;

// ---------------------------------------------------------------------------
// Agent frontmatter schema
// ---------------------------------------------------------------------------

export const AgentFrontmatterSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  tools: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
});

export type AgentFrontmatter = z.infer<typeof AgentFrontmatterSchema>;
