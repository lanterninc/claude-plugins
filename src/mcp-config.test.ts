import { describe, it, expect } from 'vitest';
import { PLUGINS, loadMcpConfig } from './repo.js';
import { McpConfigSchema, isFixedPublicUrl, mcpDefaultUrl } from './schemas.js';

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

      it(`GIVEN the lantern server url WHEN default path examined THEN it ends with /agent/mcp`, () => {
        const parsed = McpConfigSchema.parse(loadMcpConfig(plugin));
        expect(mcpDefaultUrl(parsed.mcpServers.lantern.url).endsWith('/agent/mcp')).toBe(true);
      });
    });
  }

  // The public plugin is the one submitted to the Claude directory, which
  // refuses a url with a ${...} variable, a user name or non-ASCII letters.
  it.runIf(PLUGINS.includes('lantern'))(
    'GIVEN the lantern plugin WHEN its url is read THEN it is the fixed public url on agent.lantern.is',
    () => {
      const { url } = McpConfigSchema.parse(loadMcpConfig('lantern')).mcpServers.lantern;
      expect(isFixedPublicUrl(url), `${url} is not a fixed public url`).toBe(true);
      expect(new URL(url).host).toBe('agent.lantern.is');
    },
  );

  it('GIVEN a config with type stdio WHEN parsed THEN the schema rejects it', () => {
    const result = McpConfigSchema.safeParse({
      mcpServers: {
        lantern: { type: 'stdio', url: 'https://agent.lantern.is/agent/mcp' },
      },
    });
    expect(result.success).toBe(false);
  });
});
