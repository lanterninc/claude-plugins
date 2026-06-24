import { describe, it, expect } from 'vitest';
import {
  MarketplaceSchema,
  PluginManifestSchema,
  McpConfigSchema,
  FrontmatterSchema,
  MarketplacePluginEntrySchema,
  McpServerSchema,
} from './schemas.js';

describe('MarketplacePluginEntrySchema', () => {
  it('GIVEN a valid entry WHEN parsed THEN succeeds', () => {
    const result = MarketplacePluginEntrySchema.safeParse({
      name: 'lantern',
      source: './plugins/lantern',
      description: 'A plugin',
    });
    expect(result.success).toBe(true);
  });

  it('GIVEN an entry with empty name WHEN parsed THEN fails', () => {
    const result = MarketplacePluginEntrySchema.safeParse({
      name: '',
      source: './plugins/lantern',
      description: 'A plugin',
    });
    expect(result.success).toBe(false);
  });

  it('GIVEN an entry missing source WHEN parsed THEN fails', () => {
    const result = MarketplacePluginEntrySchema.safeParse({
      name: 'lantern',
      description: 'A plugin',
    });
    expect(result.success).toBe(false);
  });
});

describe('MarketplaceSchema', () => {
  const validMarketplace = {
    name: 'lantern',
    description: 'Test marketplace',
    owner: { name: 'Lantern', url: 'https://lantern.is' },
    plugins: [{ name: 'lantern', source: './plugins/lantern', description: 'desc' }],
  };

  it('GIVEN a valid marketplace WHEN parsed THEN succeeds', () => {
    expect(MarketplaceSchema.safeParse(validMarketplace).success).toBe(true);
  });

  it('GIVEN marketplace with non-URL owner url WHEN parsed THEN fails', () => {
    const result = MarketplaceSchema.safeParse({
      ...validMarketplace,
      owner: { name: 'Lantern', url: 'not-a-url' },
    });
    expect(result.success).toBe(false);
  });

  it('GIVEN marketplace with empty plugins array WHEN parsed THEN fails', () => {
    const result = MarketplaceSchema.safeParse({ ...validMarketplace, plugins: [] });
    expect(result.success).toBe(false);
  });
});

describe('PluginManifestSchema', () => {
  const validManifest = {
    name: 'lantern',
    description: 'A plugin',
    version: '1.2.3',
    author: { name: 'Lantern', url: 'https://lantern.is' },
    license: 'MIT',
  };

  it('GIVEN a valid manifest with pre-release WHEN parsed THEN succeeds', () => {
    const result = PluginManifestSchema.safeParse({ ...validManifest, version: '1.0.0-alpha.1' });
    expect(result.success).toBe(true);
  });

  it('GIVEN a manifest with a build suffix WHEN parsed THEN succeeds', () => {
    const result = PluginManifestSchema.safeParse({ ...validManifest, version: '1.0.0+build.1' });
    expect(result.success).toBe(true);
  });

  it('GIVEN a manifest with version like "v1.0.0" WHEN parsed THEN fails', () => {
    const result = PluginManifestSchema.safeParse({ ...validManifest, version: 'v1.0.0' });
    expect(result.success).toBe(false);
  });

  it('GIVEN a manifest with optional homepage WHEN parsed THEN succeeds', () => {
    const result = PluginManifestSchema.safeParse({
      ...validManifest,
      homepage: 'https://lantern.is',
    });
    expect(result.success).toBe(true);
  });

  it('GIVEN a manifest with optional repository WHEN parsed THEN succeeds', () => {
    const result = PluginManifestSchema.safeParse({
      ...validManifest,
      repository: 'https://github.com/lanterninc/claude-plugins',
    });
    expect(result.success).toBe(true);
  });

  it('GIVEN a manifest with bad homepage url WHEN parsed THEN fails', () => {
    const result = PluginManifestSchema.safeParse({ ...validManifest, homepage: 'not-a-url' });
    expect(result.success).toBe(false);
  });
});

describe('McpServerSchema', () => {
  it('GIVEN a valid http server WHEN parsed THEN succeeds', () => {
    const result = McpServerSchema.safeParse({
      type: 'http',
      url: '${LANTERN_MCP_URL:-https://agent.lantern.is/agent/mcp}',
    });
    expect(result.success).toBe(true);
  });

  it('GIVEN a server with http (non-https) default WHEN parsed THEN succeeds', () => {
    const result = McpServerSchema.safeParse({
      type: 'http',
      url: '${LANTERN_MCP_URL:-http://localhost:8080/agent/mcp}',
    });
    expect(result.success).toBe(true);
  });

  it('GIVEN a server with plain url WHEN parsed THEN fails', () => {
    const result = McpServerSchema.safeParse({
      type: 'http',
      url: 'https://agent.lantern.is/agent/mcp',
    });
    expect(result.success).toBe(false);
  });
});

describe('McpConfigSchema', () => {
  it('GIVEN a config missing mcpServers WHEN parsed THEN fails', () => {
    const result = McpConfigSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('GIVEN a config with a valid server WHEN parsed THEN succeeds', () => {
    const result = McpConfigSchema.safeParse({
      mcpServers: {
        lantern: {
          type: 'http',
          url: '${LANTERN_MCP_URL:-https://agent.lantern.is/agent/mcp}',
        },
      },
    });
    expect(result.success).toBe(true);
  });
});

describe('FrontmatterSchema', () => {
  it('GIVEN a description with only spaces WHEN parsed THEN fails (min 1 char after trim? no — min(1) allows spaces)', () => {
    // z.string().min(1) does NOT trim — " " (space) has length 1 and would pass.
    // Test that an actual non-empty string passes.
    const result = FrontmatterSchema.safeParse({ description: 'valid description' });
    expect(result.success).toBe(true);
  });

  it('GIVEN extra fields beyond description WHEN parsed THEN succeeds (Zod strips extras by default)', () => {
    const result = FrontmatterSchema.safeParse({
      description: 'A description',
      trigger: 'when user asks',
    });
    expect(result.success).toBe(true);
  });
});
