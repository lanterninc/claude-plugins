import { describe, it, expect } from 'vitest';
import { PLUGINS, loadMcpConfig } from './repo.js';
import { McpConfigSchema } from './schemas.js';

describe('mcp config files', () => {
  for (const plugin of PLUGINS) {
    describe(`plugins/${plugin}/.mcp.json`, () => {
      it(`GIVEN the config WHEN parsed THEN it matches the McpConfigSchema`, () => {
        const raw = loadMcpConfig(plugin);
        const result = McpConfigSchema.safeParse(raw);
        expect(result.success, result.error?.message).toBe(true);
      });

      it(`GIVEN the config WHEN servers enumerated THEN exactly one server keyed 'lantern' exists`, () => {
        const parsed = McpConfigSchema.parse(loadMcpConfig(plugin));
        const keys = Object.keys(parsed.mcpServers);
        expect(keys).toEqual(['lantern']);
      });

      it(`GIVEN the lantern server WHEN type read THEN it is 'http'`, () => {
        const parsed = McpConfigSchema.parse(loadMcpConfig(plugin));
        expect(parsed.mcpServers.lantern.type).toBe('http');
      });

      it(`GIVEN the lantern server url WHEN examined THEN it uses the LANTERN_MCP_URL env-var form`, () => {
        const parsed = McpConfigSchema.parse(loadMcpConfig(plugin));
        expect(parsed.mcpServers.lantern.url).toMatch(/^\$\{LANTERN_MCP_URL:-https?:\/\/.+\}$/);
      });

      it(`GIVEN the lantern server url WHEN default path examined THEN it ends with /agent/mcp`, () => {
        const parsed = McpConfigSchema.parse(loadMcpConfig(plugin));
        // Extract the default URL from ${LANTERN_MCP_URL:-<url>}
        const match = /\$\{LANTERN_MCP_URL:-(.+)\}$/.exec(parsed.mcpServers.lantern.url);
        expect(match).not.toBeNull();
        const defaultUrl = match?.[1] ?? '';
        expect(defaultUrl.endsWith('/agent/mcp')).toBe(true);
      });
    });
  }

  it.runIf(PLUGINS.includes('lantern'))(
    'GIVEN the lantern plugin WHEN default host parsed THEN it is exactly agent.lantern.is',
    () => {
      const parsed = McpConfigSchema.parse(loadMcpConfig('lantern'));
      const match = /\$\{LANTERN_MCP_URL:-(.+)\}$/.exec(parsed.mcpServers.lantern.url);
      const defaultUrl = match?.[1] ?? '';
      expect(new URL(defaultUrl).host).toBe('agent.lantern.is');
    },
  );

  it('GIVEN a config with a plain (non-env-var) url WHEN parsed THEN the schema rejects it', () => {
    const result = McpConfigSchema.safeParse({
      mcpServers: { lantern: { type: 'http', url: 'https://agent.lantern.is/agent/mcp' } },
    });
    expect(result.success).toBe(false);
  });

  it('GIVEN a config with type stdio WHEN parsed THEN the schema rejects it', () => {
    const result = McpConfigSchema.safeParse({
      mcpServers: {
        lantern: { type: 'stdio', url: '${LANTERN_MCP_URL:-https://agent.lantern.is/agent/mcp}' },
      },
    });
    expect(result.success).toBe(false);
  });
});
