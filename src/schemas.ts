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
  // The name the Claude directory lists the plugin under. Unlike `name` it may
  // contain spaces, any casing and punctuation (e.g. "Lantern: Agentic Sales").
  displayName: z.string().trim().min(1).optional(),
  description: z.string().min(1),
  version: z.string().regex(SEMVER_RE, 'version must be a semver string (e.g. 1.2.3)'),
  author: z.object({
    name: z.string().min(1),
    url: z.string().url(),
  }),
  homepage: z.string().url().optional(),
  // Required for a Claude directory listing (the submission validator flags it).
  privacyPolicyUrl: z.string().url(),
  repository: z.string().optional(),
  license: z.string().min(1),
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;

// ---------------------------------------------------------------------------
// MCP config schema
// ---------------------------------------------------------------------------

/**
 * The shell-substitution URL form, which lets an engineer point the plugin at
 * staging or local:
 *   ${LANTERN_MCP_URL:-https://agent.lantern.is/agent/mcp}
 * The Claude directory refuses any url with a ${...} variable, so a plugin
 * submitted there must use a fixed url instead (see isFixedPublicUrl).
 */
const MCP_ENV_URL_RE = /^\$\{LANTERN_MCP_URL:-(https?:\/\/.+)\}$/;

/**
 * A url the Claude directory can read for certain: https, printable ASCII only,
 * no ${...} variable and no user name or password.
 */
export function isFixedPublicUrl(url: string): boolean {
  if (!/^[\x21-\x7e]+$/.test(url) || url.includes('${')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.username === '' && parsed.password === '';
  } catch {
    return false;
  }
}

/** The url a server connects to when LANTERN_MCP_URL is unset. */
export function mcpDefaultUrl(url: string): string {
  return MCP_ENV_URL_RE.exec(url)?.[1] ?? url;
}

export const McpServerSchema = z.object({
  type: z.literal('http'),
  url: z
    .string()
    .refine(
      (url) => MCP_ENV_URL_RE.test(url) || isFixedPublicUrl(url),
      'url must be a fixed https url or the ${LANTERN_MCP_URL:-<default>} form',
    ),
  // Optional pinned OAuth scopes (RFC 6749 space-separated). When present, the
  // client requests exactly this set instead of the server's default scope.
  oauth: z.object({ scopes: z.string().trim().min(1) }).optional(),
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
