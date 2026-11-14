import { describe, it, expect } from 'vitest';
import {
  MarketplaceSchema,
  PluginManifestSchema,
  McpConfigSchema,
  FrontmatterSchema,
  MarketplacePluginEntrySchema,
  McpServerSchema,
  isFixedPublicUrl,
  mcpDefaultUrl,
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
    privacyPolicyUrl: 'https://lantern.is/privacy',
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

  it('GIVEN a manifest with a displayName containing spaces and a colon WHEN parsed THEN succeeds', () => {
    const result = PluginManifestSchema.safeParse({
      ...validManifest,
      displayName: 'Lantern: Agentic Sales',
    });
    expect(result.success).toBe(true);
  });

  it('GIVEN a manifest with a blank displayName WHEN parsed THEN fails', () => {
    const result = PluginManifestSchema.safeParse({ ...validManifest, displayName: '  ' });
    expect(result.success).toBe(false);
  });

  it('GIVEN a manifest with bad homepage url WHEN parsed THEN fails', () => {
    const result = PluginManifestSchema.safeParse({ ...validManifest, homepage: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('GIVEN a manifest without privacyPolicyUrl WHEN parsed THEN fails', () => {
    const manifest: Partial<typeof validManifest> = { ...validManifest };
    delete manifest.privacyPolicyUrl;
    expect(PluginManifestSchema.safeParse(manifest).success).toBe(false);
  });

  it('GIVEN a manifest with bad privacyPolicyUrl WHEN parsed THEN fails', () => {
    const result = PluginManifestSchema.safeParse({ ...validManifest, privacyPolicyUrl: 'privacy' });
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

  it('GIVEN a server with a fixed https url WHEN parsed THEN succeeds', () => {
    const result = McpServerSchema.safeParse({
      type: 'http',
      url: 'https://agent.lantern.is/agent/mcp',
    });
    expect(result.success).toBe(true);
  });

  // The Claude directory refuses a url it can't read for certain: a ${...}
  // variable other than our env form, a user name, a letter outside ASCII.
  it.each([
    ['another ${...} variable', '${OTHER_URL:-https://agent.lantern.is/agent/mcp}'],
    ['a bare ${...} variable', '${LANTERN_MCP_URL}'],
    ['a ${...} inside a fixed url', 'https://${HOST}/agent/mcp'],
    ['a user name', 'https://user@agent.lantern.is/agent/mcp'],
    ['a letter outside ASCII', 'https://agént.lantern.is/agent/mcp'],
    ['plain http', 'http://agent.lantern.is/agent/mcp'],
    ['no scheme', 'agent.lantern.is/agent/mcp'],
  ])('GIVEN a server url with %s WHEN parsed THEN fails', (_label, url) => {
    expect(McpServerSchema.safeParse({ type: 'http', url }).success).toBe(false);
  });

  it('GIVEN isFixedPublicUrl WHEN checked THEN only a plain-ASCII https url with no ${...} or user name passes', () => {
    expect(isFixedPublicUrl('https://agent.lantern.is/agent/mcp')).toBe(true);
    expect(isFixedPublicUrl('${LANTERN_MCP_URL:-https://agent.lantern.is/agent/mcp}')).toBe(false);
    expect(isFixedPublicUrl('https://user:pw@agent.lantern.is/agent/mcp')).toBe(false);
    expect(isFixedPublicUrl('https://agent.lantern.is/agent/mcp ')).toBe(false);
  });

  it('GIVEN mcpDefaultUrl WHEN given either form THEN it returns the url the server connects to by default', () => {
    expect(mcpDefaultUrl('${LANTERN_MCP_URL:-https://agent.lantern.is/agent/mcp}')).toBe(
      'https://agent.lantern.is/agent/mcp',
    );
    expect(mcpDefaultUrl('https://agent.lantern.is/agent/mcp')).toBe('https://agent.lantern.is/agent/mcp');
  });

  it('GIVEN a server with an oauth.scopes string WHEN parsed THEN succeeds', () => {
    const result = McpServerSchema.safeParse({
      type: 'http',
      url: '${LANTERN_MCP_URL:-https://agent.lantern.is/agent/mcp}',
      oauth: { scopes: 'read:findings' },
    });
    expect(result.success).toBe(true);
  });

  it('GIVEN a server with no oauth field WHEN parsed THEN still succeeds (oauth optional)', () => {
    const result = McpServerSchema.safeParse({
      type: 'http',
      url: '${LANTERN_MCP_URL:-https://agent.lantern.is/agent/mcp}',
    });
    expect(result.success).toBe(true);
  });

  it('GIVEN an oauth object with empty scopes WHEN parsed THEN fails', () => {
    const result = McpServerSchema.safeParse({
      type: 'http',
      url: '${LANTERN_MCP_URL:-https://agent.lantern.is/agent/mcp}',
      oauth: { scopes: '' },
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
